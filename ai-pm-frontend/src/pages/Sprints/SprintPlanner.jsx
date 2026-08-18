import { useState, useMemo } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';

/*
  ═══════════════════════════════════════════════════════════════
  SPRINT PLANNER — READ THIS BEFORE EDITING
  ═══════════════════════════════════════════════════════════════

  WHAT CHANGED FROM THE OLD VERSION:
  Old: 1 sprint card with plain text paragraphs, no real data.
  New: Full agile sprint management system.

  SECTIONS:
  1. Header          — title, "+ New Sprint" button, sprint counter
  2. Velocity Chart  — pure CSS bars showing story points per sprint
                       (no library — just div widths as % of max velocity)
  3. Sprint Cards    — rich card per sprint with:
                         • Status badge + colour
                         • Progress bar (committed / capacity)
                         • Overcommitment warning if committed > capacity
                         • Days remaining (live from today's date)
                         • Task list with add/complete/delete
                         • Expand/collapse tasks section
  4. Create Sprint Modal — full form with validation

  CONCEPTS IN THIS FILE:
  ─ useMemo         → derive velocity chart data from sprint array once
  ─ useState        → local UI state (modal open, expand state, tasks)
  ─ Derived metrics → daysLeft, pct, overCommitted all computed inline
                      from the sprint object — never stored separately
  ─ Immutable updates → always spread prev state, never mutate directly
  ─ Style objects    → defined outside component so they're created once
  ─ colorScheme:dark → ensures native select/date pickers render dark
  ═══════════════════════════════════════════════════════════════
*/

/* ── Status config ─────────────────────────────────────────────── */
const STATUS = {
  'Not Started': { color:'#94a3b8', bg:'rgba(148,163,184,0.14)' },
  'In Progress': { color:'#c4b5fd', bg:'rgba(196,181,253,0.14)' },
  'Completed':   { color:'#22c55e', bg:'rgba(34,197,94,0.14)'   },
  'Blocked':     { color:'#ef4444', bg:'rgba(239,68,68,0.14)'   },
};

/* ── Seed sprints ───────────────────────────────────────────────── */
const SEED = [
  { id:1, name:'Sprint 3', goal:'Build auth & project scaffolding', startDate:'2026-07-14', endDate:'2026-07-28', capacity:38, committed:36, status:'Completed', velocity:36, tasks:[{ id:'ts1', text:'Project setup',       done:true },{ id:'ts2', text:'Auth pages',         done:true },{ id:'ts3', text:'DB schema design',   done:true }] },
  { id:2, name:'Sprint 4', goal:'Kanban board + Sprint planner logic', startDate:'2026-07-28', endDate:'2026-08-11', capacity:40, committed:38, status:'Completed', velocity:35, tasks:[{ id:'ts4', text:'Kanban drag-and-drop', done:true },{ id:'ts5', text:'Sprint planner UI',   done:true },{ id:'ts6', text:'API contracts',       done:true }] },
  { id:3, name:'Sprint 5', goal:'Ship AI integrations & dashboard', startDate:'2026-08-11', endDate:'2026-08-25', capacity:42, committed:42, status:'In Progress', velocity:null, tasks:[{ id:'ts7', text:'AI Story Generator',  done:true },{ id:'ts8', text:'Dashboard rebuild',  done:false },{ id:'ts9', text:'Reports page',       done:false },{ id:'ts10',text:'Team management',    done:false }] },
  { id:4, name:'Sprint 6', goal:'Mobile responsiveness & polish', startDate:'2026-08-25', endDate:'2026-09-08', capacity:40, committed:20, status:'Not Started', velocity:null, tasks:[] },
];

const EMPTY_FORM = { name:'', goal:'', startDate:'', endDate:'', capacity:'', committed:'', status:'Not Started' };

/* ── Helpers ───────────────────────────────────────────────────── */
const fmtDate = d => new Date(d).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });
const daysLeft = (end) => Math.ceil((new Date(end) - new Date()) / 86400000);

