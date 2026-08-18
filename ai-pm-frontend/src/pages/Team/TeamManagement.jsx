import { useState, useMemo } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';

/* ─── Seed Data ────────────────────────────────────────────────── */
const SEED = [
  { id: 1, name: 'Samiran Roy',    role: 'Full Stack Dev',  email: 'samiran@pm.io',   sprint: 'Sprint 5', department: 'Engineering', availability: 'Available',  joined: '2024-01-10' },
  { id: 2, name: 'Priya Sharma',   role: 'Frontend Dev',    email: 'priya@pm.io',     sprint: 'Sprint 5', department: 'Engineering', availability: 'On Leave',   joined: '2024-02-14' },
  { id: 3, name: 'Arjun Mehta',    role: 'Product Manager', email: 'arjun@pm.io',     sprint: 'Sprint 4', department: 'Product',     availability: 'Available',  joined: '2023-11-05' },
  { id: 4, name: 'Nisha Kapoor',   role: 'UI/UX Designer',  email: 'nisha@pm.io',     sprint: 'Sprint 5', department: 'Design',      availability: 'Busy',       joined: '2024-03-20' },
  { id: 5, name: 'Rahul Verma',    role: 'DevOps Engineer', email: 'rahul@pm.io',     sprint: 'Sprint 3', department: 'Engineering', availability: 'Available',  joined: '2023-09-01' },
  { id: 6, name: 'Anjali Singh',   role: 'QA Engineer',     email: 'anjali@pm.io',    sprint: 'Sprint 5', department: 'QA',          availability: 'Available',  joined: '2024-04-11' },
];

const ROLES       = ['Full Stack Dev','Frontend Dev','Backend Dev','Product Manager','UI/UX Designer','DevOps Engineer','QA Engineer','Data Analyst','Scrum Master'];
const DEPARTMENTS = ['Engineering','Product','Design','QA','Data','Management'];
const SPRINTS     = ['Sprint 1','Sprint 2','Sprint 3','Sprint 4','Sprint 5','Sprint 6'];
const AVAIL       = ['Available','Busy','On Leave'];

const AVAIL_COLOR = { Available: '#22c55e', Busy: '#f59e0b', 'On Leave': '#ef4444' };
const DEPT_COLOR  = {
  Engineering: { bg: 'rgba(124,58,237,0.18)', text: '#c4b5fd' },
  Product:     { bg: 'rgba(59,130,246,0.18)',  text: '#93c5fd' },
  Design:      { bg: 'rgba(236,72,153,0.18)',  text: '#f9a8d4' },
  QA:          { bg: 'rgba(234,179,8,0.18)',   text: '#fde047' },
  Data:        { bg: 'rgba(20,184,166,0.18)',  text: '#5eead4' },
  Management:  { bg: 'rgba(249,115,22,0.18)',  text: '#fdba74' },
};

function initials(name) {
  return name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();
}
function avatarColor(name) {
  const colors = ['#7c3aed','#9333ea','#2563eb','#0891b2','#059669','#d97706','#dc2626','#db2777'];
  let h = 0; for (const c of name) h = (h * 31 + c.charCodeAt(0)) % colors.length;
  return colors[h];
}

const EMPTY = { name:'', role:'', email:'', sprint:'Sprint 5', department:'Engineering', availability:'Available', joined: new Date().toISOString().slice(0,10) };

/* ─── Stat Card ────────────────────────────────────────────────── */
function StatCard({ label, value, color }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.05)',
      border: `1px solid ${color}44`,
      borderRadius: 14,
      padding: '20px 24px',
      minWidth: 140,
      flex: '1 1 140px',
    }}>
      <div style={{ fontSize: 28, fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: 13, color: '#9d94b5', marginTop: 4 }}>{label}</div>
    </div>
  );
}

