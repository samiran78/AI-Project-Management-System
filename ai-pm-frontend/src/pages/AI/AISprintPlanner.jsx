// AISprintPlanner.jsx
// This is the flagship AI feature of the PM system — so it needs to LOOK the part.
// I designed it as an AI "command center" with three panels:
//   1. Left: Team & backlog context inputs (what the AI "reads")
//   2. Center: The AI recommendation output (the main value)
//   3. Right: Risk assessment sidebar (quick health check)
//
// The pulsing animation on the AI brain icon is intentional — it signals
// "this is live intelligence", not just a form. Micro-animations like that
// dramatically increase perceived product quality.

import { useState } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';

// ─── mock backlog tasks ───────────────────────────────────────────────────────
// In production this would be fetched from /api/projects/:id/backlog
const BACKLOG_ITEMS = [
  { id: 'US-101', title: 'User Authentication Flow',     points: 8,  priority: 'High',   tag: 'Auth'     },
  { id: 'US-102', title: 'AI Story Generator UI',        points: 5,  priority: 'High',   tag: 'AI'       },
  { id: 'US-103', title: 'Kanban Drag & Drop',           points: 8,  priority: 'Medium', tag: 'Kanban'   },
  { id: 'US-104', title: 'Sprint Report Export (PDF)',   points: 5,  priority: 'Medium', tag: 'Reports'  },
  { id: 'US-105', title: 'Email Notification System',    points: 3,  priority: 'Low',    tag: 'Backend'  },
  { id: 'US-106', title: 'Role-Based Access Control',    points: 8,  priority: 'High',   tag: 'Auth'     },
  { id: 'US-107', title: 'Calendar Integration',        points: 5,  priority: 'Medium', tag: 'Calendar' },
  { id: 'US-108', title: 'Real-time Collaboration WS',  points: 13, priority: 'Low',    tag: 'Backend'  },
];

// Team member availability data
const TEAM_MEMBERS = [
  { id: 1, name: 'Samiran R.',  role: 'Full Stack', capacity: 10, avatar: 'SR', available: true  },
  { id: 2, name: 'Priya S.',    role: 'Backend',    capacity: 8,  avatar: 'PS', available: true  },
  { id: 3, name: 'Arjun M.',    role: 'Frontend',   capacity: 6,  avatar: 'AM', available: false }, // partial leave
  { id: 4, name: 'Nisha K.',    role: 'QA',         capacity: 8,  avatar: 'NK', available: true  },
];

// Priority badge colors — high-contrast so priority is always obvious
const PRIORITY_STYLES = {
  High:   { bg: 'rgba(239,68,68,0.18)',  color: '#f87171', border: 'rgba(239,68,68,0.3)'  },
  Medium: { bg: 'rgba(234,179,8,0.15)',  color: '#fbbf24', border: 'rgba(234,179,8,0.3)'  },
  Low:    { bg: 'rgba(74,222,128,0.12)', color: '#4ade80', border: 'rgba(74,222,128,0.25)' },
};

// ─── AI "thinking" simulation ─────────────────────────────────────────────────
// The 1.5s delay + loading state gives the impression of actual computation.
// This matters for UX — instant responses feel like the AI isn't really doing anything.
// In real life, replace this with the actual API call to your AI service.
function simulateAIRecommendation(teamMembers, backlog, sprintLength) {
  const availableMembers = teamMembers.filter(m => m.available);
  const totalCapacity = availableMembers.reduce((sum, m) => sum + m.capacity * sprintLength, 0);

  // simple greedy selection: pick highest priority items that fit capacity
  let remaining = totalCapacity;
  const selected = [];
  const priorityOrder = ['High', 'Medium', 'Low'];

  for (const priority of priorityOrder) {
    for (const item of backlog) {
      if (item.priority === priority && item.points <= remaining) {
        selected.push(item);
        remaining -= item.points;
      }
    }
  }

  const committed = selected.reduce((s, i) => s + i.points, 0);
  const utilization = Math.round((committed / totalCapacity) * 100);

  const riskLevel = availableMembers.length < teamMembers.length
    ? 'Medium' : utilization > 90 ? 'High' : 'Low';

  return { selected, committed, totalCapacity, utilization, riskLevel, availableMembers };
}

