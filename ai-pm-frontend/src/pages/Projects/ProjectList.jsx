import { useState, useMemo } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';

const STATUS_META = {
  Active:    { color: '#22c55e', bg: 'rgba(34,197,94,0.15)'    },
  Planning:  { color: '#f59e0b', bg: 'rgba(245,158,11,0.15)'   },
  'On Hold': { color: '#ef4444', bg: 'rgba(239,68,68,0.15)'    },
  Completed: { color: '#a78bfa', bg: 'rgba(167,139,250,0.15)'  },
};
const PRIORITY_META = {
  High:   { color: '#ef4444', bg: 'rgba(239,68,68,0.13)'   },
  Medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.13)'  },
  Low:    { color: '#22c55e', bg: 'rgba(34,197,94,0.13)'   },
};
const AVATAR_COLORS = ['#7c3aed','#2563eb','#0891b2','#059669','#d97706','#dc2626','#db2777','#9333ea'];
const avColor = (s) => { let h=0; for(const c of s) h=(h*31+c.charCodeAt(0))%AVATAR_COLORS.length; return AVATAR_COLORS[h]; };
const initials = (n) => n.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();

const SEED = [
  { id:1, name:'AI PM System',           status:'Active',    priority:'High',   desc:'End-to-end AI-powered project management platform.',   progress:68, members:[{name:'Samiran Roy',email:'samiran@pm.io',role:'Lead Dev'},{name:'Priya Sharma',email:'priya@pm.io',role:'Frontend'}], deadline:'2026-10-15', tasks:24, done:16 },
  { id:2, name:'Client Portal Revamp',   status:'Planning',  priority:'Medium', desc:'Complete UI/UX overhaul of the existing client portal.', progress:22, members:[{name:'Arjun Mehta',email:'arjun@pm.io',role:'PM'},{name:'Nisha Kapoor',email:'nisha@pm.io',role:'Designer'}], deadline:'2026-11-30', tasks:18, done:4  },
  { id:3, name:'Internal DevOps Tools',  status:'Active',    priority:'Low',    desc:'Automation scripts and monitoring dashboards.',          progress:45, members:[{name:'Rahul Verma',email:'rahul@pm.io',role:'DevOps'}], deadline:'2026-09-01', tasks:11, done:5  },
  { id:4, name:'Mobile App MVP',         status:'On Hold',   priority:'High',   desc:'React Native app — on hold pending budget approval.',   progress:10, members:[{name:'Anjali Singh',email:'anjali@pm.io',role:'QA'}], deadline:'2027-01-20', tasks:30, done:3  },
  { id:5, name:'Analytics Dashboard',    status:'Completed', priority:'Medium', desc:'Data analytics and reporting module — shipped!',         progress:100,members:[{name:'Samiran Roy',email:'samiran@pm.io',role:'Lead Dev'},{name:'Arjun Mehta',email:'arjun@pm.io',role:'PM'}], deadline:'2026-07-01', tasks:15, done:15 },
];

const EMPTY_PROJECT = { name:'', status:'Planning', priority:'Medium', desc:'', deadline:'' };
const EMPTY_INVITE  = { name:'', email:'', role:'' };

// ── Badge ──
function Badge({ label, meta }) {
  return <span style={{ fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:20, background:meta.bg, color:meta.color, letterSpacing:0.3 }}>{label}</span>;
}

// ── Avatar ──
function Av({ name, size=28 }) {
  return <div style={{ width:size,height:size,borderRadius:'50%',background:avColor(name),display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:size*0.36,color:'#fff',flexShrink:0,boxShadow:`0 0 0 2px ${avColor(name)}44` }}>{initials(name)}</div>;
}