/* ─── Member Card ──────────────────────────────────────────────── */
function MemberCard({ member, onEdit, onRemove }) {
  const dc = DEPT_COLOR[member.department] || { bg: 'rgba(255,255,255,0.1)', text: '#e5e0f0' };
  return (
    <div style={{
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(167,139,250,0.18)',
      borderRadius: 16,
      padding: '22px 24px',
      display: 'flex',
      gap: 18,
      alignItems: 'flex-start',
      transition: 'border-color 0.2s, transform 0.2s',
      cursor: 'default',
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(167,139,250,0.45)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(167,139,250,0.18)'; e.currentTarget.style.transform = 'none'; }}
    >
      {/* Avatar */}
      <div style={{
        width: 52, height: 52, borderRadius: '50%',
        background: avatarColor(member.name),
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 700, fontSize: 18, color: '#fff', flexShrink: 0,
        boxShadow: `0 0 0 3px ${avatarColor(member.name)}44`,
      }}>{initials(member.name)}</div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 16, color: '#e5e0f0', marginBottom: 2, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{member.name}</div>
        <div style={{ fontSize: 13, color: '#9d94b5', marginBottom: 10 }}>{member.email}</div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: dc.bg, color: dc.text }}>
            {member.department}
          </span>
          <span style={{ fontSize: 12, fontWeight: 500, padding: '3px 10px', borderRadius: 20, background: 'rgba(255,255,255,0.07)', color: '#c4b5fd' }}>
            {member.role}
          </span>
          <span style={{ fontSize: 12, fontWeight: 500, padding: '3px 10px', borderRadius: 20, background: 'rgba(255,255,255,0.07)', color: '#a1a1aa' }}>
            {member.sprint}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: AVAIL_COLOR[member.availability], display: 'inline-block', boxShadow: `0 0 6px ${AVAIL_COLOR[member.availability]}` }} />
          <span style={{ fontSize: 12, color: AVAIL_COLOR[member.availability], fontWeight: 600 }}>{member.availability}</span>
          <span style={{ marginLeft: 'auto', fontSize: 11, color: '#6b6880' }}>Joined {member.joined}</span>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
        <button onClick={() => onEdit(member)} style={{
          background: 'rgba(124,58,237,0.18)', border: '1px solid rgba(167,139,250,0.3)',
          color: '#c4b5fd', padding: '6px 14px', fontSize: 12, borderRadius: 8, fontWeight: 600,
        }}>Edit</button>
        <button onClick={() => onRemove(member.id)} style={{
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
          color: '#fca5a5', padding: '6px 14px', fontSize: 12, borderRadius: 8, fontWeight: 600,
        }}>Remove</button>
      </div>
    </div>
  );
}

