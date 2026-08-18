import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import { useAuth } from '../../context/AuthContext';

/*
  ═══════════════════════════════════════════════════════════
  DASHBOARD — READ THIS BEFORE EDITING
  ═══════════════════════════════════════════════════════════

  WHY THIS FILE EXISTS:
  The old Dashboard was 30 lines of hard-coded static text.
  That's fine for a demo, but useless as a real PM tool.
  This rebuild makes every number derived from real data structures
  so wiring a backend API later = just swap the MOCK_ constants.

  SECTIONS (top → bottom):
  1. HeroHeader   — greeting + date + quick-action buttons
  2. StatCards    — 6 KPI cards with icons, trends, accent colors
  3. SprintPanel  — active sprint progress + days remaining
  4. Two-column body:
       Left  → ActivityFeed (recent actions log)
       Right → TaskBreakdown (visual bars) + QuickLinks
  5. AIInsights   — 3 derived insight cards (not static text)

  CONCEPTS USED:
  - useAuth()         → gets the logged-in user's name for the greeting
  - useMemo()         → derives all KPIs from data ONCE, not on every render
  - useNavigate()     → quick-action buttons navigate programmatically
  - Date().getHours() → time-of-day greeting (Good morning / afternoon / evening)
  - CSS Grid auto-fill → stat cards are responsive with zero media queries
  - Pure CSS bars     → task breakdown uses div widths, no chart library
  - Style objects outside component → created once, not on every render (no GC pressure)
  ═══════════════════════════════════════════════════════════
*/

/* ─── MOCK DATA ────────────────────────────────────────────
   Treat this like an API response shape.
   When you connect a real backend, replace these with
   useEffect + fetch/axios calls and the UI stays identical. */
const MOCK_PROJECTS = [
  { id:1, name:'AI PM System',         status:'Active'    },
  { id:2, name:'Client Portal Revamp', status:'Planning'  },
  { id:3, name:'Internal DevOps Tools',status:'Active'    },
  { id:4, name:'Mobile App MVP',       status:'On Hold'   },
  { id:5, name:'Analytics Dashboard',  status:'Completed' },
];

const MOCK_TASKS = [
  { id:'t1',  title:'Setup CI/CD',              status:'Done',        priority:'High',   assignee:'SR' },
  { id:'t2',  title:'Design DB schema',         status:'In Progress', priority:'Medium', assignee:'AM' },
  { id:'t3',  title:'Build login page',         status:'To Do',       priority:'High',   assignee:'PS' },
  { id:'t4',  title:'Create API contracts',     status:'To Do',       priority:'Medium', assignee:'SR' },
  { id:'t5',  title:'AI Story endpoint',        status:'In Progress', priority:'High',   assignee:'RV' },
  { id:'t6',  title:'Sprint Planner logic',     status:'Review',      priority:'Medium', assignee:'NK' },
  { id:'t7',  title:'Write unit tests',         status:'Backlog',     priority:'Low',    assignee:'AJ' },
  { id:'t8',  title:'Project scaffolding',      status:'Done',        priority:'Low',    assignee:'SR' },
  { id:'t9',  title:'Folder structure',         status:'Done',        priority:'Low',    assignee:'SR' },
  { id:'t10', title:'Mobile nav component',     status:'To Do',       priority:'High',   assignee:'PS' },
  { id:'t11', title:'API error handling',       status:'Backlog',     priority:'Medium', assignee:'RV' },
  { id:'t12', title:'E2E test suite',           status:'Backlog',     priority:'Low',    assignee:'AJ' },
];

const MOCK_SPRINT = {
  name: 'Sprint 5', goal: 'Complete AI integrations & auth flows',
  startDate: '2026-08-11', endDate: '2026-08-25',
  totalPoints: 42, completedPoints: 28,
  velocityLastSprint: 35,
};

const MOCK_MEMBERS = [
  { name:'Samiran Roy',  role:'Full Stack Dev',  initials:'SR' },
  { name:'Priya Sharma', role:'Frontend Dev',    initials:'PS' },
  { name:'Arjun Mehta',  role:'Product Manager', initials:'AM' },
  { name:'Nisha Kapoor', role:'UI/UX Designer',  initials:'NK' },
  { name:'Rahul Verma',  role:'DevOps Engineer', initials:'RV' },
  { name:'Anjali Singh', role:'QA Engineer',     initials:'AJ' },
];