/* ── Velocity Bar (pure CSS) ───────────────────────────────────── */
function VelocityChart({ sprints }) {
  // Only completed sprints have a real velocity number
  const data = sprints.filter(s => s.velocity !== null);
  if (data.length === 0) return null;
  const max = Math.max(...data.map(s => s.velocity), 1);
  const avg = Math.round(data.reduce((s, sp) => s + sp.velocity, 0) / data.length);

  return (
    <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(167,139,250,0.15)', borderRadius:14, padding:'20px 24px', marginBottom:24 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, flexWrap:'wrap', gap:8 }}>
        <div style={{ fontSize:14, fontWeight:700, color:'#c4b5fd' }}>⚡ Sprint Velocity History</div>
        <div style={{ fontSize:12, color:'#6b6880' }}>Avg: <b style={{ color:'#a78bfa' }}>{avg} pts</b></div>
      </div>
      {/*
        Pure CSS velocity bars — each bar's height is (velocity / max) * 100%
        WHY no chart library: recharts adds ~300KB. For a simple bar chart
        divs with % heights do exactly the same job at zero bundle cost.
      */}
      <div style={{ display:'flex', gap:16, alignItems:'flex-end', height:80 }}>
        {data.map(s => (
          <div key={s.id} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
            <span style={{ fontSize:11, color:'#a78bfa', fontWeight:700 }}>{s.velocity}</span>
            <div style={{ width:'100%', borderRadius:'6px 6px 0 0', background:'linear-gradient(180deg,#7c3aed,#9333ea)', height:`${(s.velocity/max)*60}px`, minHeight:4, transition:'height 0.5s ease', boxShadow:'0 0 10px rgba(124,58,237,0.3)' }} />
            <span style={{ fontSize:10, color:'#6b6880', whiteSpace:'nowrap' }}>{s.name}</span>
          </div>
        ))}
        {/* Average line reference */}
        <div style={{ position:'relative', flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
          <span style={{ fontSize:11, color:'#f59e0b', fontWeight:700 }}>Avg</span>
          <div style={{ width:'100%', borderRadius:'6px 6px 0 0', background:'rgba(245,158,11,0.2)', border:'2px dashed #f59e0b55', height:`${(avg/max)*60}px`, minHeight:4 }} />
          <span style={{ fontSize:10, color:'#6b6880' }}>{avg} pts</span>
        </div>
      </div>
    </div>
  );
}

/* ── Create Sprint Modal ──────────────────────────────────────── */
function CreateModal({ onClose, onCreate }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [err,  setErr]  = useState('');
  const f = (k,v) => setForm(p=>({...p,[k]:v}));

  const submit = () => {
    if (!form.name.trim())   { setErr('Sprint name is required.'); return; }
    if (!form.goal.trim())   { setErr('Sprint goal is required.'); return; }
    if (!form.startDate)     { setErr('Start date is required.'); return; }
    if (!form.endDate)       { setErr('End date is required.'); return; }
    if (form.endDate <= form.startDate) { setErr('End date must be after start date.'); return; }
    onCreate({ ...form, id:Date.now(), capacity:Number(form.capacity)||40, committed:Number(form.committed)||0, velocity:null, tasks:[] });
    onClose();
  };

  const inp = { width:'100%', padding:'10px 13px', fontSize:14, borderRadius:9, background:'rgba(20,12,40,0.9)', border:'1px solid rgba(167,139,250,0.28)', color:'#e5e0f0', outline:'none', boxSizing:'border-box', colorScheme:'dark' };
  const lbl = { fontSize:11, fontWeight:700, color:'#9d94b5', letterSpacing:0.5, marginBottom:6, display:'block' };

  return (
    <div onClick={onClose} style={{ position:'fixed',inset:0,zIndex:2000,background:'rgba(0,0,0,0.7)',backdropFilter:'blur(6px)',display:'flex',alignItems:'center',justifyContent:'center',padding:20 }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:'linear-gradient(145deg,#1e1033,#150c27)',border:'1px solid rgba(167,139,250,0.3)',borderRadius:20,padding:'30px 32px',width:'100%',maxWidth:500,boxShadow:'0 30px 80px rgba(0,0,0,0.6)',maxHeight:'90vh',overflowY:'auto' }}>
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24 }}>
          <h2 style={{ margin:0,fontSize:20,fontWeight:800,color:'#e5e0f0' }}>New Sprint</h2>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.08)',border:'none',color:'#9d94b5',width:34,height:34,borderRadius:10,fontSize:18,cursor:'pointer' }}>×</button>
        </div>
        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px 18px' }}>
          <div><label style={lbl}>SPRINT NAME *</label><input style={inp} value={form.name} onChange={e=>f('name',e.target.value)} placeholder="e.g. Sprint 6" /></div>
          <div><label style={lbl}>STATUS</label>
            <select style={{ ...inp, cursor:'pointer' }} value={form.status} onChange={e=>f('status',e.target.value)}>
              {Object.keys(STATUS).map(s=><option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div style={{ gridColumn:'1/-1' }}><label style={lbl}>SPRINT GOAL *</label><input style={inp} value={form.goal} onChange={e=>f('goal',e.target.value)} placeholder="What does this sprint aim to ship?" /></div>
          <div><label style={lbl}>START DATE *</label><input style={inp} type="date" value={form.startDate} onChange={e=>f('startDate',e.target.value)} /></div>
          <div><label style={lbl}>END DATE *</label><input style={inp} type="date" value={form.endDate} onChange={e=>f('endDate',e.target.value)} /></div>
          <div><label style={lbl}>CAPACITY (pts)</label><input style={inp} type="number" min="0" value={form.capacity} onChange={e=>f('capacity',e.target.value)} placeholder="e.g. 40" /></div>
          <div><label style={lbl}>COMMITTED (pts)</label><input style={inp} type="number" min="0" value={form.committed} onChange={e=>f('committed',e.target.value)} placeholder="e.g. 36" /></div>
        </div>
        {err && <p style={{ color:'#ef4444',fontSize:12,margin:'12px 0 0' }}>{err}</p>}
        <div style={{ display:'flex',gap:10,marginTop:22 }}>
          <button onClick={onClose} style={{ flex:1,padding:'11px',background:'rgba(255,255,255,0.07)',border:'1px solid rgba(167,139,250,0.2)',color:'#9d94b5',borderRadius:10,fontSize:13,cursor:'pointer' }}>Cancel</button>
          <button onClick={submit}  style={{ flex:2,padding:'11px',background:'linear-gradient(135deg,#7c3aed,#9333ea)',border:'none',color:'#fff',borderRadius:10,fontSize:14,fontWeight:700,cursor:'pointer',boxShadow:'0 6px 20px rgba(124,58,237,0.4)' }}>Create Sprint</button>
        </div>
      </div>
    </div>
  );
}