/* ─── Modal ────────────────────────────────────────────────────── */
function MemberModal({ member, onSave, onClose }) {
  const [form, setForm] = useState({ ...member });
  const [errors, setErrors] = useState({});

  const field = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.name.trim())  e.name  = 'Name is required';
    if (!form.role.trim())  e.role  = 'Role is required';
    if (!form.email.trim() || !/^[^@]+@[^@]+\.[^@]+$/.test(form.email)) e.email = 'Valid email required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => { if (validate()) onSave(form); };

  const inputStyle = (key) => ({
    width: '100%', padding: '10px 14px', fontSize: 14, borderRadius: 8,
    background: 'rgba(20,12,40,0.85)',
    border: `1px solid ${errors[key] ? '#ef4444' : 'rgba(167,139,250,0.3)'}`,
    color: '#e5e0f0', outline: 'none', colorScheme: 'dark',
  });
  const labelStyle = { fontSize: 12, fontWeight: 600, color: '#9d94b5', marginBottom: 6, display: 'block', letterSpacing: 0.4 };
  const selectStyle = {
    ...inputStyle(''),
    border: '1px solid rgba(167,139,250,0.3)',
    cursor: 'pointer',
    /* colorScheme:dark tells the browser to render the native <option> list dark too */
    colorScheme: 'dark',
    background: 'rgba(20,12,40,0.95)',
    color: '#e5e0f0',
    appearance: 'auto',
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }} onClick={onClose}>
      <div style={{
        background: 'linear-gradient(145deg, #1e1033, #150c27)',
        border: '1px solid rgba(167,139,250,0.3)',
        borderRadius: 20, padding: '32px 36px', width: '100%', maxWidth: 520,
        boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
        maxHeight: '90vh', overflowY: 'auto',
      }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#e5e0f0' }}>
              {member.id ? 'Edit Member' : 'Add Team Member'}
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b6880' }}>Fill in the details below</p>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.08)', border: 'none', color: '#9d94b5',
            width: 36, height: 36, borderRadius: 10, fontSize: 18, display: 'flex',
            alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0,
          }}>×</button>
        </div>

        {/* Avatar Preview */}
        {form.name && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, padding: '12px 16px', background: 'rgba(124,58,237,0.1)', borderRadius: 12, border: '1px solid rgba(124,58,237,0.2)' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: avatarColor(form.name), display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, color: '#fff' }}>
              {initials(form.name)}
            </div>
            <div>
              <div style={{ fontWeight: 600, color: '#e5e0f0', fontSize: 15 }}>{form.name || '—'}</div>
              <div style={{ fontSize: 12, color: '#9d94b5' }}>{form.role || 'No role set'}</div>
            </div>
          </div>
        )}

        {/* Form Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px 20px' }}>
          <div style={{ gridColumn: '1/-1' }}>
            <label style={labelStyle}>FULL NAME *</label>
            <input style={inputStyle('name')} value={form.name} onChange={e => field('name', e.target.value)} placeholder="e.g. Samiran Roy" />
            {errors.name && <span style={{ fontSize: 11, color: '#ef4444', marginTop: 4, display: 'block' }}>{errors.name}</span>}
          </div>

          <div style={{ gridColumn: '1/-1' }}>
            <label style={labelStyle}>EMAIL ADDRESS *</label>
            <input style={inputStyle('email')} value={form.email} onChange={e => field('email', e.target.value)} placeholder="e.g. name@company.com" type="email" />
            {errors.email && <span style={{ fontSize: 11, color: '#ef4444', marginTop: 4, display: 'block' }}>{errors.email}</span>}
          </div>

          <div>
            <label style={labelStyle}>ROLE *</label>
            <select style={selectStyle} value={form.role} onChange={e => field('role', e.target.value)}>
              <option value="">Select role…</option>
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            {errors.role && <span style={{ fontSize: 11, color: '#ef4444', marginTop: 4, display: 'block' }}>{errors.role}</span>}
          </div>

          <div>
            <label style={labelStyle}>DEPARTMENT</label>
            <select style={selectStyle} value={form.department} onChange={e => field('department', e.target.value)}>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div>
            <label style={labelStyle}>ASSIGNED SPRINT</label>
            <select style={selectStyle} value={form.sprint} onChange={e => field('sprint', e.target.value)}>
              {SPRINTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label style={labelStyle}>AVAILABILITY</label>
            <select style={selectStyle} value={form.availability} onChange={e => field('availability', e.target.value)}>
              {AVAIL.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>

          <div style={{ gridColumn: '1/-1' }}>
            <label style={labelStyle}>JOIN DATE</label>
            <input style={inputStyle('')} type="date" value={form.joined} onChange={e => field('joined', e.target.value)} />
          </div>
        </div>

        {/* Footer Buttons */}
        <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: '12px', background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(167,139,250,0.2)', color: '#9d94b5',
            borderRadius: 10, fontSize: 14, fontWeight: 600,
          }}>Cancel</button>
          <button onClick={handleSave} style={{
            flex: 2, padding: '12px',
            background: 'linear-gradient(135deg, #7c3aed, #9333ea)',
            border: 'none', color: '#fff', borderRadius: 10, fontSize: 14, fontWeight: 700,
            boxShadow: '0 8px 24px rgba(124,58,237,0.4)',
          }}>{member.id ? '✓ Save Changes' : '+ Add Member'}</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ────────────────────────────────────────────────── */
