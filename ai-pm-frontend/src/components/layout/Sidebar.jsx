/*
  ═══════════════════════════════════════════════════════════
  SIDEBAR — READ THIS
  ═══════════════════════════════════════════════════════════

  WHAT CHANGED FROM OLD VERSION:
  Old: plain text list, no icons, no grouping, no branding, no user info

  New:
  1. Logo block at top (branded, not just plain text)
  2. Nav links with ICONS — i did this coz icons give instant recognition.
     You can scan "📋" faster than reading "Kanban Board".
  3. Section groupings — "MAIN" and "AI TOOLS" separators.
     i did this coz 10 flat items is overwhelming. Grouping = clarity.
  4. User profile block at the bottom.
     i did this coz every professional app (Notion, Linear, Slack) puts
     the logged-in user at the bottom of the sidebar — it anchors identity.
  5. Logout button in the profile block.

  CONCEPTS USED:
  - useAuth()       → reads logged-in user from AuthContext
  - useNavigate()   → logout redirects to /login programmatically
  - NavLink isActive → React Router gives us isActive boolean for styling
  ═══════════════════════════════════════════════════════════
*/

import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/* ── Nav link groups — separated so the sidebar has visual hierarchy ──
   i did this coz one flat list of 10 items is cognitively heavier
   than two labeled groups of 4-5 items. */
const MAIN_LINKS = [
  { to: '/dashboard', label: 'Dashboard',   icon: '🏠' },
  { to: '/projects',  label: 'Projects',    icon: '📁' },
  { to: '/sprints',   label: 'Sprints',     icon: '🚀' },
  { to: '/kanban',    label: 'Kanban Board',icon: '📋' },
  { to: '/team',      label: 'Team',        icon: '👥' },
  { to: '/calendar',  label: 'Calendar',    icon: '📅' },
  { to: '/reports',   label: 'Reports',     icon: '📊' },
];

const AI_LINKS = [
  { to: '/ai/story-generator', label: 'Story Generator', icon: '✨' },
  { to: '/ai/sprint-planner',  label: 'Sprint Planner',  icon: '🤖' },
];

/* ── Avatar helpers ── */
const AV_COLORS = ['#7c3aed','#2563eb','#0891b2','#059669','#d97706'];
const avBg = s => { let h=0; for(const c of (s||'U')) h=(h*31+c.charCodeAt(0))%AV_COLORS.length; return AV_COLORS[h]; };
const initials = n => (n||'User').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();

/* ── Single NavLink item ──
   Extracted so hover logic + active logic live in one place.
   i did this coz duplicating the style function twice (for main + ai links)
   would mean changing styles in two places — bug risk. */
function NavItem({ to, label, icon }) {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        color: isActive ? '#fff' : '#b0a8cc',
        background: isActive ? 'linear-gradient(135deg, #7c3aed, #9333ea)' : 'transparent',
        padding: '10px 12px',
        textDecoration: 'none',
        borderRadius: 9,
        marginBottom: 2,
        fontWeight: isActive ? 600 : 400,
        fontSize: 13.5,
        transition: 'background 0.15s, color 0.15s',
        boxShadow: isActive ? '0 4px 14px rgba(124,58,237,0.35)' : 'none',
      })}
      /* onMouseEnter/Leave can't be used in NavLink style fn — we use CSS class trick via title attr */
    >
      <span style={{ fontSize: 15, flexShrink: 0 }}>{icon}</span>
      {label}
    </NavLink>
  );
}

/* ── Section label (divider) ──
   i did this coz visual groupings reduce cognitive load significantly */
function SectionLabel({ label }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 700, color: '#4a4060',
      letterSpacing: 1.2, textTransform: 'uppercase',
      padding: '14px 12px 6px',
    }}>
      {label}
    </div>
  );
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  /* Prefer the profile name saved in settings, fall back to auth user name */
  const profileName = JSON.parse(localStorage.getItem('profile') || '{}').name
    || user?.name
    || 'Samiran Roy';

  const profileRole = JSON.parse(localStorage.getItem('profile') || '{}').role
    || user?.role
    || 'Full Stack Dev';

  const handleLogout = () => {
    logout();           // clears token from AuthContext + localStorage
    navigate('/login'); // send to login page
  };

  return (
    <div style={{
      width: 240,
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #130a22 0%, #0d0617 100%)',
      borderRight: '1px solid rgba(167,139,250,0.12)',
      display: 'flex',
      flexDirection: 'column',
      /* flex column so the user profile block can be pushed to the BOTTOM
         using marginTop:auto on the last section */
      position: 'sticky',
      top: 0,
      overflowY: 'auto',
      padding: '0 10px',
      boxSizing: 'border-box',
    }}>

      {/* ── Logo / Brand block ────────────────────────────────── */}
      <div style={{
        padding: '22px 12px 18px',
        borderBottom: '1px solid rgba(167,139,250,0.1)',
        marginBottom: 4,
      }}>
        {/* Logo mark — gradient circle + text */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: 'linear-gradient(135deg, #7c3aed, #9333ea)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontWeight: 800, color: '#fff',
            boxShadow: '0 4px 14px rgba(124,58,237,0.5)',
            flexShrink: 0,
          }}>⚡</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#e5e0f0', letterSpacing: 0.3 }}>AI PM</div>
            <div style={{ fontSize: 10, color: '#5a5070', letterSpacing: 0.5 }}>Project Manager</div>
          </div>
        </div>
      </div>

      {/* ── Main navigation ───────────────────────────────────── */}
      <SectionLabel label="Main" />
      {MAIN_LINKS.map(l => <NavItem key={l.to} {...l} />)}

      {/* ── AI Tools section ──────────────────────────────────── */}
      <SectionLabel label="AI Tools" />
      {AI_LINKS.map(l => <NavItem key={l.to} {...l} />)}

      {/* ── Settings link ─────────────────────────────────────── */}
      <SectionLabel label="Account" />
      <NavItem to="/settings" label="Settings" icon="⚙️" />

      {/* ── User profile block at bottom ──────────────────────────
          marginTop:auto pushes this to the VERY BOTTOM of the sidebar.
          i did this coz industry apps (Linear, Notion, Slack) always anchor
          the logged-in user identity at the bottom — it's a UX convention
          users expect. Breaking it would feel off. */}
      <div style={{ marginTop: 'auto', padding: '14px 0 12px' }}>
        <div style={{
          borderTop: '1px solid rgba(167,139,250,0.1)',
          paddingTop: 14,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          {/* Avatar */}
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: avBg(profileName),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0,
            boxShadow: `0 0 0 2px ${avBg(profileName)}55`,
          }}>{initials(profileName)}</div>

          {/* Name + role */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#e5e0f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {profileName}
            </div>
            <div style={{ fontSize: 10, color: '#5a5070', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {profileRole}
            </div>
          </div>

          {/* Logout button — icon only to save space */}
          <button
            onClick={handleLogout}
            title="Logout"
            style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.2)',
              color: '#fca5a5',
              width: 30, height: 30,
              borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', fontSize: 13, flexShrink: 0,
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.22)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
          >
            ⎋
          </button>
        </div>
      </div>
    </div>
  );
}