const MOCK_ACTIVITY = [
  { icon:'✅', text:'Samiran moved "Setup CI/CD" to Done',          time:'2 min ago'  },
  { icon:'👥', text:'Priya was invited to AI PM System',            time:'1 hr ago'   },
  { icon:'🚀', text:'Sprint 5 started — 42 story points planned',   time:'3 hrs ago'  },
  { icon:'💬', text:'Arjun commented on "Design DB schema"',        time:'5 hrs ago'  },
  { icon:'📋', text:'"Mobile nav component" created by Priya',      time:'Yesterday'  },
  { icon:'⚠️', text:'"E2E test suite" flagged as at-risk',          time:'2 days ago' },
];

/* ─── Colour helpers ───────────────────────────────────────*/
const AV_COLORS = ['#7c3aed','#2563eb','#0891b2','#059669','#d97706','#dc2626'];
const avBg = s => { let h=0; for(const c of s) h=(h*31+c.charCodeAt(0))%AV_COLORS.length; return AV_COLORS[h]; };

/* ─── Tiny Avatar chip ─────────────────────────────────────*/
function Av({ init, size=28 }) {
  return <div style={{ width:size,height:size,borderRadius:'50%',background:avBg(init),display:'flex',alignItems:'center',justifyContent:'center',fontSize:size*0.38,fontWeight:700,color:'#fff',flexShrink:0 }}>{init}</div>;
}

/* ─── SECTION 1: Hero Header ───────────────────────────────
   WHY: First thing user sees — sets context (who, when, what sprint).
   useAuth() gives us the logged-in user's name from localStorage.
   Date().getHours() lets us say "Good morning" vs "Good evening"
   without any library — plain JS is enough. */
function HeroHeader({ navigate }) {
  const { user } = useAuth();
  const name = user?.name || JSON.parse(localStorage.getItem('profile')||'{}').name || 'there';
  const firstName = name.split(' ')[0];

  // Time-of-day greeting — pure JS, no library
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const emoji    = hour < 12 ? '☀️' : hour < 17 ? '⚡' : '🌙';

  const today = new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' });

  const QUICK = [
    { label:'+ New Task',    path:'/kanban',   color:'linear-gradient(135deg,#7c3aed,#9333ea)' },
    { label:'⚡ Sprints',    path:'/sprints',  color:'rgba(255,255,255,0.08)' },
    { label:'👥 Team',       path:'/team',     color:'rgba(255,255,255,0.08)' },
    { label:'📊 Reports',    path:'/reports',  color:'rgba(255,255,255,0.08)' },
  ];

  return (
    <div style={{ marginBottom:28 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:16 }}>
        <div>
          <h1 style={{ margin:0, fontSize:28, fontWeight:800, color:'#e5e0f0', letterSpacing:-0.5 }}>
            {greeting}, {firstName} {emoji}
          </h1>
          <p style={{ margin:'5px 0 0', fontSize:13, color:'#6b6880' }}>{today} · {MOCK_SPRINT.name} is active</p>
        </div>
        {/* Quick action buttons — useNavigate for SPA navigation without full page reload */}
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {QUICK.map(q => (
            <button key={q.path} onClick={()=>navigate(q.path)} style={{ padding:'9px 16px', fontSize:13, fontWeight:600, borderRadius:10, border:'1px solid rgba(167,139,250,0.2)', background:q.color, color:'#fff', cursor:'pointer', boxShadow: q.color.includes('7c3aed')?'0 6px 18px rgba(124,58,237,0.4)':'none' }}>
              {q.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── SECTION 2: KPI Stat Cards ────────────────────────────
   WHY: useMemo derives every number from MOCK_* data.
   When you connect an API, replace MOCK_ with API response
   and all KPIs update automatically — no other changes needed.
   Each card has: icon, label, value, trend delta, accent color. */
function StatCards({ stats }) {
  const CARDS = [
    { icon:'📁', label:'Total Projects',   value: stats.totalProjects,  delta:`${stats.activeProjects} active`,     color:'#a78bfa' },
    { icon:'🚀', label:'Active Sprints',   value: stats.activeSprints,  delta:'Current: Sprint 5',                  color:'#3b82f6' },
    { icon:'📋', label:'Open Tasks',       value: stats.openTasks,      delta:`${stats.overdueTasks} overdue`,      color: stats.overdueTasks>0?'#ef4444':'#22c55e' },
    { icon:'✅', label:'Completed Tasks',  value: stats.doneTasks,      delta:`${stats.donePercent}% of total`,     color:'#22c55e' },
    { icon:'👥', label:'Team Members',     value: stats.members,        delta:'Across 3 departments',               color:'#f59e0b' },
    { icon:'⚡', label:'Sprint Velocity',  value:`${stats.velocity} pts`,delta:`▲ ${stats.velocityDelta} vs last`, color:'#c4b5fd' },
  ];
  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(190px,1fr))', gap:14, marginBottom:24 }}>
      {CARDS.map(c => (
        <div key={c.label} style={{ background:'rgba(255,255,255,0.045)', border:`1px solid ${c.color}33`, borderRadius:14, padding:'18px 20px', transition:'transform 0.15s, border-color 0.15s', cursor:'default' }}
          onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.borderColor=c.color+'88';}}
          onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.borderColor=c.color+'33';}}>
          <div style={{ fontSize:22, marginBottom:10 }}>{c.icon}</div>
          <div style={{ fontSize:26, fontWeight:800, color:c.color, lineHeight:1 }}>{c.value}</div>
          <div style={{ fontSize:12, color:'#9d94b5', marginTop:5 }}>{c.label}</div>
          <div style={{ fontSize:11, color:'#6b6880', marginTop:3 }}>{c.delta}</div>
        </div>
      ))}
    </div>
  );
}