export default function TeamManagement() {
  const [members,    setMembers]    = useState(SEED);
  const [modal,      setModal]      = useState(null); // null | member-object
  const [search,     setSearch]     = useState('');
  const [filterDept, setFilterDept] = useState('All');
  const [filterAvail,setFilterAvail]= useState('All');
  const [confirmDel, setConfirmDel] = useState(null);

  /* ── derived stats ── */
  const stats = useMemo(() => ({
    total:     members.length,
    available: members.filter(m => m.availability === 'Available').length,
    busy:      members.filter(m => m.availability === 'Busy').length,
    onLeave:   members.filter(m => m.availability === 'On Leave').length,
  }), [members]);

  /* ── filtered list ── */
  const filtered = useMemo(() => members.filter(m => {
    const q = search.toLowerCase();
    const matchSearch = !q || m.name.toLowerCase().includes(q) || m.role.toLowerCase().includes(q) || m.email.toLowerCase().includes(q);
    const matchDept   = filterDept  === 'All' || m.department  === filterDept;
    const matchAvail  = filterAvail === 'All' || m.availability === filterAvail;
    return matchSearch && matchDept && matchAvail;
  }), [members, search, filterDept, filterAvail]);

  /* ── handlers ── */
  const openAdd  = () => setModal({ ...EMPTY });
  const openEdit = (m) => setModal({ ...m });
  const closeModal = () => setModal(null);

  const handleSave = (form) => {
    if (form.id) {
      setMembers(ms => ms.map(m => m.id === form.id ? { ...form } : m));
    } else {
      setMembers(ms => [...ms, { ...form, id: Date.now() }]);
    }
    setModal(null);
  };

  const handleRemove = (id) => { setConfirmDel(id); };
  const confirmRemove = () => { setMembers(ms => ms.filter(m => m.id !== confirmDel)); setConfirmDel(null); };

  const pillBtn = (active, label, onClick) => (
    <button onClick={onClick} style={{
      padding: '7px 16px', fontSize: 13, borderRadius: 20, fontWeight: 600,
      background: active ? 'linear-gradient(135deg,#7c3aed,#9333ea)' : 'rgba(255,255,255,0.07)',
      border: active ? 'none' : '1px solid rgba(167,139,250,0.2)',
      color: active ? '#fff' : '#9d94b5', boxShadow: active ? '0 4px 14px rgba(124,58,237,0.35)' : 'none',
    }}>{label}</button>
  );

  return (
    <PageWrapper>
      {/* ── Page Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: '#e5e0f0', letterSpacing: -0.5 }}>Team Management</h1>
          <p style={{ margin: '6px 0 0', fontSize: 14, color: '#6b6880' }}>{members.length} members across {[...new Set(members.map(m=>m.department))].length} departments</p>
        </div>
        <button onClick={openAdd} style={{
          padding: '11px 22px', fontSize: 14, fontWeight: 700, borderRadius: 12,
          background: 'linear-gradient(135deg,#7c3aed,#9333ea)',
          boxShadow: '0 8px 24px rgba(124,58,237,0.4)',
          display: 'flex', alignItems: 'center', gap: 8, border: 'none', color: '#fff',
        }}>
          <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Add Member
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 28 }}>
        <StatCard label="Total Members"  value={stats.total}     color="#a78bfa" />
        <StatCard label="Available"      value={stats.available} color="#22c55e" />
        <StatCard label="Busy"           value={stats.busy}      color="#f59e0b" />
        <StatCard label="On Leave"       value={stats.onLeave}   color="#ef4444" />
      </div>

      {/* ── Search + Filters ── */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24, alignItems: 'center' }}>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="🔍  Search by name, role or email…"
          style={{ flex: '1 1 240px', padding: '10px 16px', fontSize: 14, borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(167,139,250,0.25)', color: '#e5e0f0' }}
        />
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['All', ...DEPARTMENTS].map(d => pillBtn(filterDept === d, d, () => setFilterDept(d)))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['All', ...AVAIL].map(a => pillBtn(filterAvail === a, a, () => setFilterAvail(a)))}
        </div>
      </div>

      {/* ── Member Grid ── */}
      {filtered.length === 0
        ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6b6880' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>👥</div>
            <div style={{ fontSize: 16 }}>No members match your filters.</div>
          </div>
        )
        : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 16 }}>
            {filtered.map(m => (
              <MemberCard key={m.id} member={m} onEdit={openEdit} onRemove={handleRemove} />
            ))}
          </div>
        )
      }

      {/* ── Add / Edit Modal ── */}
      {modal && <MemberModal member={modal} onSave={handleSave} onClose={closeModal} />}

      {/* ── Delete Confirm ── */}
      {confirmDel && (
        <div style={{ position:'fixed', inset:0, zIndex:1100, background:'rgba(0,0,0,0.7)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center' }}
          onClick={() => setConfirmDel(null)}>
          <div style={{ background:'#1e1033', border:'1px solid rgba(239,68,68,0.3)', borderRadius:16, padding:'30px 36px', maxWidth:380, textAlign:'center', boxShadow:'0 24px 60px rgba(0,0,0,0.5)' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ fontSize:36, marginBottom:12 }}>⚠️</div>
            <h3 style={{ margin:'0 0 8px', color:'#e5e0f0' }}>Remove Member?</h3>
            <p style={{ color:'#9d94b5', fontSize:14, margin:'0 0 24px' }}>This action cannot be undone.</p>
            <div style={{ display:'flex', gap:12 }}>
              <button onClick={() => setConfirmDel(null)} style={{ flex:1, padding:'10px', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)', color:'#9d94b5', borderRadius:10 }}>Cancel</button>
              <button onClick={confirmRemove} style={{ flex:1, padding:'10px', background:'linear-gradient(135deg,#dc2626,#b91c1c)', border:'none', color:'#fff', borderRadius:10, fontWeight:700 }}>Yes, Remove</button>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}