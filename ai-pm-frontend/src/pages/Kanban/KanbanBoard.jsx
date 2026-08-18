import { useState, useCallback, useRef } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';

/*
  ═══════════════════════════════════════════════════════════════════
  CONCEPTS USED IN THIS FILE — READ BEFORE EDITING
  ═══════════════════════════════════════════════════════════════════

  1. HTML5 Drag-and-Drop API
     - onDragStart  → records WHICH card is being dragged (stored in a ref, not state)
     - onDragOver   → needed to call e.preventDefault() so the column becomes a valid drop target
     - onDrop       → moves the card from source column to target column immutably
     I did this coz the DnD API is zero-dependency (no @dnd-kit or react-beautiful-dnd),
     and a ref is faster than state for tracking drag metadata — state causes re-renders,
     a ref doesn't, so dragging feels instant.

  2. useRef for drag metadata
     dragMeta.current = { col, index }
     I did this coz the drag-start data only needs to be read at drop time, never rendered.
     Using useState here would trigger an unnecessary re-render on every dragstart.

  3. useCallback for event handlers
     All drag handlers are wrapped in useCallback with stable deps.
     I did this coz without useCallback, every parent re-render recreates these functions
     and passes new references to every card — causing all cards to re-render even when
     only one changed. With useCallback they stay referentially stable.

  4. Immutable state updates
     setColumns(prev => { ...spread, [col]: newArray }) — never mutating prev directly.
     I did this coz React's reconciler compares object references. Mutating the old object
     would make React think nothing changed → stale UI. A new object reference → correct diff.

  5. Derived data with no extra state
     totalTasks, donePct, etc. are computed from `columns` directly.
     I did this coz storing derived values in their own useState creates a "two sources of truth"
     bug — they can get out of sync. Compute them fresh on every render instead.

  6. Card detail modal — local UI state only
     The modal stores the selected card data in useState. No context, no Redux needed here
     because the modal is purely a read/edit popup scoped to this one component.

  7. Priority colour mapping as a constant object
     PRIORITY_META[priority] instead of a switch/if chain.
     I did this coz object lookups are O(1) and cleaner than if-else chains.
     Adding a new priority = adding one line to the object, not touching render logic.

  8. WIP (Work In Progress) limit
     Each column has an optional wip limit. If tasks.length >= wip the column header
     turns amber — a classic agile signal that the team is overloaded on that stage.
     I did this coz unlimited WIP is the #1 flow killer in agile — surfacing it visually
     makes the team aware without requiring a separate report.
  ═══════════════════════════════════════════════════════════════════
*/

/* ── Column configuration ──────────────────────────────────────────
   wip: max recommended tasks in that column (null = unlimited)
   I did this coz keeping column config outside the component means it never
   re-creates on render and can be imported/shared by other pages later. */
const COLUMNS_CONFIG = [
  { id: 'Backlog',       accent: '#6b7280', bg: 'rgba(107,114,128,0.09)', wip: null },
  { id: 'To Do',         accent: '#f59e0b', bg: 'rgba(245,158,11,0.09)',  wip: 5    },
  { id: 'In Progress',   accent: '#3b82f6', bg: 'rgba(59,130,246,0.09)',  wip: 3    },
  { id: 'Code Review',   accent: '#f97316', bg: 'rgba(249,115,22,0.09)',  wip: 2    },
  { id: 'Testing',       accent: '#a78bfa', bg: 'rgba(167,139,250,0.09)', wip: 3    },
  { id: 'Done',          accent: '#22c55e', bg: 'rgba(34,197,94,0.09)',   wip: null },
];

const PRIORITY_META = {
  High:   { color: '#ef4444', bg: 'rgba(239,68,68,0.15)',   label: '🔴 High'   },
  Medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.15)',  label: '🟡 Medium' },
  Low:    { color: '#22c55e', bg: 'rgba(34,197,94,0.15)',   label: '🟢 Low'    },
};

/* ── Seed data — each task is an object (not a plain string) ───────
   I did this coz strings can't hold priority/assignee/description.
   Giving each card a unique `id` is critical for React keys and DnD identity. */
