import PageWrapper from '../../components/layout/PageWrapper';

function Dashboard() {
  const cards = [
    { label: 'Total Projects', value: 8 },
    { label: 'Active Sprints', value: 3 },
    { label: 'Pending Tasks', value: 24 },
    { label: 'Completed Tasks', value: 112 },
    { label: 'Team Members', value: 12 },
    { label: 'Sprint Velocity', value: '38 pts' },
  ];
  return (
    <PageWrapper>
      <h1 className="page-title">Dashboard</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18, marginTop: 20 }}>
        {cards.map((c) => (
          <div key={c.label} className="card">
            <div style={{ color: '#a89cc4', fontSize: 13.5 }}>{c.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#fff', marginTop: 6 }}>{c.value}</div>
          </div>
        ))}
      </div>
      <div className="card" style={{ marginTop: 22 }}>
        <h3 style={{ color: '#c4b5fd', marginTop: 0 }}>AI Insights</h3>
        <p style={{ color: '#d6d0e6' }}>Your team's velocity increased 12% this sprint. 2 tasks are at risk of missing the deadline.</p>
      </div>
    </PageWrapper>
  );
}
export default Dashboard;