/* ── Sprint Card ───────────────────────────────────────────────── */
function SprintCard({ sprint, onDelete, onAddTask, onToggleTask, onDeleteTask }) {
  const [expanded, setExpanded] = useState(sprint.status === 'In Progress');
  const [taskInput, setTaskInput] = useState('');

  const sm  = STATUS[sprint.status] || STATUS['Not Started'];
  const pct = sprint.capacity > 0 ? Math.min(100, Math.round((sprint.committed / sprint.capacity) * 100)) : 0;
  const dl  = daysLeft(sprint.endDate);
  // Overcommitted = team promised more than they can deliver
  // WHY we show this: it's the #1 sprint planning mistake in agile teams
  const overCommitted = sprint.committed > sprint.capacity;
  const tasksDone = sprint.tasks.filter(t=>t.done).length;
  const taskTotal = sprint.tasks.length;

  const addTask = () => {
    if (!taskInput.trim()) return;
    onAddTask(sprint.id, taskInput.trim());
    setTaskInput('');
  };

  return (
    <div style={{ background:'rgba(255,255,255,0.045)', border:`1px solid ${sm.color}33`, borderRadius:16, padding:'22px 24px', marginBottom:16, transition:'border-color 0.2s' }}
      onMouseEnter={e=>e.currentTarget.style.borderColor=sm.color+'66'}
      onMouseLeave={e=>e.currentTarget.style.borderColor=sm.color+'33'}>

      {/* Top row */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10, flexWrap:'wrap', gap:10 }}>
        <div style={{ flex:1 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
            <h3 style={{ margin:0, fontSize:18, fontWeight:800, color:'#e5e0f0' }}>{sprint.name}</h3>
            <span style={{ fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:20, background:sm.bg, color:sm.color }}>{sprint.status}</span>
            {overCommitted && <span style={{ fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:20, background:'rgba(239,68,68,0.15)', color:'#ef4444' }}>⚠️ Over-committed</span>}
          </div>
          <p style={{ margin:'5px 0 0', fontSize:13, color:'#9d94b5' }}>🎯 {sprint.goal}</p>
        </div>
        <button onClick={()=>onDelete(sprint.id)} style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)', color:'#fca5a5', padding:'6px 12px', borderRadius:8, fontSize:12, cursor:'pointer', fontWeight:600, flexShrink:0 }}>🗑 Delete</button>
      </div>

      {/* Dates + days remaining */}
      <div style={{ display:'flex', gap:18, fontSize:12, color:'#6b6880', marginBottom:14, flexWrap:'wrap' }}>
        <span>📅 {fmtDate(sprint.startDate)} → {fmtDate(sprint.endDate)}</span>
        {sprint.status !== 'Completed' && sprint.status !== 'Not Started' && (
          <span style={{ color: dl <= 3 ? '#ef4444' : dl <= 7 ? '#f59e0b' : '#22c55e', fontWeight:700 }}>
            {dl > 0 ? `${dl} days left` : dl === 0 ? 'Ends today!' : `${Math.abs(dl)} days overdue`}
          </span>
        )}
        {sprint.velocity && <span style={{ color:'#a78bfa' }}>⚡ Velocity: {sprint.velocity} pts</span>}
      </div>

      {/* Capacity progress bar
          WHY: Capacity vs Committed is the key sprint health signal.
          At 100% = fully loaded. Over 100% = overcommitted = risk. */}
      <div style={{ marginBottom:14 }}>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'#9d94b5', marginBottom:5 }}>
          <span>Committed {sprint.committed} / Capacity {sprint.capacity} pts</span>
          <span style={{ color: overCommitted?'#ef4444': pct>=90?'#f59e0b':'#c4b5fd', fontWeight:700 }}>{pct}%</span>
        </div>
        <div style={{ height:7, borderRadius:7, background:'rgba(255,255,255,0.08)', overflow:'hidden' }}>
          <div style={{ height:'100%', width:`${Math.min(pct,100)}%`, borderRadius:7, background: overCommitted?'linear-gradient(90deg,#ef4444,#dc2626)':pct>=90?'linear-gradient(90deg,#f59e0b,#d97706)':'linear-gradient(90deg,#7c3aed,#a78bfa)', transition:'width 0.5s ease' }} />
        </div>
      </div>

      {/* Tasks section (collapsible) */}
      <div>
        <button onClick={()=>setExpanded(e=>!e)} style={{ background:'none', border:'none', color:'#9d94b5', fontSize:12, fontWeight:600, cursor:'pointer', padding:0, display:'flex', alignItems:'center', gap:6, marginBottom:expanded?12:0 }}>
          <span style={{ fontSize:10, display:'inline-block', transform: expanded?'rotate(90deg)':'rotate(0deg)', transition:'transform 0.2s' }}>▶</span>
          Tasks ({tasksDone}/{taskTotal} done)
        </button>

        {expanded && (
          <div>
            {/* Add task inline */}
            <div style={{ display:'flex', gap:8, marginBottom:10 }}>
              <input value={taskInput} onChange={e=>setTaskInput(e.target.value)}
                onKeyDown={e=>e.key==='Enter'&&addTask()}
                placeholder="Add a task… (Enter)" style={{ flex:1, padding:'8px 12px', fontSize:13, borderRadius:8, background:'rgba(20,12,40,0.8)', border:'1px solid rgba(167,139,250,0.25)', color:'#e5e0f0', outline:'none' }} />
              <button onClick={addTask} style={{ padding:'8px 14px', fontSize:12, fontWeight:700, borderRadius:8, background:'linear-gradient(135deg,#7c3aed,#9333ea)', border:'none', color:'#fff', cursor:'pointer' }}>+</button>
            </div>

            {/* Task list */}
            {taskTotal === 0
              ? <div style={{ fontSize:12, color:'#6b6880', padding:'8px 0' }}>No tasks yet — add one above.</div>
              : sprint.tasks.map(t=>(
                <div key={t.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 10px', borderRadius:8, marginBottom:5, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(167,139,250,0.08)' }}>
                  {/* Checkbox toggle */}
                  <div onClick={()=>onToggleTask(sprint.id, t.id)} style={{ width:18, height:18, borderRadius:5, border:`2px solid ${t.done?'#22c55e':'rgba(167,139,250,0.4)'}`, background:t.done?'#22c55e':'transparent', cursor:'pointer', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, color:'#fff', transition:'all 0.15s' }}>
                    {t.done && '✓'}
                  </div>
                  <span style={{ flex:1, fontSize:13, color:t.done?'#6b6880':'#d6d0e6', textDecoration:t.done?'line-through':'none', transition:'color 0.15s' }}>{t.text}</span>
                  <button onClick={()=>onDeleteTask(sprint.id, t.id)} style={{ background:'none', border:'none', color:'rgba(239,68,68,0.4)', cursor:'pointer', fontSize:14, padding:'0 2px', lineHeight:1 }}
                    onMouseEnter={e=>e.currentTarget.style.color='#ef4444'}
                    onMouseLeave={e=>e.currentTarget.style.color='rgba(239,68,68,0.4)'}>×</button>
                </div>
              ))
            }
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function SprintPlanner() {
  const [sprints,    setSprints]    = useState(SEED);
  const [showModal,  setShowModal]  = useState(false);
  const [filterSt,   setFilterSt]   = useState('All');

  /* useMemo — compute summary stats from sprint array.
     WHY: These are derived values. Storing them in useState
     creates a second source of truth that can get out of sync.
     Compute fresh from the single source (sprints array). */
  const stats = useMemo(() => ({
    total:      sprints.length,
    active:     sprints.filter(s=>s.status==='In Progress').length,
    completed:  sprints.filter(s=>s.status==='Completed').length,
    totalPts:   sprints.filter(s=>s.velocity).reduce((a,s)=>a+s.velocity,0),
  }), [sprints]);

  const filtered = useMemo(() =>
    filterSt === 'All' ? sprints : sprints.filter(s=>s.status===filterSt),
    [sprints, filterSt]);

  /* Immutable sprint handlers
     WHY immutable: mutating the array directly gives React the same reference
     → it bails on re-render → stale UI. New array reference = correct diff. */
  const handleCreate     = (s)           => setSprints(p=>[...p, s]);
  const handleDelete     = (id)          => setSprints(p=>p.filter(s=>s.id!==id));
  const handleAddTask    = (sid, text)   => setSprints(p=>p.map(s=>s.id===sid?{ ...s, tasks:[...s.tasks,{ id:`t${Date.now()}`, text, done:false }] }:s));
  const handleToggleTask = (sid, tid)    => setSprints(p=>p.map(s=>s.id===sid?{ ...s, tasks:s.tasks.map(t=>t.id===tid?{...t,done:!t.done}:t) }:s));
  const handleDeleteTask = (sid, tid)    => setSprints(p=>p.map(s=>s.id===sid?{ ...s, tasks:s.tasks.filter(t=>t.id!==tid) }:s));

  const pill = (active, label, onClick) => (
    <button onClick={onClick} style={{ padding:'7px 14px', fontSize:12, fontWeight:600, borderRadius:20, cursor:'pointer', background:active?'linear-gradient(135deg,#7c3aed,#9333ea)':'rgba(255,255,255,0.07)', border:active?'none':'1px solid rgba(167,139,250,0.2)', color:active?'#fff':'#9d94b5', transition:'all 0.15s' }}>
      {label}
    </button>
  );

  return (
    <PageWrapper>

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:16, marginBottom:24 }}>
        <div>
          <h1 style={{ margin:0, fontSize:28, fontWeight:800, color:'#e5e0f0', letterSpacing:-0.5 }}>Sprint Planner</h1>
          <p style={{ margin:'5px 0 0', fontSize:13, color:'#6b6880' }}>{stats.total} sprints · {stats.active} active · {stats.totalPts} pts shipped</p>
        </div>
        <button onClick={()=>setShowModal(true)} style={{ padding:'11px 22px', fontSize:14, fontWeight:700, borderRadius:12, background:'linear-gradient(135deg,#7c3aed,#9333ea)', border:'none', color:'#fff', cursor:'pointer', boxShadow:'0 8px 24px rgba(124,58,237,0.4)' }}>
          + New Sprint
        </button>
      </div>

      {/* Stat strip */}
      <div style={{ display:'flex', gap:14, flexWrap:'wrap', marginBottom:24 }}>
        {[
          { label:'Total Sprints',   value:stats.total,     color:'#a78bfa' },
          { label:'In Progress',     value:stats.active,    color:'#c4b5fd' },
          { label:'Completed',       value:stats.completed, color:'#22c55e' },
          { label:'Total Pts Shipped', value:stats.totalPts, color:'#f59e0b' },
        ].map(s=>(
          <div key={s.label} style={{ flex:'1 1 120px', background:'rgba(255,255,255,0.05)', border:`1px solid ${s.color}33`, borderRadius:14, padding:'16px 20px' }}>
            <div style={{ fontSize:24, fontWeight:800, color:s.color }}>{s.value}</div>
            <div style={{ fontSize:12, color:'#9d94b5', marginTop:3 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Velocity chart */}
      <VelocityChart sprints={sprints} />

      {/* Filter pills */}
      <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:20 }}>
        {['All', ...Object.keys(STATUS)].map(s => pill(filterSt===s, s, ()=>setFilterSt(s)))}
      </div>

      {/* Sprint cards */}
      {filtered.length === 0
        ? <div style={{ textAlign:'center', padding:'60px 20px', color:'#6b6880' }}><div style={{ fontSize:40, marginBottom:10 }}>🚀</div><div>No sprints match this filter.</div></div>
        : filtered.map(s=>(
          <SprintCard
            key={s.id} sprint={s}
            onDelete={handleDelete}
            onAddTask={handleAddTask}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
          />
        ))
      }

      {showModal && <CreateModal onClose={()=>setShowModal(false)} onCreate={handleCreate} />}
    </PageWrapper>
  );
}