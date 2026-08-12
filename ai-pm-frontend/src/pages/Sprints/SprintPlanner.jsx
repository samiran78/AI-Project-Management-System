import PageWrapper from '../../components/layout/PageWrapper';

function SprintPlanner() {
  return (
    <PageWrapper>
      <h1>Sprint Management</h1>
      <div style={{ background: '#fff', padding: 20, borderRadius: 10, marginTop: 20 }}>
        <h3>Sprint 5</h3>
        <p>Goal: Ship AI Story Generator MVP</p>
        <p>Duration: Aug 12 - Aug 26</p>
        <p>Capacity: 40 pts | Committed: 35 pts</p>
        <p>Status: <b>In Progress</b></p>
      </div>
    </PageWrapper>
  );
}
export default SprintPlanner;