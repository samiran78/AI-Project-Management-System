import PageWrapper from '../../components/layout/PageWrapper';

const team = [
  { name: 'Samiran Roy', role: 'Full Stack Dev', sprint: 'Sprint 5', availability: 'Available' },
  { name: 'Priya Sharma', role: 'Frontend Dev', sprint: 'Sprint 5', availability: 'On Leave' },
];

function TeamManagement() {
  return (
    <PageWrapper>
      <h1>Team</h1>
      <div style={{ marginTop: 20 }}>
        {team.map((m) => (
          <div key={m.name} style={{ background: '#fff', padding: 15, borderRadius: 10, marginBottom: 10 }}>
            <b>{m.name}</b> — {m.role} — {m.sprint} — {m.availability}
          </div>
        ))}
      </div>
    </PageWrapper>
  );
}
export default TeamManagement;