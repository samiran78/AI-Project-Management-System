import { useState } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';

// starting board data — this becomes editable once the component mounts
const initialColumns = {
  Backlog: ['Setup CI/CD', 'Design DB schema'],
  'To Do': ['Build login page', 'Create API contracts'],
  'In Progress': ['AI Story Generator endpoint'],
  'Code Review': ['Sprint Planner logic'],
  Testing: [],
  Done: ['Project setup', 'Folder structure'],
};

function KanbanBoard() {
  // keeping the whole board in one state object so adding a task
  // just means updating the array for that one column
  const [columns, setColumns] = useState(initialColumns);
  const [newTask, setNewTask] = useState('');
  const [activeColumn, setActiveColumn] = useState('To Do');

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    setColumns((prev) => ({
      ...prev,
      [activeColumn]: [...prev[activeColumn], newTask.trim()],
    }));

    setNewTask('');
  };

  return (
    <PageWrapper>
      <h1 style={{ color: '#c4b5fd' }}>Kanban Board</h1>

      {/* quick-add bar — lets us show live data entry in the demo instead of a static board */}
      <form
        onSubmit={handleAddTask}
        style={{ display: 'flex', gap: 10, margin: '20px 0', flexWrap: 'wrap' }}
      >
       <input
  type="text"
  placeholder="New task title..."
  value={newTask}
  onChange={(e) => setNewTask(e.target.value)}
  style={{
    flex: 1, minWidth: 200, padding: 10,
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(167,139,250,0.3)',
    color: '#fff',
    borderRadius: 8,
  }}
/>
        <select
          value={activeColumn}
          onChange={(e) => setActiveColumn(e.target.value)}
          style={{
            padding: 10,
            background: 'rgba(255,255,255,0.06)',
            color: '#fff',
            border: '1px solid rgba(167,139,250,0.3)',
            borderRadius: 8,
          }}
        >
          {Object.keys(columns).map((col) => (
            <option key={col} value={col} style={{ background: '#1a0f2e' }}>
              {col}
            </option>
          ))}
        </select>
        <button type="submit" style={{ padding: '10px 20px' }}>Add Task</button>
      </form>

      <div style={{ display: 'flex', gap: 15, overflowX: 'auto' }}>
        {Object.entries(columns).map(([col, tasks]) => (
          <div
            key={col}
            style={{
              minWidth: 230,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(167,139,250,0.2)',
              borderRadius: 12,
              padding: 14,
            }}
          >
            <h4 style={{ color: '#c4b5fd' }}>{col} ({tasks.length})</h4>
            {tasks.map((t, i) => (
              <div
                key={`${col}-${i}`}
                style={{
                  background: 'rgba(167,139,250,0.1)',
                  padding: 10,
                  borderRadius: 8,
                  marginTop: 8,
                  color: '#e5e0f0',
                }}
              >
                {t}
              </div>
            ))}
          </div>
        ))}
      </div>
    </PageWrapper>
  );
}

export default KanbanBoard;