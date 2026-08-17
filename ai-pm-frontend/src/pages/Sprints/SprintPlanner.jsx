import PageWrapper from '../../components/layout/PageWrapper';

function SprintPlanner() {
  return (
    <PageWrapper>
      <h1 className="page-title">Sprint Management</h1>
      <div className="card" style={{ marginTop: 20 }}>
        <h3 style={{ color: '#fff', marginTop: 0 }}>Sprint 5</h3>
        <p style={{ color: '#d6d0e6' }}>Goal: Ship AI Story Generator MVP</p>
        <p style={{ color: '#d6d0e6' }}>Duration: Aug 12 - Aug 26</p>
        <p style={{ color: '#d6d0e6' }}>Capacity: 40 pts | Committed: 35 pts</p>
        <p style={{ color: '#d6d0e6' }}>Status: <b style={{ color: '#c4b5fd' }}>In Progress</b></p>
      </div>
    </PageWrapper>
  );
}
export default SprintPlanner;