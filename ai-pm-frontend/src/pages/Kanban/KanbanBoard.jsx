import PageWrapper from '../../components/layout/PageWrapper';

const columns = {
  Backlog: ['Setup CI/CD', 'Design DB schema'],
  'To Do': ['Build login page', 'Create API contracts'],
  'In Progress': ['AI Story Generator endpoint'],
  'Code Review': ['Sprint Planner logic'],
  Testing: [],
  Done: ['Project setup', 'Folder structure'],
};

function KanbanBoard() {
  return (
    <PageWrapper>
      <h1>Kanban Board</h1>
      <div style={{ display: 'flex', gap: 15, marginTop: 20, overflowX: 'auto' }}>
        {Object.entries(columns).map(([col, tasks]) => (
          <div key={col} style={{ minWidth: 220, background: '#fff', borderRadius: 10, padding: 12 }}>
            <h4>{col} ({tasks.length})</h4>
            {tasks.map((t) => (
              <div key={t} style={{ background: '#f5f6fa', padding: 10, borderRadius: 6, marginTop: 8 }}>{t}</div>
            ))}
          </div>
        ))}
      </div>
    </PageWrapper>
  );
}
export default KanbanBoard;