// ─── sub-component: individual backlog task row ───────────────────────────────
function BacklogRow({ item, isSelected }) {
  const pStyle = PRIORITY_STYLES[item.priority];
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '10px 12px',
      borderRadius: 10,
      background: isSelected ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.03)',
      border: `1px solid ${isSelected ? 'rgba(167,139,250,0.35)' : 'rgba(167,139,250,0.1)'}`,
      marginBottom: 6,
      transition: 'all 0.25s',
    }}>
      {/* selection indicator */}
      <div style={{
        width: 16, height: 16, borderRadius: 4, flexShrink: 0,
        background: isSelected ? 'linear-gradient(135deg,#7c3aed,#9333ea)' : 'rgba(255,255,255,0.07)',
        border: isSelected ? 'none' : '1px solid rgba(167,139,250,0.25)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 10, color: '#fff',
      }}>
        {isSelected && '✓'}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: isSelected ? '#e5e0f0' : '#9d94b5', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          <span style={{ color: '#6b6087', marginRight: 6 }}>{item.id}</span>
          {item.title}
        </div>
      </div>

      <span style={{
        fontSize: 10, padding: '2px 7px', borderRadius: 20,
        background: pStyle.bg, color: pStyle.color,
        border: `1px solid ${pStyle.border}`, fontWeight: 600,
      }}>{item.priority}</span>

      <span style={{ fontSize: 12, fontWeight: 700, color: '#a78bfa', minWidth: 28, textAlign: 'right' }}>
        {item.points}p
      </span>
    </div>
  );
}

// ─── sub-component: team member card with toggle ──────────────────────────────
function MemberCard({ member, onToggle }) {
  return (
    <div
      onClick={() => onToggle(member.id)}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 12px', borderRadius: 10,
        background: member.available ? 'rgba(124,58,237,0.12)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${member.available ? 'rgba(167,139,250,0.3)' : 'rgba(167,139,250,0.1)'}`,
        cursor: 'pointer', marginBottom: 8,
        transition: 'all 0.2s',
      }}
    >
      {/* avatar circle */}
      <div style={{
        width: 34, height: 34, borderRadius: '50%',
        background: member.available
          ? 'linear-gradient(135deg,#7c3aed,#9333ea)'
          : 'rgba(255,255,255,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0,
        filter: member.available ? 'none' : 'grayscale(1) opacity(0.5)',
      }}>
        {member.avatar}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: member.available ? '#e5e0f0' : '#6b6087' }}>
          {member.name}
        </div>
        <div style={{ fontSize: 11, color: '#6b6087' }}>{member.role} · {member.capacity} pts/wk</div>
      </div>
      {/* availability badge */}
      <span style={{
        fontSize: 10, padding: '2px 8px', borderRadius: 20, fontWeight: 600,
        background: member.available ? 'rgba(74,222,128,0.12)' : 'rgba(239,68,68,0.12)',
        color: member.available ? '#4ade80' : '#f87171',
        border: `1px solid ${member.available ? 'rgba(74,222,128,0.25)' : 'rgba(239,68,68,0.25)'}`,
      }}>
        {member.available ? 'Available' : 'Partial'}
      </span>
    </div>
  );
}