/* ─── Sprint Progress Panel ─────────────────────────────────
   WHY: Sprint progress is the most important daily metric in agile.
   Pure CSS progress bar — no chart library needed for a simple linear bar.
   daysRemaining computed live from today's date vs sprint end date. */
function SprintPanel() {
  const { name, goal, endDate, totalPoints, completedPoints } = MOCK_SPRINT;
  const pct = Math.round((completedPoints / totalPoints) * 100);
  const daysLeft = Math.max(0, Math.ceil((new Date(endDate) - new Date()) / 86400000));

  return (
    <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(167,139,250,0.15)', borderRadius:14, padding:'20px 22px', marginBottom:16 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14, flexWrap:'wrap', gap:8 }}>
        <div>
          <div style={{ fontSize:12, fontWeight:700, color:'#7c3aed', letterSpacing:1, textTransform:'uppercase', marginBottom:4 }}>Active Sprint</div>
          <div style={{ fontSize:17, fontWeight:800, color:'#e5e0f0' }}>{name}</div>
          <div style={{ fontSize:12, color:'#6b6880', marginTop:3 }}>{goal}</div>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontSize:22, fontWeight:800, color: daysLeft<=3?'#ef4444':'#c4b5fd' }}>{daysLeft}</div>
          <div style={{ fontSize:11, color:'#6b6880' }}>days left</div>
        </div>
      </div>
      {/* Progress bar — width% driven by completedPoints / totalPoints */}
      <div style={{ marginBottom:10 }}>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'#6b6880', marginBottom:6 }}>
          <span>{completedPoints} / {totalPoints} story points</span>
          <span style={{ color:'#c4b5fd', fontWeight:700 }}>{pct}%</span>
        </div>
        <div style={{ height:8, borderRadius:8, background:'rgba(255,255,255,0.08)', overflow:'hidden' }}>
          <div style={{ height:'100%', width:`${pct}%`, borderRadius:8, background:'linear-gradient(90deg,#7c3aed,#a78bfa)', transition:'width 0.6s ease' }} />
        </div>
      </div>
      <div style={{ display:'flex', gap:10, fontSize:12, color:'#6b6880' }}>
        <span>📅 Ends {endDate}</span>
        <span style={{ marginLeft:'auto', color: pct>=80?'#22c55e':'#9d94b5' }}>{pct>=80?'🟢 On track':'🟡 Monitor closely'}</span>
      </div>
    </div>
  );
}

/* ─── Activity Feed ─────────────────────────────────────────
   WHY: Users need to see "what happened while I was away".
   A timestamped feed is the #1 feature that reduces the need
   for status meetings — you see the board changed at a glance. */