const SEED_COLUMNS = {
  Backlog:       [
    { id: 't1', title: 'Setup CI/CD pipeline',      priority: 'High',   assignee: 'SR', desc: 'Configure GitHub Actions for auto-deploy.' },
    { id: 't2', title: 'Design DB schema',           priority: 'Medium', assignee: 'AM', desc: 'ERD for users, projects, sprints tables.'   },
  ],
  'To Do':       [
    { id: 't3', title: 'Build login page',           priority: 'High',   assignee: 'PS', desc: 'JWT auth, remember me, error states.'       },
    { id: 't4', title: 'Create API contracts',       priority: 'Medium', assignee: 'SR', desc: 'Swagger/OpenAPI spec for all endpoints.'     },
    { id: 't5', title: 'Write unit tests for auth',  priority: 'Low',    assignee: 'AJ', desc: 'Jest tests covering login + register flows.' },
  ],
  'In Progress': [
    { id: 't6', title: 'AI Story Generator endpoint',priority: 'High',   assignee: 'RV', desc: 'OpenAI GPT-4 integration for sprint stories.'},
  ],
  'Code Review': [
    { id: 't7', title: 'Sprint Planner logic',       priority: 'Medium', assignee: 'NK', desc: 'Velocity-based auto-assignment algorithm.'   },
  ],
  Testing:       [],
  Done:          [
    { id: 't8', title: 'Project scaffolding',        priority: 'Low',    assignee: 'SR', desc: 'Vite + React + ESLint initial setup.'        },
    { id: 't9', title: 'Folder structure',           priority: 'Low',    assignee: 'SR', desc: 'pages / components / context / hooks.'       },
  ],
};

/* ── Avatar helpers ────────────────────────────────────────────────*/
const AVATAR_COLORS = ['#7c3aed','#2563eb','#0891b2','#059669','#d97706','#dc2626','#db2777'];
function avatarBg(initials) {
  let h = 0;
  for (const c of initials) h = (h * 31 + c.charCodeAt(0)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[h];
}

/* ── Small reusable Avatar chip ────────────────────────────────────*/
function Avatar({ initials, size = 26 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: avatarBg(initials),
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.38, fontWeight: 700, color: '#fff',
      flexShrink: 0, userSelect: 'none',
      boxShadow: `0 0 0 2px ${avatarBg(initials)}44`,
    }}>{initials}</div>
  );
}

/* ── Card Detail Modal ─────────────────────────────────────────────
   I did this coz giving users a full-view popup avoids cramming
   all metadata into a tiny card — keeps the board clean. */
