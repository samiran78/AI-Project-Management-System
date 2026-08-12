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
      <h1>Dashboard</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginTop: 20 }}>
        {cards.map((c) => (
          <div key={c.label} style={{ background: '#fff', padding: 20, borderRadius: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
            <div style={{ color: '#888', fontSize: 14 }}>{c.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700 }}>{c.value}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 30, background: '#fff', padding: 20, borderRadius: 10 }}>
        <h3>AI Insights</h3>
        <p>Your team's velocity increased 12% this sprint. 2 tasks are at risk of missing the deadline.</p>
      </div>
    </PageWrapper>
  );
}
export default Dashboard;