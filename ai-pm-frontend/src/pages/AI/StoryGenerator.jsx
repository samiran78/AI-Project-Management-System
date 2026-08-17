import { useState } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';

function StoryGenerator() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  //NOTE:->When React Router swaps to another page, it unmounts that component entirely — the component function,
  //  and everything in its local state, is destroyed, not paused. 
  // Navigate back, and StoryGenerator runs from scratch, useState(null) again.

  const generate = () => {
    setResult({
      story: `As a user, I want to ${input.toLowerCase()} so that I can access my account securely.`,
      acceptanceCriteria: [
        'Valid credentials log the user in',
        'Invalid credentials show an error',
        'Session persists on refresh',
      ],
      storyPoints: 5,
      priority: 'High',
    });
  };

  return (
    <PageWrapper>
      <h1 className="page-title">AI User Story Generator</h1>

      <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
        <input
          placeholder="e.g. Create Login Feature"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{ flex: 1, padding: 12 }}
        />
        <button onClick={generate} style={{ padding: '12px 24px' }}>
          Generate
        </button>
      </div>

      {result && (
        <div className="card" style={{ marginTop: 22 }}>
          <p style={{ color: '#e5e0f0' }}>
            <b style={{ color: '#c4b5fd' }}>User Story:</b> {result.story}
          </p>
          <p style={{ color: '#c4b5fd', marginTop: 14 }}>
            <b>Acceptance Criteria:</b>
          </p>
          <ul style={{ color: '#d6d0e6' }}>
            {result.acceptanceCriteria.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
          <p style={{ color: '#e5e0f0', marginTop: 14 }}>
            <b style={{ color: '#c4b5fd' }}>Story Points:</b> {result.storyPoints} |{' '}
            <b style={{ color: '#c4b5fd' }}>Priority:</b> {result.priority}
          </p>
        </div>
      )}
    </PageWrapper>
  );
}
export default StoryGenerator;