import { Link } from 'react-router-dom';

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
    <div style={{ width: 220, minHeight: '100vh', background: '#1e1e2f', color: '#fff', padding: '20px 10px' }}>
      <h3 style={{ padding: '0 10px 20px' }}>AI PM System</h3>
      {links.map((l) => (
        <Link key={l.to} to={l.to} style={{ display: 'block', color: '#ccc', padding: '10px', textDecoration: 'none' }}>
          {l.label}
        </Link>
      ))}
    </div>
  );
}

export default Sidebar;