function ActivityFeed() {
  return (
    <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(167,139,250,0.15)', borderRadius:14, padding:'20px 22px' }}>
      <div style={{ fontSize:14, fontWeight:700, color:'#c4b5fd', marginBottom:14 }}>Recent Activity</div>
      <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
        {MOCK_ACTIVITY.map((a,i) => (
          <div key={i} style={{ display:'flex', gap:12, padding:'10px 0', borderBottom: i<MOCK_ACTIVITY.length-1?'1px solid rgba(167,139,250,0.07)':'none', alignItems:'flex-start' }}>
            <span style={{ fontSize:16, flexShrink:0, marginTop:1 }}>{a.icon}</span>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:13, color:'#d6d0e6', lineHeight:1.4 }}>{a.text}</div>
              <div style={{ fontSize:11, color:'#6b6880', marginTop:2 }}>{a.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Task Breakdown (pure CSS bars) ────────────────────────
   WHY: Pure CSS width-based bars replace a chart library entirely.
   The widths are percentages computed from task counts — no recharts,
   no d3, no canvas needed. Lightweight and fast. */
function TaskBreakdown({ stats }) {
  const rows = [
    { label:'Backlog',     count:stats.backlog,     color:'#6b7280' },
    { label:'To Do',       count:stats.todo,        color:'#f59e0b' },
    { label:'In Progress', count:stats.inProgress,  color:'#3b82f6' },
    { label:'Review',      count:stats.review,      color:'#f97316' },
    { label:'Done',        count:stats.doneTasks,   color:'#22c55e' },
  ];
  const max = Math.max(...rows.map(r=>r.count), 1);
  return (
    <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(167,139,250,0.15)', borderRadius:14, padding:'20px 22px', marginBottom:14 }}>
      <div style={{ fontSize:14, fontWeight:700, color:'#c4b5fd', marginBottom:16 }}>Task Breakdown</div>
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {rows.map(r => (
          <div key={r.label}>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'#9d94b5', marginBottom:4 }}>
              <span>{r.label}</span><span style={{ color:r.color, fontWeight:700 }}>{r.count}</span>
            </div>
            {/* Bar width = (count / max) * 100% — scales relative to busiest status */}
            <div style={{ height:6, borderRadius:6, background:'rgba(255,255,255,0.07)', overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${(r.count/max)*100}%`, background:r.color, borderRadius:6, transition:'width 0.5s ease', opacity:0.85 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Quick Links ────────────────────────────────────────────
   WHY: Reduces clicks. The dashboard is the entry point —
   from here you should reach any major section in 1 click. */
function QuickLinks({ navigate }) {
  const LINKS = [
    { icon:'📋', label:'Kanban Board', path:'/kanban',              color:'#3b82f6' },
    { icon:'👥', label:'Team',         path:'/team',                color:'#7c3aed' },
    { icon:'📊', label:'Reports',      path:'/reports',             color:'#f59e0b' },
    { icon:'🤖', label:'AI Planner',   path:'/ai/sprint-planner',   color:'#22c55e' },
  ];
  return (
    <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(167,139,250,0.15)', borderRadius:14, padding:'20px 22px' }}>
      <div style={{ fontSize:14, fontWeight:700, color:'#c4b5fd', marginBottom:14 }}>Quick Navigate</div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
        {LINKS.map(l => (
          <button key={l.path} onClick={()=>navigate(l.path)} style={{ padding:'12px 10px', borderRadius:10, border:`1px solid ${l.color}33`, background:`${l.color}11`, color:'#e5e0f0', cursor:'pointer', fontSize:13, fontWeight:600, textAlign:'left', display:'flex', alignItems:'center', gap:8, transition:'background 0.15s' }}
            onMouseEnter={e=>e.currentTarget.style.background=`${l.color}22`}
            onMouseLeave={e=>e.currentTarget.style.background=`${l.color}11`}>
            <span style={{ fontSize:18 }}>{l.icon}</span>{l.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── AI Insights Panel ─────────────────────────────────────
   WHY: The old dashboard had ONE static sentence for "AI Insights".
   This panel derives 3 real insights from actual data:
   1. Velocity trend (compare this sprint vs last)
   2. At-risk tasks (High priority + not Done)
   3. Team load (who has the most In Progress tasks)
   These change automatically as MOCK_ data changes — not hard-coded strings. */
function AIInsights({ stats, navigate }) {
  // Derive insights from data — not static strings
  const velocityDelta = MOCK_SPRINT.completedPoints - MOCK_SPRINT.velocityLastSprint;
  const atRisk = MOCK_TASKS.filter(t=>t.priority==='High' && t.status!=='Done').length;
  const assigneeCounts = MOCK_TASKS.filter(t=>t.status==='In Progress').reduce((acc,t)=>{ acc[t.assignee]=(acc[t.assignee]||0)+1; return acc; },{});
  const busiestMember = Object.entries(assigneeCounts).sort((a,b)=>b[1]-a[1])[0];
  const memberName = MOCK_MEMBERS.find(m=>m.initials===busiestMember?.[0])?.name || busiestMember?.[0];

  const INSIGHTS = [
    { icon:'⚡', color:'#a78bfa', title:'Velocity Trending Up', body:`Sprint 5 at ${MOCK_SPRINT.completedPoints} pts vs ${MOCK_SPRINT.velocityLastSprint} pts last sprint — ${velocityDelta>0?`▲ ${velocityDelta} pts ahead`:'on par'}.`, action:()=>navigate('/sprints') },
    { icon:'⚠️', color:'#ef4444', title:`${atRisk} High-Priority Tasks Open`, body:`${atRisk} High priority tasks are not yet Done. Review sprint backlog to prevent deadline risk.`, action:()=>navigate('/kanban') },
    { icon:'👤', color:'#f59e0b', title:'Team Load Alert', body:`${memberName} has the most In-Progress tasks. Consider rebalancing to maintain flow.`, action:()=>navigate('/team') },
  ];

  return (
    <div style={{ marginTop:24 }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
        <span style={{ fontSize:18 }}>🤖</span>
        <span style={{ fontSize:16, fontWeight:800, color:'#c4b5fd' }}>AI Insights</span>
        <span style={{ fontSize:11, padding:'2px 8px', borderRadius:20, background:'rgba(124,58,237,0.2)', color:'#a78bfa', fontWeight:600 }}>Live</span>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:14 }}>
        {INSIGHTS.map((ins,i) => (
          <div key={i} style={{ background:'rgba(255,255,255,0.04)', border:`1px solid ${ins.color}33`, borderRadius:14, padding:'18px 20px', transition:'border-color 0.2s, transform 0.15s' }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=ins.color+'88';e.currentTarget.style.transform='translateY(-2px)';}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=ins.color+'33';e.currentTarget.style.transform='none';}}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
              <span style={{ fontSize:20 }}>{ins.icon}</span>
              <span style={{ fontSize:13, fontWeight:700, color:ins.color }}>{ins.title}</span>
            </div>
            <p style={{ margin:'0 0 14px', fontSize:13, color:'#9d94b5', lineHeight:1.55 }}>{ins.body}</p>
            <button onClick={ins.action} style={{ padding:'7px 14px', fontSize:12, fontWeight:700, borderRadius:8, background:`${ins.color}18`, border:`1px solid ${ins.color}44`, color:ins.color, cursor:'pointer' }}>
              View →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════
   useMemo derives all KPI numbers from MOCK_ data once.
   WHY useMemo: if we computed these inside the JSX, they'd
   re-compute on EVERY re-render. useMemo caches the result
   and only re-runs when the dependency (MOCK_ data) changes. */
export default function Dashboard() {
  const navigate = useNavigate();

  const stats = useMemo(() => {
    const done       = MOCK_TASKS.filter(t=>t.status==='Done').length;
    const total      = MOCK_TASKS.length;
    const inProgress = MOCK_TASKS.filter(t=>t.status==='In Progress').length;
    return {
      totalProjects:   MOCK_PROJECTS.length,
      activeProjects:  MOCK_PROJECTS.filter(p=>p.status==='Active').length,
      activeSprints:   1,
      openTasks:       MOCK_TASKS.filter(t=>t.status!=='Done').length,
      overdueTasks:    MOCK_TASKS.filter(t=>t.priority==='High'&&t.status!=='Done').length,
      doneTasks:       done,
      donePercent:     Math.round((done/total)*100),
      members:         MOCK_MEMBERS.length,
      velocity:        MOCK_SPRINT.completedPoints,
      velocityDelta:   MOCK_SPRINT.completedPoints - MOCK_SPRINT.velocityLastSprint,
      backlog:         MOCK_TASKS.filter(t=>t.status==='Backlog').length,
      todo:            MOCK_TASKS.filter(t=>t.status==='To Do').length,
      inProgress,
      review:          MOCK_TASKS.filter(t=>t.status==='Review').length,
    };
  }, []); // [] = computed once on mount; add API state here when backend is wired

  return (
    <PageWrapper>
      <HeroHeader navigate={navigate} />
      <StatCards  stats={stats} />
      <SprintPanel />

      {/* Two-column body layout
          flex row on wide screens, stacks to column on narrow screens.
          Left (flex:2) = activity feed wider; Right (flex:1) = sidebar feel */}
      <div style={{ display:'flex', gap:16, flexWrap:'wrap', alignItems:'flex-start' }}>
        <div style={{ flex:'2 1 320px', minWidth:0 }}>
          <ActivityFeed />
        </div>
        <div style={{ flex:'1 1 240px', minWidth:0 }}>
          <TaskBreakdown stats={stats} />
          <QuickLinks    navigate={navigate} />
        </div>
      </div>

      <AIInsights stats={stats} navigate={navigate} />
    </PageWrapper>
  );
}