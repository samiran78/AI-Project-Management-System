import { NavLink } from 'react-router-dom';

function Sidebar() {
  const links = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/projects', label: 'Projects' },
    { to: '/sprints', label: 'Sprints' },
    { to: '/kanban', label: 'Kanban Board' },
    { to: '/team', label: 'Team' },
    { to: '/calendar', label: 'Calendar' },
    { to: '/reports', label: 'Reports' },
    { to: '/ai/story-generator', label: 'AI Story Generator' },
    { to: '/ai/sprint-planner', label: 'AI Sprint Planner' },
    { to: '/settings', label: 'Settings' },
  ];

  return (
    <div style={{
      width: 240, minHeight: '100vh',
      background: 'linear-gradient(180deg, #1a0f2e, #0f0817)',
      color: '#e5e0f0', padding: '24px 14px',
      borderRight: '1px solid rgba(167,139,250,0.15)',
      position: 'sticky', top: 0,
    }}>
      <h3 style={{ padding: '0 10px 28px', color: '#c4b5fd', letterSpacing: 0.5, margin: 0 }}>
        AI PM System
      </h3>
      {links.map((l) => (
        <NavLink
          key={l.to}
          to={l.to}
          style={({ isActive }) => ({
            display: 'block',
            color: isActive ? '#fff' : '#c9c2dd',
            background: isActive ? 'linear-gradient(135deg, #7c3aed, #9333ea)' : 'transparent',
            padding: '11px 14px',
            textDecoration: 'none',
            borderRadius: 8,
            marginBottom: 4,
            fontWeight: isActive ? 600 : 400,
            fontSize: 14.5,
            transition: 'background 0.15s',
          })}
        >
          {l.label}
        </NavLink>
      ))}
    </div>
  );
}

export default Sidebar;