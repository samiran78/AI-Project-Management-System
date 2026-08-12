import PageWrapper from '../../components/layout/PageWrapper';

function AISprintPlanner() {
  return (
    <PageWrapper>
      <h1>AI Sprint Planner</h1>
      <div style={{ background: '#fff', padding: 20, borderRadius: 10, marginTop: 20 }}>
        <p><b>Suggested Capacity:</b> 38 pts</p>
        <p><b>Suggested Sprint Length:</b> 2 weeks</p>
        <p><b>Suggested Members:</b> Samiran, Priya</p>
        <p><b>Risk:</b> Medium — 1 member on partial leave this sprint</p>
      </div>
    </PageWrapper>
  );
}
export default AISprintPlanner;