function CardModal({ card, colId, colAccent, onClose, onDelete, onPriorityChange }) {
  const pm = PRIORITY_META[card.priority];
  return (
    <div
      onClick={onClose}
      style={{ position:'fixed', inset:0, zIndex:2000, background:'rgba(0,0,0,0.7)',
        backdropFilter:'blur(6px)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background:'linear-gradient(145deg,#1e1033,#150c27)',
          border:`1px solid ${colAccent}55`, borderRadius:20, padding:'30px 32px',
          width:'100%', maxWidth:460, boxShadow:'0 30px 80px rgba(0,0,0,0.6)' }}
      >
        {/* header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
          <div style={{ flex:1, marginRight:12 }}>
            <div style={{ fontSize:11, fontWeight:700, color:colAccent, letterSpacing:1, textTransform:'uppercase', marginBottom:6 }}>
              {colId}
            </div>
            <h2 style={{ margin:0, fontSize:20, fontWeight:800, color:'#e5e0f0', lineHeight:1.3 }}>{card.title}</h2>
          </div>
          <button onClick={onClose} style={{
            background:'rgba(255,255,255,0.08)', border:'none', color:'#9d94b5',
            width:34, height:34, borderRadius:10, fontSize:18, cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center', padding:0, flexShrink:0,
          }}>×</button>
        </div>

        {/* description */}
        <div style={{ background:'rgba(255,255,255,0.04)', borderRadius:10, padding:'12px 14px', marginBottom:20, fontSize:14, color:'#c4b5fd', lineHeight:1.6 }}>
          {card.desc || 'No description added.'}
        </div>

        {/* meta row */}
        <div style={{ display:'flex', gap:12, alignItems:'center', marginBottom:24, flexWrap:'wrap' }}>
          <Avatar initials={card.assignee} size={32} />
          <span style={{ fontSize:13, color:'#9d94b5' }}>Assignee: <b style={{ color:'#e5e0f0' }}>{card.assignee}</b></span>

          {/* priority selector — i did this coz allowing edit from modal is
              faster UX than opening a full edit form */}
          <select
            value={card.priority}
            onChange={e => onPriorityChange(e.target.value)}
            style={{ marginLeft:'auto', background:'rgba(20,12,40,0.9)', border:`1px solid ${pm.color}55`,
              color: pm.color, borderRadius:8, padding:'5px 10px', fontSize:12, fontWeight:700,
              cursor:'pointer', outline:'none', colorScheme:'dark' }}
          >
            {Object.keys(PRIORITY_META).map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        {/* actions */}
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={onClose} style={{
            flex:1, padding:'10px', background:'rgba(255,255,255,0.07)',
            border:'1px solid rgba(167,139,250,0.2)', color:'#9d94b5', borderRadius:10, fontSize:13,
          }}>Close</button>
          <button onClick={onDelete} style={{
            flex:1, padding:'10px', background:'rgba(239,68,68,0.12)',
            border:'1px solid rgba(239,68,68,0.3)', color:'#fca5a5', borderRadius:10, fontSize:13, fontWeight:700,
          }}>🗑 Delete Task</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════ */
export default function KanbanBoard() {
  const [columns, setColumns] = useState(SEED_COLUMNS);
  const [newTask,      setNewTask]      = useState('');
  const [newPriority,  setNewPriority]  = useState('Medium');
  const [newAssignee,  setNewAssignee]  = useState('SR');
  const [activeCol,    setActiveCol]    = useState('To Do');
  const [selectedCard, setSelectedCard] = useState(null); // { card, colId }
  const [dragOverCol,  setDragOverCol]  = useState(null); // highlight drop target

  /* ── dragMeta ref — NOT state
     I did this coz we only need this value at drop time, not for rendering.
     Using state here would cause an extra re-render on every dragStart. */
  const dragMeta = useRef(null);

  /* ── Derived stats — computed, not stored
     I did this coz storing derived values in useState creates sync bugs. */
  const totalTasks = Object.values(columns).reduce((s, a) => s + a.length, 0);
  const doneTasks  = (columns['Done'] || []).length;
  const donePct    = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0;

  /* ── Add task ──────────────────────────────────────────────────── */
  const handleAdd = (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    const card = {
      id: `t${Date.now()}`,
      title: newTask.trim(),
      priority: newPriority,
      assignee: newAssignee.trim().toUpperCase().slice(0, 2) || 'ME',
      desc: '',
    };
    /* Immutable update — spread prev, override one key with new array
       I did this coz mutating prev[activeCol].push() would give React
       the same array reference → it bails out of re-render (stale UI). */
    setColumns(prev => ({ ...prev, [activeCol]: [...prev[activeCol], card] }));
    setNewTask('');
  };

  /* ── Drag handlers — useCallback for referential stability ────────
     I did this coz each KanbanCard gets these as props. Without useCallback,
     every board re-render creates new function references → all cards re-render.
     With useCallback the references stay stable → only changed cards re-render. */
  const handleDragStart = useCallback((colId, index) => {
    dragMeta.current = { colId, index };
  }, []);

  const handleDragOver = useCallback((e, colId) => {
    e.preventDefault(); // REQUIRED — without this, drop event never fires
    setDragOverCol(colId);
  }, []);

  const handleDrop = useCallback((targetColId) => {
    setDragOverCol(null);
    if (!dragMeta.current) return;
    const { colId: srcCol, index: srcIdx } = dragMeta.current;
    if (srcCol === targetColId) return; // same column → no-op

    setColumns(prev => {
      const srcCards = [...prev[srcCol]];
      const [moved]  = srcCards.splice(srcIdx, 1);           // remove from source
      const tgtCards = [...prev[targetColId], moved];        // append to target
      return { ...prev, [srcCol]: srcCards, [targetColId]: tgtCards };
    });
    dragMeta.current = null;
  }, []);

  const handleDragLeave = useCallback(() => setDragOverCol(null), []);

  /* ── Delete card ───────────────────────────────────────────────── */
  const handleDelete = useCallback((colId, cardId) => {
    setColumns(prev => ({ ...prev, [colId]: prev[colId].filter(c => c.id !== cardId) }));
    setSelectedCard(null);
  }, []);

  /* ── Update priority from modal ────────────────────────────────── */
  const handlePriorityChange = useCallback((colId, cardId, newP) => {
    setColumns(prev => ({
      ...prev,
      [colId]: prev[colId].map(c => c.id === cardId ? { ...c, priority: newP } : c),
    }));
    setSelectedCard(sc => sc ? { ...sc, card: { ...sc.card, priority: newP } } : null);
  }, []);

  return (
    <PageWrapper>

      {/* ── Header ───────────────────────────────────────────────── */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:16, marginBottom:24 }}>
        <div>
          <h1 style={{ margin:0, fontSize:26, fontWeight:800, color:'#c4b5fd', letterSpacing:-0.3 }}>Kanban Board</h1>
          <p style={{ margin:'5px 0 0', fontSize:13, color:'#9d94b5' }}>
            {totalTasks} tasks · {donePct}% complete
          </p>
        </div>

        {/* Progress bar — i did this coz a single % number is hard to feel;
            a visual bar gives instant gestalt of how far along the sprint is. */}
        <div style={{ display:'flex', flexDirection:'column', gap:6, minWidth:180 }}>
          <span style={{ fontSize:11, color:'#6b6880', textAlign:'right' }}>Sprint Progress</span>
          <div style={{ height:8, borderRadius:8, background:'rgba(255,255,255,0.08)', overflow:'hidden' }}>
            <div style={{
              height:'100%', borderRadius:8, width:`${donePct}%`,
              background:'linear-gradient(90deg,#7c3aed,#22c55e)',
              transition:'width 0.4s ease',
              /* transition here is safe — width changes only when a card moves to Done,
                 not on every keystroke, so the animation runs rarely and feels delightful */
            }} />
          </div>
        </div>
      </div>

      {/* ── Add Task Form ─────────────────────────────────────────── */}
      {/*
        I did this coz flex-wrap:wrap means on small screens the input goes
        full-width first, then select+button stack below it — no overflow.
        flex:'1 1 180px' on the input = grow freely but shrink before wrapping.
      */}
      <form onSubmit={handleAdd} style={{ display:'flex', gap:10, marginBottom:28, flexWrap:'wrap' }}>
        <input
          value={newTask}
          onChange={e => setNewTask(e.target.value)}
          placeholder="New task title…"
          style={{ flex:'1 1 180px', minWidth:0, padding:'10px 14px', fontSize:14,
            background:'rgba(255,255,255,0.06)', border:'1px solid rgba(167,139,250,0.3)',
            borderRadius:9, color:'#e5e0f0', outline:'none' }}
        />
        <select value={newPriority} onChange={e => setNewPriority(e.target.value)} style={sxSelect}>
          {Object.keys(PRIORITY_META).map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <input
          value={newAssignee}
          onChange={e => setNewAssignee(e.target.value)}
          placeholder="Initials (e.g. SR)"
          maxLength={2}
          style={{ ...sxSelect, width:90, flex:'0 0 auto', textTransform:'uppercase' }}
        />
        <select value={activeCol} onChange={e => setActiveCol(e.target.value)} style={sxSelect}>
          {COLUMNS_CONFIG.map(c => <option key={c.id} value={c.id}>{c.id}</option>)}
        </select>
        <button type="submit" style={{ padding:'10px 20px', fontSize:14, fontWeight:700, borderRadius:9, border:'none',
          background:'linear-gradient(135deg,#7c3aed,#9333ea)', color:'#fff',
          boxShadow:'0 6px 18px rgba(124,58,237,0.4)', cursor:'pointer', flexShrink:0 }}>
          + Add
        </button>
      </form>

      {/* ── Kanban Grid ───────────────────────────────────────────────
        CSS Grid with auto-fill + minmax — the single most important line.
        I did this coz:
          - auto-fill   → browser decides how many columns fit per row
          - minmax(240px,1fr) → each column ≥ 240px, grows equally if space allows
          - On 1440px wide area → 5 columns; on 900px → 3; on 480px → 1
          - Zero media queries needed — the math adapts automatically
      */}
      <div style={{
        display:'grid',
        gridTemplateColumns:'repeat(auto-fill, minmax(240px, 1fr))',
        gap:16,
        alignItems:'start',
        /* alignItems:start — without this all columns stretch to tallest column height.
           With it each column is only as tall as its content, which looks right. */
      }}>
        {COLUMNS_CONFIG.map(({ id: colId, accent, bg, wip }) => {
          const tasks    = columns[colId] || [];
          const wipHit   = wip !== null && tasks.length >= wip;
          const isDragTarget = dragOverCol === colId;

          return (
            <div
              key={colId}
              onDragOver={e  => handleDragOver(e, colId)}
              onDrop={()     => handleDrop(colId)}
              onDragLeave={handleDragLeave}
              style={{
                background: isDragTarget ? `${accent}18` : bg,
                border: isDragTarget
                  ? `2px solid ${accent}` /* solid border on hover = clear drop zone */
                  : '1px solid rgba(167,139,250,0.14)',
                borderRadius:14,
                padding:'14px 12px',
                display:'flex', flexDirection:'column', gap:0,
                transition:'border 0.15s, background 0.15s',
                /* transition on border/background only — not on layout props.
                   I did this coz transitioning layout props (width/height) causes
                   layout thrashing; color transitions are GPU composited & cheap. */
              }}
            >
              {/* Column header */}
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12, paddingBottom:10, borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ width:9, height:9, borderRadius:'50%', background: wipHit ? '#f59e0b' : accent, flexShrink:0,
                  /* WIP hit → dot turns amber to signal overload */
                  boxShadow: wipHit ? '0 0 8px #f59e0b' : `0 0 6px ${accent}88` }} />
                <span style={{ flex:1, fontWeight:700, fontSize:12, letterSpacing:0.6, textTransform:'uppercase', color: wipHit ? '#f59e0b' : accent }}>
                  {colId}
                </span>
                <span style={{ fontSize:11, fontWeight:700, padding:'2px 7px', borderRadius:20,
                  border:`1px solid ${wipHit ? '#f59e0b' : accent}`,
                  color: wipHit ? '#f59e0b' : accent,
                  /* WIP limit badge: shows "3/3" if at limit. I did this coz
                     seeing the number at capacity is a strong visual cue. */
                }}>
                  {tasks.length}{wip ? `/${wip}` : ''}
                </span>
              </div>

              {/* Cards */}
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {tasks.length === 0 ? (
                  /* Dashed empty state — the universal "drop here" affordance */
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                    padding:'22px 0', border:'1.5px dashed rgba(167,139,250,0.2)', borderRadius:8, color:'#6b6880' }}>
                    <span style={{ fontSize:20 }}>＋</span>
                    <span style={{ fontSize:11, marginTop:4 }}>Drop here</span>
                  </div>
                ) : (
                  tasks.map((card, idx) => {
                    const pm = PRIORITY_META[card.priority] || PRIORITY_META.Medium;
                    return (
                      <div
                        key={card.id}
                        draggable
                        onDragStart={() => handleDragStart(colId, idx)}
                        onClick={() => setSelectedCard({ card, colId })}
                        style={{
                          background:'rgba(255,255,255,0.045)',
                          border:'1px solid rgba(167,139,250,0.12)',
                          borderLeft:`3px solid ${accent}`,
                          /* left border = visual status indicator.
                             I did this coz colour on the left is the fastest way
                             to scan which column a card belongs to — like a sticky note flag. */
                          borderRadius:9,
                          padding:'10px 11px',
                          cursor:'grab',
                          transition:'transform 0.15s, box-shadow 0.15s',
                          userSelect:'none',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.transform   = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow   = `0 6px 20px rgba(0,0,0,0.35)`;
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.transform   = 'none';
                          e.currentTarget.style.boxShadow   = 'none';
                        }}
                      >
                        {/* Title */}
                        <p style={{ margin:'0 0 8px', fontSize:13, fontWeight:600, color:'#e5e0f0', lineHeight:1.4 }}>
                          {card.title}
                        </p>

                        {/* Footer row: priority badge + avatar + delete */}
                        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                          <span style={{ fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:20,
                            background:pm.bg, color:pm.color, letterSpacing:0.3 }}>
                            {pm.label}
                          </span>
                          <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:6 }}>
                            <Avatar initials={card.assignee} size={22} />
                            {/* Inline delete button — i did this coz making users
                                open a menu just to delete is two clicks too many. */}
                            <button
                              onClick={e => { e.stopPropagation(); handleDelete(colId, card.id); }}
                              title="Delete task"
                              style={{ background:'none', border:'none', color:'rgba(239,68,68,0.45)',
                                cursor:'pointer', fontSize:14, padding:'0 2px', lineHeight:1,
                                transition:'color 0.15s' }}
                              onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                              onMouseLeave={e => e.currentTarget.style.color = 'rgba(239,68,68,0.45)'}
                            >×</button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Card Detail Modal ─────────────────────────────────────── */}
      {selectedCard && (
        <CardModal
          card={selectedCard.card}
          colId={selectedCard.colId}
          colAccent={COLUMNS_CONFIG.find(c => c.id === selectedCard.colId)?.accent || '#a78bfa'}
          onClose={() => setSelectedCard(null)}
          onDelete={() => handleDelete(selectedCard.colId, selectedCard.card.id)}
          onPriorityChange={p => handlePriorityChange(selectedCard.colId, selectedCard.card.id, p)}
        />
      )}

    </PageWrapper>
  );
}

/* ── Shared select style ───────────────────────────────────────────
   Defined outside the component so it's created once, not on every render.
   I did this coz style objects created inside render are new references
   every time, which adds small but unnecessary GC pressure. */
const sxSelect = {
  flex:'0 0 auto', padding:'10px 12px', fontSize:13,
  background:'rgba(20,12,40,0.9)', border:'1px solid rgba(167,139,250,0.28)',
  borderRadius:9, color:'#e5e0f0', outline:'none', cursor:'pointer',
  colorScheme:'dark', /* dark native dropdown */
};