// ── Invite Modal ──
function InviteModal({ project, onClose, onInvite }) {
  const [form, setForm] = useState(EMPTY_INVITE);
  const [err, setErr]   = useState('');
  const f = (k,v) => setForm(p=>({...p,[k]:v}));
  const submit = () => {
    if (!form.name.trim() || !form.email.trim() || !form.role.trim()) { setErr('All fields required.'); return; }
    if (!/^[^@]+@[^@]+\.[^@]+$/.test(form.email)) { setErr('Enter a valid email.'); return; }
    onInvite(form); setForm(EMPTY_INVITE); setErr('');
  };
  const inp = { width:'100%', padding:'10px 13px', fontSize:14, borderRadius:9, background:'rgba(20,12,40,0.9)', border:'1px solid rgba(167,139,250,0.28)', color:'#e5e0f0', outline:'none', boxSizing:'border-box' };
  const lbl = { fontSize:11, fontWeight:700, color:'#9d94b5', letterSpacing:0.5, marginBottom:6, display:'block' };
  return (
    <div onClick={onClose} style={{ position:'fixed',inset:0,zIndex:2000,background:'rgba(0,0,0,0.7)',backdropFilter:'blur(6px)',display:'flex',alignItems:'center',justifyContent:'center',padding:20 }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:'linear-gradient(145deg,#1e1033,#150c27)',border:'1px solid rgba(167,139,250,0.3)',borderRadius:20,padding:'30px 32px',width:'100%',maxWidth:440,boxShadow:'0 30px 80px rgba(0,0,0,0.6)' }}>
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:22 }}>
          <div><h2 style={{ margin:0,fontSize:20,fontWeight:800,color:'#e5e0f0' }}>Invite Member</h2><p style={{ margin:'4px 0 0',fontSize:13,color:'#6b6880' }}>to <b style={{ color:'#c4b5fd' }}>{project.name}</b></p></div>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.08)',border:'none',color:'#9d94b5',width:34,height:34,borderRadius:10,fontSize:18,cursor:'pointer' }}>×</button>
        </div>

        {/* Existing members */}
        {project.members.length > 0 && (
          <div style={{ marginBottom:22 }}>
            <span style={lbl}>CURRENT MEMBERS</span>
            <div style={{ display:'flex',flexDirection:'column',gap:8 }}>
              {project.members.map(m=>(
                <div key={m.email} style={{ display:'flex',alignItems:'center',gap:10,padding:'8px 10px',background:'rgba(255,255,255,0.04)',borderRadius:9,border:'1px solid rgba(167,139,250,0.12)' }}>
                  <Av name={m.name} size={32} />
                  <div><div style={{ fontSize:13,fontWeight:600,color:'#e5e0f0' }}>{m.name}</div><div style={{ fontSize:11,color:'#6b6880' }}>{m.email} · {m.role}</div></div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display:'flex',flexDirection:'column',gap:14 }}>
          <div><label style={lbl}>FULL NAME</label><input style={inp} value={form.name} onChange={e=>f('name',e.target.value)} placeholder="e.g. Samiran Roy" /></div>
          <div><label style={lbl}>EMAIL ADDRESS</label><input style={inp} type="email" value={form.email} onChange={e=>f('email',e.target.value)} placeholder="e.g. name@company.com" /></div>
          <div><label style={lbl}>ROLE IN PROJECT</label><input style={inp} value={form.role} onChange={e=>f('role',e.target.value)} placeholder="e.g. Frontend Dev" /></div>
        </div>
        {err && <p style={{ color:'#ef4444',fontSize:12,margin:'10px 0 0' }}>{err}</p>}
        <div style={{ display:'flex',gap:10,marginTop:22 }}>
          <button onClick={onClose} style={{ flex:1,padding:'10px',background:'rgba(255,255,255,0.07)',border:'1px solid rgba(167,139,250,0.2)',color:'#9d94b5',borderRadius:10,fontSize:13,cursor:'pointer' }}>Cancel</button>
          <button onClick={submit} style={{ flex:2,padding:'10px',background:'linear-gradient(135deg,#7c3aed,#9333ea)',border:'none',color:'#fff',borderRadius:10,fontSize:13,fontWeight:700,cursor:'pointer',boxShadow:'0 6px 18px rgba(124,58,237,0.4)' }}>Send Invite</button>
        </div>
      </div>
    </div>
  );
}

// ── Create Project Modal ──
function CreateModal({ onClose, onCreate }) {
  const [form, setForm] = useState(EMPTY_PROJECT);
  const [err, setErr]   = useState('');
  const f = (k,v) => setForm(p=>({...p,[k]:v}));
  const submit = () => {
    if (!form.name.trim()) { setErr('Project name is required.'); return; }
    onCreate({ ...form, id:Date.now(), progress:0, members:[], tasks:0, done:0 });
    onClose();
  };
  const inp  = { width:'100%', padding:'10px 13px', fontSize:14, borderRadius:9, background:'rgba(20,12,40,0.9)', border:'1px solid rgba(167,139,250,0.28)', color:'#e5e0f0', outline:'none', boxSizing:'border-box' };
  const lbl  = { fontSize:11, fontWeight:700, color:'#9d94b5', letterSpacing:0.5, marginBottom:6, display:'block' };
  const selS = { ...inp, cursor:'pointer', colorScheme:'dark' };
  return (
    <div onClick={onClose} style={{ position:'fixed',inset:0,zIndex:2000,background:'rgba(0,0,0,0.7)',backdropFilter:'blur(6px)',display:'flex',alignItems:'center',justifyContent:'center',padding:20 }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:'linear-gradient(145deg,#1e1033,#150c27)',border:'1px solid rgba(167,139,250,0.3)',borderRadius:20,padding:'30px 32px',width:'100%',maxWidth:480,boxShadow:'0 30px 80px rgba(0,0,0,0.6)' }}>
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24 }}>
          <h2 style={{ margin:0,fontSize:20,fontWeight:800,color:'#e5e0f0' }}>New Project</h2>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.08)',border:'none',color:'#9d94b5',width:34,height:34,borderRadius:10,fontSize:18,cursor:'pointer' }}>×</button>
        </div>
        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px 18px' }}>
          <div style={{ gridColumn:'1/-1' }}><label style={lbl}>PROJECT NAME *</label><input style={inp} value={form.name} onChange={e=>f('name',e.target.value)} placeholder="e.g. Mobile App MVP" /></div>
          <div style={{ gridColumn:'1/-1' }}><label style={lbl}>DESCRIPTION</label><textarea style={{ ...inp, resize:'vertical', minHeight:80 }} value={form.desc} onChange={e=>f('desc',e.target.value)} placeholder="Brief project overview…" /></div>
          <div><label style={lbl}>STATUS</label>
            <select style={selS} value={form.status} onChange={e=>f('status',e.target.value)}>
              {Object.keys(STATUS_META).map(s=><option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div><label style={lbl}>PRIORITY</label>
            <select style={selS} value={form.priority} onChange={e=>f('priority',e.target.value)}>
              {Object.keys(PRIORITY_META).map(p=><option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div style={{ gridColumn:'1/-1' }}><label style={lbl}>DEADLINE</label><input style={{ ...inp, colorScheme:'dark' }} type="date" value={form.deadline} onChange={e=>f('deadline',e.target.value)} /></div>
        </div>
        {err && <p style={{ color:'#ef4444',fontSize:12,margin:'10px 0 0' }}>{err}</p>}
        <div style={{ display:'flex',gap:10,marginTop:24 }}>
          <button onClick={onClose} style={{ flex:1,padding:'11px',background:'rgba(255,255,255,0.07)',border:'1px solid rgba(167,139,250,0.2)',color:'#9d94b5',borderRadius:10,fontSize:13,cursor:'pointer' }}>Cancel</button>
          <button onClick={submit} style={{ flex:2,padding:'11px',background:'linear-gradient(135deg,#7c3aed,#9333ea)',border:'none',color:'#fff',borderRadius:10,fontSize:14,fontWeight:700,cursor:'pointer',boxShadow:'0 6px 20px rgba(124,58,237,0.4)' }}>Create Project</button>
        </div>
      </div>
    </div>
  );
}

// ── Project Card ──
function ProjectCard({ project, onInvite, onDelete }) {
  const sm = STATUS_META[project.status]   || STATUS_META.Planning;
  const pm = PRIORITY_META[project.priority] || PRIORITY_META.Medium;
  return (
    <div style={{ background:'rgba(255,255,255,0.045)',border:'1px solid rgba(167,139,250,0.15)',borderRadius:16,padding:'22px 22px 18px',display:'flex',flexDirection:'column',gap:0,transition:'border-color 0.2s,transform 0.2s' }}
      onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(167,139,250,0.4)';e.currentTarget.style.transform='translateY(-2px)';}}
      onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(167,139,250,0.15)';e.currentTarget.style.transform='none';}}>

      {/* Top row */}
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10 }}>
        <h3 style={{ margin:0,fontSize:16,fontWeight:800,color:'#e5e0f0',flex:1,marginRight:10 }}>{project.name}</h3>
        <div style={{ display:'flex',gap:6,flexShrink:0 }}>
          <Badge label={project.status}   meta={sm} />
          <Badge label={project.priority} meta={pm} />
        </div>
      </div>

      {/* Description */}
      <p style={{ margin:'0 0 16px',fontSize:13,color:'#9d94b5',lineHeight:1.5 }}>{project.desc || 'No description.'}</p>

      {/* Progress */}
      <div style={{ marginBottom:14 }}>
        <div style={{ display:'flex',justifyContent:'space-between',fontSize:11,color:'#6b6880',marginBottom:5 }}>
          <span>{project.done}/{project.tasks} tasks done</span>
          <span style={{ color: project.progress===100?'#22c55e':'#c4b5fd',fontWeight:700 }}>{project.progress}%</span>
        </div>
        <div style={{ height:6,borderRadius:6,background:'rgba(255,255,255,0.08)',overflow:'hidden' }}>
          <div style={{ height:'100%',borderRadius:6,width:`${project.progress}%`,background: project.progress===100?'linear-gradient(90deg,#059669,#22c55e)':'linear-gradient(90deg,#7c3aed,#a78bfa)',transition:'width 0.4s ease' }} />
        </div>
      </div>

      {/* Members + deadline */}
      <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:16 }}>
        <div style={{ display:'flex' }}>
          {project.members.slice(0,4).map((m,i)=>(
            <div key={m.email} style={{ marginLeft: i===0?0:-8, zIndex:10-i }}>
              <Av name={m.name} size={28} />
            </div>
          ))}
          {project.members.length>4 && <div style={{ width:28,height:28,borderRadius:'50%',background:'rgba(167,139,250,0.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,color:'#c4b5fd',fontWeight:700,marginLeft:-8 }}>+{project.members.length-4}</div>}
        </div>
        {project.members.length===0 && <span style={{ fontSize:12,color:'#6b6880' }}>No members yet</span>}
        {project.deadline && <span style={{ marginLeft:'auto',fontSize:11,color:'#6b6880' }}>📅 {project.deadline}</span>}
      </div>

      {/* Action buttons */}
      <div style={{ display:'flex',gap:8,marginTop:'auto' }}>
        <button onClick={()=>onInvite(project)} style={{ flex:1,padding:'8px',fontSize:12,fontWeight:700,borderRadius:9,background:'linear-gradient(135deg,#7c3aed,#9333ea)',border:'none',color:'#fff',cursor:'pointer',boxShadow:'0 4px 14px rgba(124,58,237,0.35)' }}>
          👥 Invite
        </button>
        <button onClick={()=>onDelete(project.id)} style={{ padding:'8px 14px',fontSize:12,fontWeight:600,borderRadius:9,background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',color:'#fca5a5',cursor:'pointer' }}>
          🗑
        </button>
      </div>
    </div>
  );
}

// ── MAIN PAGE ──
export default function ProjectList() {
  const [projects,  setProjects]  = useState(SEED);
  const [search,    setSearch]    = useState('');
  const [filterSt,  setFilterSt]  = useState('All');
  const [filterPr,  setFilterPr]  = useState('All');
  const [showCreate,setShowCreate]= useState(false);
  const [inviteFor, setInviteFor] = useState(null);
  const [toast,     setToast]     = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(()=>setToast(''),3000); };

  const filtered = useMemo(()=>projects.filter(p=>{
    const q=search.toLowerCase();
    return (!q||p.name.toLowerCase().includes(q)||p.desc.toLowerCase().includes(q))
      && (filterSt==='All'||p.status===filterSt)
      && (filterPr==='All'||p.priority===filterPr);
  }),[projects,search,filterSt,filterPr]);

  const stats = useMemo(()=>({
    total:   projects.length,
    active:  projects.filter(p=>p.status==='Active').length,
    done:    projects.filter(p=>p.status==='Completed').length,
    members: [...new Set(projects.flatMap(p=>p.members.map(m=>m.email)))].length,
  }),[projects]);

  const handleCreate = (p) => { setProjects(prev=>[p,...prev]); showToast('✅ Project created!'); };
  const handleDelete = (id) => { setProjects(prev=>prev.filter(p=>p.id!==id)); showToast('🗑 Project removed.'); };
  const handleInvite = (newMember) => {
    setProjects(prev=>prev.map(p=>p.id===inviteFor.id
      ? { ...p, members:[...p.members, newMember] }
      : p));
    setInviteFor(null);
    showToast(`✅ ${newMember.name} invited!`);
  };

  const pill = (active,label,onClick)=>(
    <button onClick={onClick} style={{ padding:'7px 14px',fontSize:12,fontWeight:600,borderRadius:20,cursor:'pointer',
      background:active?'linear-gradient(135deg,#7c3aed,#9333ea)':'rgba(255,255,255,0.07)',
      border:active?'none':'1px solid rgba(167,139,250,0.2)',
      color:active?'#fff':'#9d94b5',boxShadow:active?'0 4px 14px rgba(124,58,237,0.35)':'none',transition:'all 0.15s' }}>
      {label}
    </button>
  );

  return (
    <PageWrapper>

      {/* Toast */}
      {toast && (
        <div style={{ position:'fixed',top:24,right:24,zIndex:3000,background:'linear-gradient(135deg,#1e1033,#150c27)',border:'1px solid rgba(167,139,250,0.35)',borderRadius:12,padding:'12px 20px',fontSize:13,color:'#e5e0f0',boxShadow:'0 10px 40px rgba(0,0,0,0.5)',animation:'fadeIn 0.2s' }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:16,marginBottom:26 }}>
        <div>
          <h1 style={{ margin:0,fontSize:28,fontWeight:800,color:'#e5e0f0',letterSpacing:-0.5 }}>Projects</h1>
          <p style={{ margin:'5px 0 0',fontSize:13,color:'#6b6880' }}>{projects.length} projects · {stats.members} unique members</p>
        </div>
        <button onClick={()=>setShowCreate(true)} style={{ padding:'11px 22px',fontSize:14,fontWeight:700,borderRadius:12,background:'linear-gradient(135deg,#7c3aed,#9333ea)',border:'none',color:'#fff',boxShadow:'0 8px 24px rgba(124,58,237,0.4)',cursor:'pointer' }}>
          + New Project
        </button>
      </div>

      {/* Stat Cards */}
      <div style={{ display:'flex',gap:14,flexWrap:'wrap',marginBottom:26 }}>
        {[
          { label:'Total Projects', value:stats.total,   color:'#a78bfa' },
          { label:'Active',         value:stats.active,  color:'#22c55e' },
          { label:'Completed',      value:stats.done,    color:'#3b82f6' },
          { label:'Team Members',   value:stats.members, color:'#f59e0b' },
        ].map(s=>(
          <div key={s.label} style={{ flex:'1 1 120px',background:'rgba(255,255,255,0.05)',border:`1px solid ${s.color}33`,borderRadius:14,padding:'18px 22px' }}>
            <div style={{ fontSize:26,fontWeight:800,color:s.color }}>{s.value}</div>
            <div style={{ fontSize:12,color:'#9d94b5',marginTop:3 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search + Filters */}
      <div style={{ display:'flex',gap:10,flexWrap:'wrap',alignItems:'center',marginBottom:24 }}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍  Search projects…"
          style={{ flex:'1 1 200px',minWidth:0,padding:'10px 15px',fontSize:14,borderRadius:10,background:'rgba(255,255,255,0.06)',border:'1px solid rgba(167,139,250,0.25)',color:'#e5e0f0',outline:'none' }} />
        <div style={{ display:'flex',gap:7,flexWrap:'wrap' }}>
          {['All',...Object.keys(STATUS_META)].map(s=>pill(filterSt===s,s,()=>setFilterSt(s)))}
        </div>
        <div style={{ display:'flex',gap:7,flexWrap:'wrap' }}>
          {['All',...Object.keys(PRIORITY_META)].map(p=>pill(filterPr===p,p,()=>setFilterPr(p)))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length===0
        ? <div style={{ textAlign:'center',padding:'60px 20px',color:'#6b6880' }}><div style={{ fontSize:46,marginBottom:10 }}>📂</div><div>No projects match your filters.</div></div>
        : <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))',gap:18 }}>
            {filtered.map(p=><ProjectCard key={p.id} project={p} onInvite={setInviteFor} onDelete={handleDelete} />)}
          </div>
      }

      {showCreate && <CreateModal onClose={()=>setShowCreate(false)} onCreate={handleCreate} />}
      {inviteFor  && <InviteModal project={inviteFor} onClose={()=>setInviteFor(null)} onInvite={handleInvite} />}
    </PageWrapper>
  );
}