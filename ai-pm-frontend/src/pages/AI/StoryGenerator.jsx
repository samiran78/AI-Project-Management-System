import { useState } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';

function StoryGenerator() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);

  const generate = () => {
    // Mock AI response for demo — real API call wired later
    setResult({
      story: `As a user, I want to ${input.toLowerCase()} so that I can access my account securely.`,
      acceptanceCriteria: ['Valid credentials log the user in', 'Invalid credentials show an error', 'Session persists on refresh'],
      storyPoints: 5,
      priority: 'High',
    });
  };

  return (
    <PageWrapper>
      <h1>AI User Story Generator</h1>
      <input
        placeholder="e.g. Create Login Feature"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        style={{ padding: 10, width: 300, marginTop: 20 }}
      />
      <button onClick={generate} style={{ marginLeft: 10, padding: '10px 20px' }}>Generate</button>

      {result && (
        <div style={{ background: '#fff', padding: 20, borderRadius: 10, marginTop: 20 }}>
          <p><b>User Story:</b> {result.story}</p>
          <p><b>Acceptance Criteria:</b></p>
          <ul>{result.acceptanceCriteria.map((c) => <li key={c}>{c}</li>)}</ul>
          <p><b>Story Points:</b> {result.storyPoints} | <b>Priority:</b> {result.priority}</p>
        </div>
      )}
    </PageWrapper>
  );
}
export default StoryGenerator;