// ─── MAIN AI SPRINT PLANNER COMPONENT ────────────────────────────────────────
function AISprintPlanner() {
  const [sprintLength, setSprintLength] = useState(2); // weeks
  const [teamState, setTeamState] = useState(TEAM_MEMBERS);
  const [isThinking, setIsThinking] = useState(false);
  const [recommendation, setRecommendation] = useState(null);

  // toggle a team member's availability — this directly affects AI suggestions
  function toggleMember(id) {
    setTeamState(prev =>
      prev.map(m => m.id === id ? { ...m, available: !m.available } : m)
    );
    // reset recommendation when inputs change — stale results are misleading
    setRecommendation(null);
  }

  // kick off the AI simulation
  function runPlanner() {
    setIsThinking(true);
    setRecommendation(null);
    setTimeout(() => {
      const result = simulateAIRecommendation(teamState, BACKLOG_ITEMS, sprintLength);
      setRecommendation(result);
      setIsThinking(false);
    }, 1800); // deliberate delay — see comment above simulateAIRecommendation
  }

  const riskColors = { Low: '#4ade80', Medium: '#fbbf24', High: '#f87171' };

  return (
    <PageWrapper>

      {/* ── page header ── */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* pulsing AI icon — the animation signals "active intelligence" */}
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: 'linear-gradient(135deg, #7c3aed, #9333ea)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24,
            boxShadow: '0 0 0 0 rgba(124,58,237,0.6)',
            animation: 'aiPulse 2.2s infinite',
          }}>🤖</div>
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#e5e0f0' }}>
              AI Sprint Planner
            </h1>
            <p style={{ margin: '3px 0 0', fontSize: 13, color: '#8b7aaa' }}>
              Intelligent sprint recommendations based on team capacity & backlog priority
            </p>
          </div>
        </div>
      </div>

      {/* pulse animation keyframes injected inline via style tag */}
      <style>{`
        @keyframes aiPulse {
          0%   { box-shadow: 0 0 0 0 rgba(124,58,237,0.5); }
          70%  { box-shadow: 0 0 0 14px rgba(124,58,237,0); }
          100% { box-shadow: 0 0 0 0 rgba(124,58,237,0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* ── three-column layout ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr', gap: 18, alignItems: 'start' }}>

        {/* ── COLUMN 1: INPUTS ── */}
        <div style={{
          background: 'linear-gradient(160deg, rgba(26,15,46,0.75), rgba(15,8,23,0.85))',
          border: '1px solid rgba(167,139,250,0.18)',
          borderRadius: 18,
          padding: '20px 18px',
          backdropFilter: 'blur(10px)',
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>
            ⚙️ Configuration
          </div>

          {/* sprint length selector */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, color: '#8b7aaa', fontWeight: 600, display: 'block', marginBottom: 8 }}>
              Sprint Length
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              {[1, 2, 3].map(w => (
                <button
                  key={w}
                  onClick={() => { setSprintLength(w); setRecommendation(null); }}
                  style={{
                    flex: 1, padding: '9px 0',
                    background: sprintLength === w
                      ? 'linear-gradient(135deg,#7c3aed,#9333ea)'
                      : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${sprintLength === w ? '#7c3aed' : 'rgba(167,139,250,0.18)'}`,
                    borderRadius: 9,
                    color: sprintLength === w ? '#fff' : '#8b7aaa',
                    fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >{w}W</button>
              ))}
            </div>
          </div>

          {/* team availability */}
          <div>
            <label style={{ fontSize: 12, color: '#8b7aaa', fontWeight: 600, display: 'block', marginBottom: 8 }}>
              Team Availability <span style={{ color: '#6b6087', fontWeight: 400 }}>(click to toggle)</span>
            </label>
            {teamState.map(m => (
              <MemberCard key={m.id} member={m} onToggle={toggleMember} />
            ))}
          </div>

          {/* total capacity preview */}
          <div style={{
            marginTop: 16,
            padding: '12px 14px',
            background: 'rgba(124,58,237,0.12)',
            border: '1px solid rgba(167,139,250,0.2)',
            borderRadius: 10,
          }}>
            <div style={{ fontSize: 11, color: '#8b7aaa', marginBottom: 4 }}>Total Capacity</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#c4b5fd' }}>
              {teamState.filter(m => m.available).reduce((s, m) => s + m.capacity * sprintLength, 0)}{' '}
              <span style={{ fontSize: 13, fontWeight: 400, color: '#8b7aaa' }}>story points</span>
            </div>
          </div>

          {/* the big action button */}
          <button
            onClick={runPlanner}
            disabled={isThinking}
            style={{
              width: '100%', marginTop: 16,
              padding: '13px 0', borderRadius: 12,
              background: isThinking
                ? 'rgba(124,58,237,0.3)'
                : 'linear-gradient(135deg,#7c3aed,#9333ea)',
              border: isThinking ? '1px solid rgba(167,139,250,0.2)' : 'none',
              color: '#fff', fontSize: 14, fontWeight: 700,
              cursor: isThinking ? 'not-allowed' : 'pointer',
              boxShadow: isThinking ? 'none' : '0 6px 20px rgba(124,58,237,0.45)',
              transition: 'all 0.2s',
            }}
          >
            {isThinking ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                Analyzing...
              </span>
            ) : '🤖 Generate Sprint Plan'}
          </button>
        </div>

        {/* ── COLUMN 2: AI RECOMMENDATIONS (main panel) ── */}
        <div style={{
          background: 'linear-gradient(160deg, rgba(26,15,46,0.75), rgba(15,8,23,0.85))',
          border: '1px solid rgba(167,139,250,0.18)',
          borderRadius: 18,
          padding: '20px 18px',
          backdropFilter: 'blur(10px)',
          minHeight: 400,
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>
            🧠 AI Recommendation
          </div>

          {/* idle state */}
          {!isThinking && !recommendation && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#4d4368' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🤖</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#6b6087', marginBottom: 8 }}>
                Ready to plan your sprint
              </div>
              <div style={{ fontSize: 12, color: '#4d4368', maxWidth: 220, margin: '0 auto', lineHeight: 1.6 }}>
                Set your team availability and sprint length, then hit Generate.
              </div>
            </div>
          )}

          {/* thinking state */}
          {isThinking && (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div style={{ fontSize: 40, marginBottom: 16, animation: 'aiPulse 1s infinite' }}>🧠</div>
              <div style={{ fontSize: 14, color: '#a78bfa', fontWeight: 600, marginBottom: 8 }}>
                AI is analyzing your backlog...
              </div>
              {/* animated progress bar */}
              <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden', margin: '16px auto', maxWidth: 200 }}>
                <div style={{
                  height: '100%', width: '60%',
                  background: 'linear-gradient(90deg, #7c3aed, #a78bfa)',
                  borderRadius: 99,
                  animation: 'spin 1.5s linear infinite',  // reusing spin for progress shimmer
                }} />
              </div>
              <div style={{ fontSize: 12, color: '#6b6087' }}>Optimizing for capacity & priority...</div>
            </div>
          )}

          {/* results state */}
          {!isThinking && recommendation && (
            <div style={{ animation: 'fadeSlideUp 0.4s ease' }}>

              {/* utilization meter */}
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: 16, padding: '14px 16px',
                background: 'rgba(124,58,237,0.1)',
                border: '1px solid rgba(167,139,250,0.2)',
                borderRadius: 12,
              }}>
                <div>
                  <div style={{ fontSize: 11, color: '#8b7aaa' }}>Committed / Capacity</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#e5e0f0', marginTop: 2 }}>
                    {recommendation.committed} <span style={{ color: '#6b6087', fontSize: 14 }}>/ {recommendation.totalCapacity} pts</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11, color: '#8b7aaa' }}>Utilization</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#c4b5fd', marginTop: 2 }}>
                    {recommendation.utilization}%
                  </div>
                </div>
              </div>

              {/* utilization bar */}
              <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden', marginBottom: 20 }}>
                <div style={{
                  height: '100%',
                  width: `${Math.min(recommendation.utilization, 100)}%`,
                  background: recommendation.utilization > 90
                    ? 'linear-gradient(90deg,#ef4444,#f87171)'
                    : 'linear-gradient(90deg,#7c3aed,#a78bfa)',
                  borderRadius: 99,
                  transition: 'width 0.8s ease',
                }} />
              </div>

              {/* suggested tasks */}
              <div style={{ fontSize: 12, color: '#8b7aaa', fontWeight: 600, marginBottom: 10 }}>
                SUGGESTED TASKS ({recommendation.selected.length})
              </div>
              <div style={{ maxHeight: 320, overflowY: 'auto', paddingRight: 4 }}>
                {BACKLOG_ITEMS.map(item => (
                  <BacklogRow
                    key={item.id}
                    item={item}
                    isSelected={recommendation.selected.some(s => s.id === item.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── COLUMN 3: RISK SIDEBAR ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* risk level card */}
          <div style={{
            background: 'linear-gradient(160deg, rgba(26,15,46,0.75), rgba(15,8,23,0.85))',
            border: '1px solid rgba(167,139,250,0.18)',
            borderRadius: 18, padding: '20px 18px',
            backdropFilter: 'blur(10px)',
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>
              ⚠️ Risk Assessment
            </div>

            {recommendation ? (
              <>
                <div style={{
                  textAlign: 'center', padding: '20px 0',
                  border: `1px solid ${riskColors[recommendation.riskLevel]}33`,
                  borderRadius: 12, marginBottom: 14,
                  background: `${riskColors[recommendation.riskLevel]}0d`,
                }}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>
                    {recommendation.riskLevel === 'Low' ? '🟢' : recommendation.riskLevel === 'Medium' ? '🟡' : '🔴'}
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: riskColors[recommendation.riskLevel] }}>
                    {recommendation.riskLevel} Risk
                  </div>
                </div>

                {/* risk factors */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {teamState.some(m => !m.available) && (
                    <div style={{ padding: '10px 12px', background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.25)', borderRadius: 10 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#fbbf24' }}>⚠ Team Availability</div>
                      <div style={{ fontSize: 11, color: '#8b7aaa', marginTop: 3 }}>
                        {teamState.filter(m => !m.available).map(m => m.name).join(', ')} on partial capacity
                      </div>
                    </div>
                  )}
                  {recommendation.utilization > 85 && (
                    <div style={{ padding: '10px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#f87171' }}>⚠ Overcommitment</div>
                      <div style={{ fontSize: 11, color: '#8b7aaa', marginTop: 3 }}>
                        Consider leaving 15% buffer for unplanned work
                      </div>
                    </div>
                  )}
                  {recommendation.utilization <= 85 && !teamState.some(m => !m.available) && (
                    <div style={{ padding: '10px 12px', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.25)', borderRadius: 10 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#4ade80' }}>✓ Healthy Capacity</div>
                      <div style={{ fontSize: 11, color: '#8b7aaa', marginTop: 3 }}>
                        Team has buffer for unplanned issues
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '30px 0', color: '#4d4368' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
                <div style={{ fontSize: 12 }}>Risk analysis will appear after generation</div>
              </div>
            )}
          </div>

          {/* AI tips card — always visible */}
          <div style={{
            background: 'linear-gradient(160deg, rgba(26,15,46,0.75), rgba(15,8,23,0.85))',
            border: '1px solid rgba(167,139,250,0.18)',
            borderRadius: 18, padding: '18px',
            backdropFilter: 'blur(10px)',
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
              💡 AI Tips
            </div>
            {[
              'Keep sprint commitment under 85% capacity to absorb surprises.',
              'Prioritize High-value items early — blockers kill velocity.',
              'One sprint goal keeps the team focused. Avoid fragmented work.',
            ].map((tip, i) => (
              <div key={i} style={{
                display: 'flex', gap: 8, marginBottom: 10,
                fontSize: 12, color: '#9d94b5', lineHeight: 1.5,
              }}>
                <span style={{ color: '#7c3aed', flexShrink: 0, marginTop: 1 }}>›</span>
                {tip}
              </div>
            ))}
          </div>
        </div>

      </div>
    </PageWrapper>
  );
}

export default AISprintPlanner;