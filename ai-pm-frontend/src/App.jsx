import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';   // ← add this import
import Dashboard from './pages/Dashboard/Dashboard';
import ProjectList from './pages/Projects/ProjectList';
import KanbanBoard from './pages/Kanban/KanbanBoard';
import SprintPlanner from './pages/Sprints/SprintPlanner';
import TeamManagement from './pages/Team/TeamManagement';
import Calendar from './pages/Calendar/Calendar';
import Reports from './pages/Reports/Reports';
import Settings from './pages/Settings/Settings';
import StoryGenerator from './pages/AI/StoryGenerator';
import AISprintPlanner from './pages/AI/AISprintPlanner';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />   {/* ← add this route */}
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/projects" element={<ProtectedRoute><ProjectList /></ProtectedRoute>} />
          <Route path="/kanban" element={<ProtectedRoute><KanbanBoard /></ProtectedRoute>} />
          <Route path="/sprints" element={<ProtectedRoute><SprintPlanner /></ProtectedRoute>} />
          <Route path="/team" element={<ProtectedRoute><TeamManagement /></ProtectedRoute>} />
          <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/ai/story-generator" element={<ProtectedRoute><StoryGenerator /></ProtectedRoute>} />
          <Route path="/ai/sprint-planner" element={<ProtectedRoute><AISprintPlanner /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
export default App;