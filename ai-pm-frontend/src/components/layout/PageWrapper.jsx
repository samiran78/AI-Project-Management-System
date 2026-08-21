/*
  ═══════════════════════════════════════════════════════════
  PAGE WRAPPER — READ THIS
  ═══════════════════════════════════════════════════════════

  WHAT THIS FILE DOES:
  Every page in the app (Dashboard, Kanban, Team, etc.) is wrapped
  in this component. It renders:
    1. Sidebar (left)
    2. Main area (right):
         a. Top header bar — page title + current time + notification bell
         b. Content area  — the actual page content (children)

  WHY A TOP HEADER BAR:
  Industry PM tools (Linear, Jira, Notion, ClickUp) always have BOTH:
    - Left sidebar = global navigation
    - Top bar      = page context (what page am I on?) + user actions
  Without a top bar, the page feels like a raw document, not an app.

  HOW children WORKS (concept for Samiran):
  PageWrapper is used like this in every page:
    <PageWrapper>
      <h1>My Page</h1>
      <p>Content here</p>
    </PageWrapper>

  Everything between <PageWrapper> and </PageWrapper> becomes `children`.
  It's exactly like Python's context manager — wrapper runs setup,
  yields to your code, then runs teardown. Here there's no teardown,
  just: render sidebar + header, then render {children} in the content area.

  LAYOUT STRUCTURE:
  ┌─────────────────────────────────────────────────┐
  │ [Sidebar 240px] │ [Main area flex:1]             │
  │                 │ ┌─────────────────────────────┐│
  │                 │ │ Top header bar (48px)        ││
  │                 │ ├─────────────────────────────┤│
  │                 │ │                             ││
  │                 │ │   {children}  (page content)││
  │                 │ │                             ││
  │                 │ └─────────────────────────────┘│
  └─────────────────────────────────────────────────┘

  FLEX CONCEPTS:
  - display:flex on outer div = sidebar + main sit side by side
  - flex:1 on main = it takes ALL remaining width after sidebar's 240px
  - minWidth:0 on main = allows it to shrink below its content width
    (without this, wide content like the Kanban grid causes horizontal overflow)
  - flexDirection:column on main = header bar stacks ABOVE content
  ═══════════════════════════════════════════════════════════
*/

import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';

/* ── Route → Page title map ──────────────────────────────────────
   i did this coz the top bar needs to show the current page name.
   useLocation() gives us the current path (e.g. "/kanban").
   We map it to a human-readable title + emoji.
   If a path isn't found, we fall back to "AI PM System". */
const PAGE_TITLES = {
  '/dashboard':          { title: 'Dashboard',        icon: '🏠' },
  '/projects':           { title: 'Projects',          icon: '📁' },
  '/sprints':            { title: 'Sprint Planner',    icon: '🚀' },
  '/kanban':             { title: 'Kanban Board',      icon: '📋' },
  '/team':               { title: 'Team Management',   icon: '👥' },
  '/calendar':           { title: 'Calendar',          icon: '📅' },
  '/reports':            { title: 'Reports',           icon: '📊' },
  '/ai/story-generator': { title: 'AI Story Generator',icon: '✨' },
  '/ai/sprint-planner':  { title: 'AI Sprint Planner', icon: '🤖' },
  '/settings':           { title: 'Settings',          icon: '⚙️' },
};

/* ── Live clock ──────────────────────────────────────────────────
   Shows current time in the top bar.
   i did this coz a clock is a subtle but powerful "app" signal —
   it makes the UI feel alive and real-time, not static.
   We use a simple approach: render the time string once on mount.
   (For a ticking clock you'd use setInterval in useEffect,
    but a static time-on-render is enough here without complexity.) */
