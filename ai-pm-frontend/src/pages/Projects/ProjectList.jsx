import PageWrapper from '../../components/layout/PageWrapper';

const projects = [
  { id: 1, name: 'AI PM System', status: 'Active', priority: 'High' },
  { id: 2, name: 'Client Portal Revamp', status: 'Planning', priority: 'Medium' },
  { id: 3, name: 'Internal Tools', status: 'Active', priority: 'Low' },
];

function ProjectList() {
  return (
    <PageWrapper>
      <h1 className="page-title">Projects</h1>
      <div className="card" style={{ marginTop: 20, padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid rgba(167,139,250,0.2)' }}>
              <th style={{ padding: 14, color: '#c4b5fd' }}>Name</th>
              <th style={{ padding: 14, color: '#c4b5fd' }}>Status</th>
              <th style={{ padding: 14, color: '#c4b5fd' }}>Priority</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p.id} style={{ borderBottom: '1px solid rgba(167,139,250,0.08)' }}>
                <td style={{ padding: 14, color: '#e5e0f0' }}>{p.name}</td>
                <td style={{ padding: 14, color: '#d6d0e6' }}>{p.status}</td>
                <td style={{ padding: 14, color: '#d6d0e6' }}>{p.priority}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageWrapper>
  );
}
export default ProjectList;