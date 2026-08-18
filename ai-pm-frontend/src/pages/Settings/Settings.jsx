import { useState, useEffect } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import { useAuth } from '../../context/AuthContext';

/* ─── helpers ─────────────────────────────────────────── */
const avColors = ['#7c3aed','#2563eb','#0891b2','#059669','#d97706','#dc2626'];
const avColor  = s => { let h=0; for(const c of (s||'U')) h=(h*31+c.charCodeAt(0))%avColors.length; return avColors[h]; };
const initials = n => (n||'U').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();

const TABS = ['Profile','Notifications','Security','Appearance','Danger Zone'];

/* ─── reusable primitives ─────────────────────────────── */
const inp  = (extra={}) => ({ width:'100%', padding:'10px 13px', fontSize:14, borderRadius:9, background:'rgba(20,12,40,0.85)', border:'1px solid rgba(167,139,250,0.28)', color:'#e5e0f0', outline:'none', boxSizing:'border-box', ...extra });
const lbl  = { fontSize:11, fontWeight:700, color:'#9d94b5', letterSpacing:0.5, marginBottom:6, display:'block' };
const card = (extra={}) => ({ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(167,139,250,0.14)', borderRadius:14, padding:'22px 24px', marginBottom:18, ...extra });

function SectionTitle({ title, sub }) {
  return <div style={{ marginBottom:20 }}><h2 style={{ margin:0, fontSize:17, fontWeight:800, color:'#e5e0f0' }}>{title}</h2>{sub&&<p style={{ margin:'4px 0 0', fontSize:13, color:'#6b6880' }}>{sub}</p>}</div>;
}

function Toggle({ value, onChange, label, sub }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 0', borderBottom:'1px solid rgba(167,139,250,0.08)' }}>
      <div><div style={{ fontSize:14, fontWeight:600, color:'#e5e0f0' }}>{label}</div>{sub&&<div style={{ fontSize:12, color:'#6b6880', marginTop:2 }}>{sub}</div>}</div>
      <div onClick={()=>onChange(!value)} style={{ width:44, height:24, borderRadius:12, background:value?'linear-gradient(135deg,#7c3aed,#9333ea)':'rgba(255,255,255,0.1)', cursor:'pointer', position:'relative', transition:'background 0.2s', flexShrink:0 }}>
        <div style={{ width:18, height:18, borderRadius:'50%', background:'#fff', position:'absolute', top:3, left:value?23:3, transition:'left 0.2s', boxShadow:'0 1px 4px rgba(0,0,0,0.3)' }} />
      </div>
    </div>
  );
}

function SaveBtn({ onClick, saved }) {
  return (
    <button onClick={onClick} style={{ padding:'10px 26px', fontSize:14, fontWeight:700, borderRadius:10, border:'none', cursor:'pointer', background:saved?'linear-gradient(135deg,#059669,#22c55e)':'linear-gradient(135deg,#7c3aed,#9333ea)', color:'#fff', boxShadow:'0 6px 18px rgba(124,58,237,0.35)', transition:'background 0.3s' }}>
      {saved ? '✓ Saved!' : 'Save Changes'}
    </button>
  );
}

/* ─── TAB: Profile ──────────────────────────────────────── */
function ProfileTab({ toast }) {
  const { user } = useAuth();
  const stored = JSON.parse(localStorage.getItem('profile')||'{}');
  const [form, setForm] = useState({ name: stored.name||user?.name||'Samiran Roy', email: stored.email||user?.email||'samiran@pm.io', role: stored.role||'Full Stack Developer', bio: stored.bio||'', timezone: stored.timezone||'Asia/Kolkata', phone: stored.phone||'' });
  const [saved, setSaved] = useState(false);
  const f = (k,v) => setForm(p=>({...p,[k]:v}));
  const save = () => { localStorage.setItem('profile', JSON.stringify(form)); setSaved(true); toast('✅ Profile saved!'); setTimeout(()=>setSaved(false),2500); };

  return (
    <div>
      <SectionTitle title="Profile Settings" sub="Your personal information and public identity." />

      {/* Avatar */}
      <div style={card()}>
        <div style={{ display:'flex', alignItems:'center', gap:18 }}>
          <div style={{ width:72, height:72, borderRadius:'50%', background:avColor(form.name), display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, fontWeight:800, color:'#fff', boxShadow:`0 0 0 4px ${avColor(form.name)}44` }}>{initials(form.name)}</div>
          <div>
            <div style={{ fontSize:16, fontWeight:700, color:'#e5e0f0' }}>{form.name}</div>
            <div style={{ fontSize:13, color:'#6b6880', marginTop:3 }}>{form.role}</div>
            <div style={{ fontSize:11, marginTop:6, color:'#9d94b5' }}>Avatar auto-generated from your name</div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div style={card()}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px 20px' }}>
          <div><label style={lbl}>FULL NAME</label><input style={inp()} value={form.name} onChange={e=>f('name',e.target.value)} /></div>
          <div><label style={lbl}>EMAIL</label><input style={inp()} type="email" value={form.email} onChange={e=>f('email',e.target.value)} /></div>
          <div><label style={lbl}>ROLE / TITLE</label><input style={inp()} value={form.role} onChange={e=>f('role',e.target.value)} /></div>
          <div><label style={lbl}>PHONE</label><input style={inp()} value={form.phone} onChange={e=>f('phone',e.target.value)} placeholder="+91 98765 43210" /></div>
          <div style={{ gridColumn:'1/-1' }}><label style={lbl}>BIO</label><textarea style={{ ...inp(), resize:'vertical', minHeight:80 }} value={form.bio} onChange={e=>f('bio',e.target.value)} placeholder="Short bio…" /></div>
          <div><label style={lbl}>TIMEZONE</label>
            <select style={{ ...inp(), colorScheme:'dark', cursor:'pointer' }} value={form.timezone} onChange={e=>f('timezone',e.target.value)}>
              {['Asia/Kolkata','UTC','America/New_York','Europe/London','Asia/Singapore','Australia/Sydney'].map(z=><option key={z} value={z}>{z}</option>)}
            </select>
          </div>
        </div>
      </div>
      <SaveBtn onClick={save} saved={saved} />
    </div>
  );
}

/* ─── TAB: Notifications ────────────────────────────────── */
function NotificationsTab({ toast }) {
  const stored = JSON.parse(localStorage.getItem('notif_prefs')||'{}');
  const def = { emailSprints:true, emailTasks:true, emailInvites:true, emailWeekly:false, pushBrowser:true, pushDeadlines:true, pushMentions:true, digestEnabled:false };
  const [prefs, setPrefs] = useState({...def,...stored});
  const [saved, setSaved] = useState(false);
  const toggle = k => setPrefs(p=>({...p,[k]:!p[k]}));
  const save = () => { localStorage.setItem('notif_prefs', JSON.stringify(prefs)); setSaved(true); toast('✅ Notification preferences saved!'); setTimeout(()=>setSaved(false),2500); };

  return (
    <div>
      <SectionTitle title="Notification Preferences" sub="Control how and when we reach you." />
      <div style={card()}>
        <div style={{ fontSize:13, fontWeight:700, color:'#c4b5fd', marginBottom:4 }}>📧 Email Notifications</div>
        <Toggle value={prefs.emailSprints}  onChange={()=>toggle('emailSprints')}  label="Sprint updates"     sub="When a sprint starts or ends" />
        <Toggle value={prefs.emailTasks}    onChange={()=>toggle('emailTasks')}    label="Task assignments"   sub="When you're assigned to a task" />
        <Toggle value={prefs.emailInvites}  onChange={()=>toggle('emailInvites')}  label="Team invitations"   sub="Project invite emails" />
        <Toggle value={prefs.emailWeekly}   onChange={()=>toggle('emailWeekly')}   label="Weekly digest"      sub="Summary every Monday morning" />
      </div>
      <div style={card()}>
        <div style={{ fontSize:13, fontWeight:700, color:'#c4b5fd', marginBottom:4 }}>🔔 In-App & Browser Push</div>
        <Toggle value={prefs.pushBrowser}   onChange={()=>toggle('pushBrowser')}   label="Browser notifications" sub="Real-time push via browser" />
        <Toggle value={prefs.pushDeadlines} onChange={()=>toggle('pushDeadlines')} label="Deadline reminders"    sub="48h before task deadline" />
        <Toggle value={prefs.pushMentions}  onChange={()=>toggle('pushMentions')}  label="@Mentions"             sub="When someone mentions you" />
        <Toggle value={prefs.digestEnabled} onChange={()=>toggle('digestEnabled')} label="Daily digest"          sub="End-of-day summary" />
      </div>
      <SaveBtn onClick={save} saved={saved} />
    </div>
  );
}

/* ─── TAB: Security ─────────────────────────────────────── */
function SecurityTab({ toast }) {
  const [pwForm,  setPwForm]  = useState({ current:'', next:'', confirm:'' });
  const [twoFA,   setTwoFA]   = useState(JSON.parse(localStorage.getItem('twofa')||'false'));
  const [pwErr,   setPwErr]   = useState('');
  const [pwSaved, setPwSaved] = useState(false);
  const f = (k,v) => setPwForm(p=>({...p,[k]:v}));

  const savePassword = () => {
    if (!pwForm.current)             { setPwErr('Current password required.'); return; }
    if (pwForm.next.length < 8)      { setPwErr('Min 8 characters.'); return; }
    if (pwForm.next !== pwForm.confirm){ setPwErr("Passwords don't match."); return; }
    setPwErr(''); setPwSaved(true); setPwForm({current:'',next:'',confirm:''});
    toast('✅ Password updated!'); setTimeout(()=>setPwSaved(false),2500);
  };
  const toggle2FA = () => { const n=!twoFA; setTwoFA(n); localStorage.setItem('twofa',JSON.stringify(n)); toast(n?'🔐 2FA enabled!':'2FA disabled.'); };

  const sessions = [{ device:'Chrome · Windows 11', ip:'103.x.x.1', time:'Active now', current:true },{ device:'Safari · iPhone 15', ip:'49.x.x.22', time:'2 hours ago', current:false }];

  return (
    <div>
      <SectionTitle title="Security" sub="Manage your password, 2FA, and active sessions." />

      <div style={card()}>
        <div style={{ fontSize:13, fontWeight:700, color:'#c4b5fd', marginBottom:16 }}>🔑 Change Password</div>
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div><label style={lbl}>CURRENT PASSWORD</label><input style={inp()} type="password" value={pwForm.current} onChange={e=>f('current',e.target.value)} placeholder="••••••••" /></div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            <div><label style={lbl}>NEW PASSWORD</label><input style={inp()} type="password" value={pwForm.next} onChange={e=>f('next',e.target.value)} placeholder="min 8 chars" /></div>
            <div><label style={lbl}>CONFIRM PASSWORD</label><input style={inp()} type="password" value={pwForm.confirm} onChange={e=>f('confirm',e.target.value)} placeholder="repeat" /></div>
          </div>
          {pwErr && <span style={{ color:'#ef4444', fontSize:12 }}>{pwErr}</span>}

          {/* Password strength */}
          {pwForm.next && (() => {
            const s = [pwForm.next.length>=8, /[A-Z]/.test(pwForm.next), /\d/.test(pwForm.next), /[^a-zA-Z0-9]/.test(pwForm.next)].filter(Boolean).length;
            const colors=['#ef4444','#f59e0b','#22c55e','#3b82f6']; const labels=['Weak','Fair','Strong','Very Strong'];
            return <div><div style={{ height:4, borderRadius:4, background:'rgba(255,255,255,0.08)', overflow:'hidden' }}><div style={{ height:'100%', width:`${s*25}%`, background:colors[s-1]||'#ef4444', borderRadius:4, transition:'width 0.3s' }} /></div><span style={{ fontSize:11, color:colors[s-1]||'#ef4444' }}>{labels[s-1]||'Too short'}</span></div>;
          })()}
        </div>
        <div style={{ marginTop:18 }}><SaveBtn onClick={savePassword} saved={pwSaved} /></div>
      </div>

      <div style={card()}>
        <Toggle value={twoFA} onChange={toggle2FA} label="Two-Factor Authentication (2FA)" sub="Extra security via authenticator app" />
        {twoFA && <div style={{ marginTop:12, padding:'10px 14px', background:'rgba(34,197,94,0.08)', border:'1px solid rgba(34,197,94,0.25)', borderRadius:9, fontSize:13, color:'#86efac' }}>🔐 2FA is active. Use Google Authenticator or Authy.</div>}
      </div>

      <div style={card()}>
        <div style={{ fontSize:13, fontWeight:700, color:'#c4b5fd', marginBottom:14 }}>💻 Active Sessions</div>
        {sessions.map((s,i)=>(
          <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 0', borderBottom: i<sessions.length-1?'1px solid rgba(167,139,250,0.08)':'none' }}>
            <div><div style={{ fontSize:14, fontWeight:600, color:'#e5e0f0' }}>{s.device} {s.current&&<span style={{ fontSize:10, background:'rgba(34,197,94,0.15)', color:'#22c55e', borderRadius:20, padding:'2px 8px', marginLeft:6 }}>Current</span>}</div><div style={{ fontSize:12, color:'#6b6880', marginTop:2 }}>{s.ip} · {s.time}</div></div>
            {!s.current && <button onClick={()=>toast('Session revoked.')} style={{ fontSize:12, padding:'6px 12px', borderRadius:8, background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', color:'#fca5a5', cursor:'pointer' }}>Revoke</button>}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── TAB: Appearance ───────────────────────────────────── */
function AppearanceTab({ toast }) {
  const stored = JSON.parse(localStorage.getItem('appearance')||'{}');
  const [prefs, setPrefs] = useState({ accentColor: stored.accentColor||'#7c3aed', fontSize: stored.fontSize||'medium', sidebarCompact: stored.sidebarCompact||false, animations: stored.animations!==undefined?stored.animations:true, density: stored.density||'comfortable' });
  const [saved, setSaved] = useState(false);
  const f = (k,v) => setPrefs(p=>({...p,[k]:v}));
  const save = () => { localStorage.setItem('appearance', JSON.stringify(prefs)); setSaved(true); toast('✅ Appearance saved!'); setTimeout(()=>setSaved(false),2500); };

  const ACCENTS = ['#7c3aed','#2563eb','#0891b2','#059669','#d97706','#dc2626','#db2777','#9333ea'];

  return (
    <div>
      <SectionTitle title="Appearance" sub="Personalise the look and feel of the app." />
      <div style={card()}>
        <div style={{ marginBottom:20 }}>
          <label style={lbl}>ACCENT COLOR</label>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginTop:4 }}>
            {ACCENTS.map(c=>(
              <div key={c} onClick={()=>f('accentColor',c)} style={{ width:32, height:32, borderRadius:'50%', background:c, cursor:'pointer', border: prefs.accentColor===c?`3px solid #fff`:'3px solid transparent', boxShadow: prefs.accentColor===c?`0 0 10px ${c}`:'none', transition:'all 0.15s' }} />
            ))}
          </div>
        </div>
        <div style={{ marginBottom:20 }}>
          <label style={lbl}>FONT SIZE</label>
          <div style={{ display:'flex', gap:10 }}>
            {['small','medium','large'].map(sz=>(
              <button key={sz} onClick={()=>f('fontSize',sz)} style={{ padding:'8px 18px', borderRadius:9, fontSize:13, fontWeight:600, cursor:'pointer', background: prefs.fontSize===sz?`linear-gradient(135deg,#7c3aed,#9333ea)`:'rgba(255,255,255,0.07)', border: prefs.fontSize===sz?'none':'1px solid rgba(167,139,250,0.2)', color: prefs.fontSize===sz?'#fff':'#9d94b5' }}>
                {sz.charAt(0).toUpperCase()+sz.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div style={{ marginBottom:20 }}>
          <label style={lbl}>LAYOUT DENSITY</label>
          <div style={{ display:'flex', gap:10 }}>
            {['compact','comfortable','spacious'].map(d=>(
              <button key={d} onClick={()=>f('density',d)} style={{ padding:'8px 16px', borderRadius:9, fontSize:13, fontWeight:600, cursor:'pointer', background: prefs.density===d?`linear-gradient(135deg,#7c3aed,#9333ea)`:'rgba(255,255,255,0.07)', border: prefs.density===d?'none':'1px solid rgba(167,139,250,0.2)', color: prefs.density===d?'#fff':'#9d94b5' }}>
                {d.charAt(0).toUpperCase()+d.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <Toggle value={prefs.sidebarCompact} onChange={v=>f('sidebarCompact',v)} label="Compact Sidebar" sub="Collapse sidebar to icon-only mode" />
        <Toggle value={prefs.animations}     onChange={v=>f('animations',v)}     label="UI Animations"   sub="Transitions and micro-animations" />
      </div>
      <SaveBtn onClick={save} saved={saved} />
    </div>
  );
}

/* ─── TAB: Danger Zone ──────────────────────────────────── */
function DangerZoneTab({ toast }) {
  const { logout } = useAuth();
  const [confirmText, setConfirmText] = useState('');
  const [step, setStep] = useState(null); // null | 'export' | 'deactivate' | 'delete'

  const ACTIONS = [
    { id:'export',     label:'Export My Data',      sub:'Download all your data as JSON.',             color:'#3b82f6', action:()=>{ toast('📦 Data export started — check your email.'); setStep(null); } },
    { id:'deactivate', label:'Deactivate Account',  sub:'Temporarily disable your account.',           color:'#f59e0b', action:()=>{ toast('⚠️ Account deactivated. Contact support to reactivate.'); setTimeout(logout,2000); } },
    { id:'delete',     label:'Delete Account',       sub:'Permanently delete all your data. Cannot be undone.', color:'#ef4444', action:()=>{ if(confirmText==='DELETE'){ toast('Account deleted.'); setTimeout(logout,1500); } } },
  ];

  return (
    <div>
      <SectionTitle title="Danger Zone" sub="Irreversible actions — proceed with care." />
      {ACTIONS.map(a=>(
        <div key={a.id} style={{ ...card(), border:`1px solid ${a.color}33`, marginBottom:14 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
            <div><div style={{ fontSize:15, fontWeight:700, color:'#e5e0f0' }}>{a.label}</div><div style={{ fontSize:13, color:'#6b6880', marginTop:3 }}>{a.sub}</div></div>
            <button onClick={()=>setStep(step===a.id?null:a.id)} style={{ padding:'9px 18px', fontSize:13, fontWeight:700, borderRadius:9, cursor:'pointer', background:`rgba(${a.color==='#ef4444'?'239,68,68':a.color==='#f59e0b'?'245,158,11':'59,130,246'},0.12)`, border:`1px solid ${a.color}55`, color:a.color }}>
              {a.label}
            </button>
          </div>
          {step===a.id && (
            <div style={{ marginTop:16, padding:'14px', background:'rgba(0,0,0,0.2)', borderRadius:10, borderTop:`2px solid ${a.color}44` }}>
              {a.id==='delete' && (
                <div style={{ marginBottom:12 }}>
                  <label style={{ ...lbl, color: a.color }}>TYPE "DELETE" TO CONFIRM</label>
                  <input style={inp({ border:`1px solid ${a.color}55` })} value={confirmText} onChange={e=>setConfirmText(e.target.value)} placeholder='Type DELETE' />
                </div>
              )}
              <div style={{ display:'flex', gap:10 }}>
                <button onClick={()=>setStep(null)} style={{ padding:'9px 18px', fontSize:13, borderRadius:9, background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)', color:'#9d94b5', cursor:'pointer' }}>Cancel</button>
                <button onClick={a.action} disabled={a.id==='delete'&&confirmText!=='DELETE'} style={{ padding:'9px 18px', fontSize:13, fontWeight:700, borderRadius:9, background:a.id==='delete'&&confirmText!=='DELETE'?'rgba(255,255,255,0.05)':`linear-gradient(135deg,${a.color},${a.color}cc)`, border:'none', color: a.id==='delete'&&confirmText!=='DELETE'?'#6b6880':'#fff', cursor: a.id==='delete'&&confirmText!=='DELETE'?'not-allowed':'pointer' }}>
                  Confirm
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ─── MAIN ──────────────────────────────────────────────── */
export default function Settings() {
  const [activeTab, setActiveTab] = useState('Profile');
  const [toast, setToast] = useState('');
  const showToast = msg => { setToast(msg); setTimeout(()=>setToast(''),3000); };

  const TAB_ICONS = { Profile:'👤', Notifications:'🔔', Security:'🔐', Appearance:'🎨', 'Danger Zone':'⚠️' };

  return (
    <PageWrapper>

      {/* Toast */}
      {toast && (
        <div style={{ position:'fixed', top:24, right:24, zIndex:3000, background:'linear-gradient(135deg,#1e1033,#150c27)', border:'1px solid rgba(167,139,250,0.35)', borderRadius:12, padding:'12px 20px', fontSize:13, color:'#e5e0f0', boxShadow:'0 10px 40px rgba(0,0,0,0.5)', minWidth:220 }}>
          {toast}
        </div>
      )}

      <h1 style={{ margin:'0 0 6px', fontSize:28, fontWeight:800, color:'#e5e0f0', letterSpacing:-0.5 }}>Settings</h1>
      <p style={{ margin:'0 0 28px', fontSize:13, color:'#6b6880' }}>Manage your account, security and preferences.</p>

      <div style={{ display:'flex', gap:24, alignItems:'flex-start', flexWrap:'wrap' }}>

        {/* Sidebar nav */}
        <div style={{ width:200, flexShrink:0, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(167,139,250,0.14)', borderRadius:14, padding:'10px 8px' }}>
          {TABS.map(t=>(
            <div key={t} onClick={()=>setActiveTab(t)} style={{ display:'flex', alignItems:'center', gap:10, padding:'11px 14px', borderRadius:9, cursor:'pointer', marginBottom:2, background: activeTab===t?'linear-gradient(135deg,#7c3aed,#9333ea)':'transparent', color: activeTab===t?'#fff': t==='Danger Zone'?'#fca5a5':'#c9c2dd', fontWeight: activeTab===t?700:500, fontSize:14, transition:'background 0.15s' }}>
              <span>{TAB_ICONS[t]}</span>{t}
            </div>
          ))}
        </div>

        {/* Tab content */}
        <div style={{ flex:1, minWidth:0 }}>
          {activeTab==='Profile'       && <ProfileTab       toast={showToast} />}
          {activeTab==='Notifications' && <NotificationsTab toast={showToast} />}
          {activeTab==='Security'      && <SecurityTab      toast={showToast} />}
          {activeTab==='Appearance'    && <AppearanceTab    toast={showToast} />}
          {activeTab==='Danger Zone'   && <DangerZoneTab    toast={showToast} />}
        </div>
      </div>
    </PageWrapper>
  );
}