function LiveTime() {
  const now = new Date();
  const time = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  const date = now.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
  return (
    <div style={{ textAlign: 'right' }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#c4b5fd' }}>{time}</div>
      <div style={{ fontSize: 10, color: '#5a5070' }}>{date}</div>
    </div>
  );
}

/* ── Top Header Bar component ────────────────────────────────────*/
function TopBar() {
  /* useLocation is a React Router hook — gives us the current URL path.
     i did this coz we need to know which page we're on to show the title. */
  const { pathname } = useLocation();
  const page = PAGE_TITLES[pathname] || { title: 'AI PM System', icon: '⚡' };

  return (
    <div style={{
      height: 56,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 28px',
      borderBottom: '1px solid rgba(167,139,250,0.1)',
      background: 'rgba(13,6,23,0.6)',
      backdropFilter: 'blur(10px)',
      /* backdropFilter:blur — i did this coz it gives a "frosted glass" effect
         when page content scrolls behind the header. Very modern, very clean. */
      flexShrink: 0,
      /* flexShrink:0 — i did this coz in a flex column layout, children can
         shrink to fit. We never want the header to shrink — it must stay 56px. */
      position: 'sticky',
      top: 0,
      zIndex: 100,
      /* sticky + zIndex — header stays at the top when you scroll the content below */
    }}>

      {/* Left: breadcrumb / page title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Sprint 5 active badge — always visible as a sprint status signal */}
        <span style={{ fontSize: 18 }}>{page.icon}</span>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#e5e0f0', lineHeight: 1 }}>{page.title}</div>
          <div style={{ fontSize: 10, color: '#5a5070', marginTop: 2 }}>AI PM System</div>
        </div>

        {/* Active sprint pill — quick context without navigating */}
        <div style={{
          marginLeft: 14,
          fontSize: 11, fontWeight: 600,
          padding: '3px 10px', borderRadius: 20,
          background: 'rgba(124,58,237,0.18)',
          border: '1px solid rgba(167,139,250,0.25)',
          color: '#c4b5fd',
          display: 'flex', alignItems: 'center', gap: 5,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block', boxShadow: '0 0 6px #22c55e' }} />
          Sprint 5 Active
        </div>
      </div>

      {/* Right: clock + notification bell */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <LiveTime />

        {/* Notification bell with badge */}
        <div style={{ position: 'relative', cursor: 'pointer' }}
          title="Notifications">
          <div style={{ fontSize: 18, color: '#9d94b5' }}>🔔</div>
          {/* Unread badge — i did this coz it draws attention to pending items
              without being intrusive. Position:absolute on badge + relative on parent
              is the standard CSS pattern for overlaid badges. */}
          <div style={{
            position: 'absolute', top: -4, right: -4,
            width: 14, height: 14, borderRadius: '50%',
            background: 'linear-gradient(135deg,#ef4444,#dc2626)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 8, fontWeight: 800, color: '#fff',
            boxShadow: '0 0 6px rgba(239,68,68,0.6)',
          }}>3</div>
        </div>
      </div>
    </div>
  );
}

/* ── Main PageWrapper export ─────────────────────────────────────*/
export default function PageWrapper({ children }) {
  return (
    /*
      Outer div: display:flex → sidebar and main sit side by side (horizontal row).
      minHeight:100vh → the layout always fills the full screen height,
      even if content is short.
    */
    <div style={{ display: 'flex', minHeight: '100vh' }}>

      {/* Sidebar — fixed 240px wide, always visible */}
      <Sidebar />

      {/*
        Main area — takes all remaining width (flex:1).
        flexDirection:column → TopBar stacks ABOVE content vertically.
        minWidth:0 → allows this flex child to shrink below its content width.
          Without this: if Kanban grid is 1400px wide, this div refuses to
          shrink → horizontal scrollbar on the whole page → layout looks broken.
          With minWidth:0: this div can be as narrow as needed → grid scrolls
          inside it correctly.
      */}
      <div style={{
        flex: 1,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        color: '#fff',
      }}>

        {/* Top header bar — sticky, always at top of content area */}
        <TopBar />

        {/*
          Content area — scrollable, padded.
          overflowX:hidden → no horizontal scroll from stray wide elements.
          This is where each page's actual content renders ({children}).
        */}
        <div style={{
          flex: 1,
          padding: '28px 30px',
          overflowX: 'hidden',
          boxSizing: 'border-box',
        }}>
          {children}
        </div>

      </div>
    </div>
  );
}