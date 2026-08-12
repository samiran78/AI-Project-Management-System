import PageWrapper from '../../components/layout/PageWrapper';

const projects = [
  { id: 1, name: 'AI PM System', status: 'Active', priority: 'High' },
  { id: 2, name: 'Client Portal Revamp', status: 'Planning', priority: 'Medium' },
  { id: 3, name: 'Internal Tools', status: 'Active', priority: 'Low' },
];

function ProjectList() {
  return (
    <PageWrapper>
      <h1>Projects</h1>
      <table style={{ width: '100%', marginTop: 20, background: '#fff', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '1px solid #eee' }}>
            <th style={{ padding: 12 }}>Name</th>
            <th style={{ padding: 12 }}>Status</th>
            <th style={{ padding: 12 }}>Priority</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((p) => (
            <tr key={p.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
              <td style={{ padding: 12 }}>{p.name}</td>
              <td style={{ padding: 12 }}>{p.status}</td>
              <td style={{ padding: 12 }}>{p.priority}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </PageWrapper>
  );
}
export default ProjectList;