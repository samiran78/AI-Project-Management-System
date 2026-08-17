// Reports.jsx
// I wanted this to feel like a real BI dashboard — not just a page with a title.
// So I built SVG-based charts from scratch (no library needed), which keeps
// bundle size zero and gives full control over colors & animations.
// The three charts here cover the standard sprint reporting needs:
// burndown, velocity trend, and team workload distribution.

import { useState } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';

// ─── mock data ────────────────────────────────────────────────────────────────
// Real version: fetch from /api/reports?projectId=X
// For demo, I'm hardcoding data that looks realistic for a 2-week sprint.

const BURNDOWN_DATA = [
  { day: 'Aug 12', ideal: 35, actual: 35 },
  { day: 'Aug 13', ideal: 30, actual: 34 },
  { day: 'Aug 14', ideal: 25, actual: 31 },
  { day: 'Aug 15', ideal: 20, actual: 28 },
  { day: 'Aug 18', ideal: 15, actual: 22 },
  { day: 'Aug 19', ideal: 10, actual: 17 },
  { day: 'Aug 20', ideal: 5,  actual: 12 },
  { day: 'Aug 21', ideal: 0,  actual: 8  },
];

const VELOCITY_DATA = [
  { sprint: 'S1', points: 28 },
  { sprint: 'S2', points: 34 },
  { sprint: 'S3', points: 31 },
  { sprint: 'S4', points: 40 },
  { sprint: 'S5', points: 35 },
];

// Team workload — percentage of capacity used per member
const TEAM_LOAD = [
  { name: 'Samiran R.',  load: 92, role: 'Lead Dev'    },
  { name: 'Priya S.',   load: 78, role: 'Backend'      },
  { name: 'Arjun M.',   load: 65, role: 'Frontend'     },
  { name: 'Nisha K.',   load: 55, role: 'QA'           },
  { name: 'Dev T.',     load: 40, role: 'DevOps'       },
];

// KPI summary cards at the top — the stuff executives look at first
const KPI_CARDS = [
  { label: 'Sprint Velocity',    value: '35 pts',  delta: '+12%', up: true,  icon: '⚡' },
  { label: 'Tasks Completed',   value: '28 / 35', delta: '80%',  up: true,  icon: '✅' },
  { label: 'Bugs Found',        value: '6',       delta: '-3',   up: false, icon: '🐛' },
  { label: 'Avg Cycle Time',    value: '1.8 days', delta: '-0.4d', up: false, icon: '🔄' },
];

// ─── helper: normalize values to SVG coordinate space ───────────────────────
// All SVG charts use a 400×160 viewBox. This function maps a data value
// to a Y coordinate (SVG Y is top-down, so we invert it).
function toY(val, max, height = 140, topPad = 10) {
  return topPad + (height - (val / max) * height);
}

function toX(idx, total, width = 380, leftPad = 10) {
  if (total === 1) return leftPad + width / 2;
  return leftPad + (idx / (total - 1)) * width;
}

// Build an SVG polyline points string from data array
function makePolyline(data, key, max) {
  return data.map((d, i) => `${toX(i, data.length)},${toY(d[key], max)}`).join(' ');
}

// ─── Burndown Chart Component ────────────────────────────────────────────────
// A burndown shows remaining work over time. The "ideal" line is a straight
// diagonal — any gap between ideal and actual tells you if the team is ahead
// or behind. This is the most-used chart in Scrum.
function BurndownChart() {
  const max = 40;
  const actualLine = makePolyline(BURNDOWN_DATA, 'actual', max);
  const idealLine  = makePolyline(BURNDOWN_DATA, 'ideal',  max);

  // build filled area under actual line for visual weight
  const firstX = toX(0, BURNDOWN_DATA.length);
  const lastX  = toX(BURNDOWN_DATA.length - 1, BURNDOWN_DATA.length);
  const areaPath = `M ${firstX},${toY(BURNDOWN_DATA[0].actual, max)} ${BURNDOWN_DATA.map((d, i) => `L ${toX(i, BURNDOWN_DATA.length)},${toY(d.actual, max)}`).join(' ')} L ${lastX},150 L ${firstX},150 Z`;

  return (
    <div style={chartCardStyle}>
      <ChartHeader
        title="Sprint Burndown"
        subtitle="Remaining story points · Sprint 5"
        icon="📉"
      />
      <svg viewBox="0 0 400 160" style={{ width: '100%', overflow: 'visible' }}>
        <defs>
          <linearGradient id="burnGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* grid lines — subtle horizontal guides */}
        {[0, 10, 20, 30, 40].map(v => (
          <g key={v}>
            <line
              x1="10" y1={toY(v, max)} x2="390" y2={toY(v, max)}
              stroke="rgba(167,139,250,0.08)" strokeWidth="1"
            />
            <text x="6" y={toY(v, max) + 4} fontSize="9" fill="#6b6087" textAnchor="end">{v}</text>
          </g>
        ))}

        {/* filled area under actual */}
        <path d={areaPath} fill="url(#burnGrad)" />

        {/* ideal line — dashed */}
        <polyline
          points={idealLine}
          fill="none"
          stroke="#4b5563"
          strokeWidth="1.5"
          strokeDasharray="5,4"
        />

        {/* actual line */}
        <polyline
          points={actualLine}
          fill="none"
          stroke="#a78bfa"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* data point dots on actual line */}
        {BURNDOWN_DATA.map((d, i) => (
          <circle
            key={i}
            cx={toX(i, BURNDOWN_DATA.length)}
            cy={toY(d.actual, max)}
            r="3.5"
            fill="#7c3aed"
            stroke="#c4b5fd"
            strokeWidth="1.5"
          />
        ))}

        {/* X-axis labels */}
        {BURNDOWN_DATA.map((d, i) => (
          <text
            key={i}
            x={toX(i, BURNDOWN_DATA.length)}
            y="158"
            fontSize="8"
            fill="#6b6087"
            textAnchor="middle"
          >{d.day.replace('Aug ', '')}</text>
        ))}
      </svg>

      {/* legend */}
      <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
        <LegendDot color="#a78bfa" label="Actual" />
        <LegendDot color="#4b5563" label="Ideal" dashed />
      </div>
    </div>
  );
}

// ─── Velocity Chart Component ────────────────────────────────────────────────
// Bar chart showing story points completed per sprint.
// Velocity is the single most important planning metric in Scrum —
// it tells you how much work the team can realistically commit to next sprint.
function VelocityChart() {
  const max = 45;
  const barWidth = 48;
  const gap = 22;
  const startX = 30;

  return (
    <div style={chartCardStyle}>
      <ChartHeader
        title="Sprint Velocity"
        subtitle="Story points completed per sprint"
        icon="⚡"
      />
      <svg viewBox="0 0 400 160" style={{ width: '100%', overflow: 'visible' }}>
        {/* horizontal grid */}
        {[0, 15, 30, 45].map(v => (
          <g key={v}>
            <line
              x1="28" y1={toY(v, max)} x2="390" y2={toY(v, max)}
              stroke="rgba(167,139,250,0.08)" strokeWidth="1"
            />
            <text x="24" y={toY(v, max) + 4} fontSize="9" fill="#6b6087" textAnchor="end">{v}</text>
          </g>
        ))}

        {VELOCITY_DATA.map((d, i) => {
          const x = startX + i * (barWidth + gap);
          const barH = (d.points / max) * 130;
          const y = 140 - barH;
          // highlight the latest sprint bar slightly
          const isLatest = i === VELOCITY_DATA.length - 1;

          return (
            <g key={i}>
              {/* bar background track */}
              <rect x={x} y={10} width={barWidth} height={130} rx="6"
                fill="rgba(255,255,255,0.03)" />
              {/* actual bar */}
              <rect x={x} y={y} width={barWidth} height={barH} rx="6"
                fill={isLatest
                  ? 'url(#velGrad)'
                  : 'rgba(124,58,237,0.4)'}
                stroke={isLatest ? '#a78bfa' : 'rgba(167,139,250,0.2)'}
                strokeWidth="1"
              />
              {/* value label on top of bar */}
              <text x={x + barWidth / 2} y={y - 5}
                fontSize="11" fontWeight="700"
                fill={isLatest ? '#c4b5fd' : '#8b7aaa'}
                textAnchor="middle">{d.points}</text>
              {/* sprint label below */}
              <text x={x + barWidth / 2} y={158}
                fontSize="10" fill="#6b6087" textAnchor="middle">{d.sprint}</text>
            </g>
          );
        })}

        <defs>
          <linearGradient id="velGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#9333ea" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
        </defs>
      </svg>

      <div style={{ fontSize: 12, color: '#8b7aaa', marginTop: 8 }}>
        Avg: <span style={{ color: '#c4b5fd', fontWeight: 600 }}>33.6 pts</span> &nbsp;·&nbsp;
        Trend: <span style={{ color: '#4ade80', fontWeight: 600 }}>↑ improving</span>
      </div>
    </div>
  );
}

// ─── Team Workload Component ─────────────────────────────────────────────────
// Horizontal progress bars per team member.
// Using color coding: green = healthy, yellow = high, red = over-capacity.
// This helps the PM spot burnout risk immediately.
function TeamWorkload() {
  return (
    <div style={chartCardStyle}>
      <ChartHeader
        title="Team Workload"
        subtitle="Capacity utilization · Current sprint"
        icon="👥"
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 8 }}>
        {TEAM_LOAD.map((member) => {
          // color logic — this mirrors real-world traffic light convention
          const barColor = member.load >= 90
            ? '#ef4444'    // red: at risk of burnout
            : member.load >= 75
            ? '#f59e0b'    // amber: watch this
            : '#22c55e';   // green: healthy

          return (
            <div key={member.name}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#e5e0f0' }}>{member.name}</span>
                  <span style={{
                    marginLeft: 8, fontSize: 10, color: '#8b7aaa',
                    background: 'rgba(255,255,255,0.06)',
                    padding: '2px 7px', borderRadius: 20,
                  }}>{member.role}</span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: barColor }}>
                  {member.load}%
                </span>
              </div>
              {/* track */}
              <div style={{
                height: 8, background: 'rgba(255,255,255,0.06)',
                borderRadius: 99, overflow: 'hidden',
              }}>
                {/* fill — CSS width transition gives a nice load-in animation */}
                <div style={{
                  height: '100%',
                  width: `${member.load}%`,
                  background: `linear-gradient(90deg, ${barColor}99, ${barColor})`,
                  borderRadius: 99,
                  transition: 'width 0.6s ease',
                  boxShadow: `0 0 8px ${barColor}66`,
                }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── reusable small components ────────────────────────────────────────────────

// Shared card style — defined as a JS object so it's easy to override
const chartCardStyle = {
  background: 'linear-gradient(160deg, rgba(26,15,46,0.7), rgba(15,8,23,0.8))',
  border: '1px solid rgba(167,139,250,0.18)',
  borderRadius: 18,
  padding: '22px 22px 18px',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 16px 40px rgba(0,0,0,0.25)',
};

function ChartHeader({ title, subtitle, icon }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{
          width: 34, height: 34,
          background: 'rgba(124,58,237,0.2)',
          border: '1px solid rgba(167,139,250,0.25)',
          borderRadius: 9,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 17,
        }}>{icon}</span>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#e5e0f0' }}>{title}</div>
          <div style={{ fontSize: 11, color: '#8b7aaa', marginTop: 1 }}>{subtitle}</div>
        </div>
      </div>
    </div>
  );
}

function LegendDot({ color, label, dashed }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{
        width: 22, height: 2,
        background: dashed ? 'transparent' : color,
        borderTop: dashed ? `2px dashed ${color}` : 'none',
      }} />
      <span style={{ fontSize: 11, color: '#8b7aaa' }}>{label}</span>
    </div>
  );
}

// ─── Tab switcher for report types ───────────────────────────────────────────
const TABS = ['Overview', 'Burndown', 'Velocity', 'Team'];

// ─── MAIN REPORTS COMPONENT ───────────────────────────────────────────────────
function Reports() {
  const [activeTab, setActiveTab] = useState('Overview');

  return (
    <PageWrapper>

      {/* page header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'linear-gradient(135deg, #7c3aed, #9333ea)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, boxShadow: '0 0 20px rgba(124,58,237,0.4)',
          }}>📊</div>
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#e5e0f0' }}>Reports & Analytics</h1>
            <p style={{ margin: '3px 0 0', fontSize: 13, color: '#8b7aaa' }}>
              Sprint 5 · Aug 12 – Aug 26, 2026
            </p>
          </div>
        </div>

        {/* export button — placeholder, wires to API later */}
        <button style={{
          position: 'absolute', right: 30, top: 30,
          background: 'rgba(124,58,237,0.15)',
          border: '1px solid rgba(167,139,250,0.3)',
          borderRadius: 10, color: '#c4b5fd',
          padding: '9px 18px', fontSize: 13, fontWeight: 600,
          cursor: 'pointer',
        }}>
          ↓ Export PDF
        </button>
      </div>

      {/* KPI cards row — first thing any stakeholder looks at */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 14,
        marginBottom: 24,
      }}>
        {KPI_CARDS.map((kpi) => (
          <div key={kpi.label} style={{
            background: 'linear-gradient(160deg, rgba(26,15,46,0.75), rgba(15,8,23,0.85))',
            border: '1px solid rgba(167,139,250,0.18)',
            borderRadius: 16,
            padding: '18px 20px',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            transition: 'transform 0.2s',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ fontSize: 11, color: '#8b7aaa', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                {kpi.label}
              </div>
              <span style={{ fontSize: 18 }}>{kpi.icon}</span>
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#e5e0f0', margin: '8px 0 6px' }}>
              {kpi.value}
            </div>
            <div style={{
              fontSize: 12, fontWeight: 600,
              color: kpi.up ? '#4ade80' : '#f87171',
            }}>
              {kpi.up ? '▲' : '▼'} {kpi.delta} vs last sprint
            </div>
          </div>
        ))}
      </div>

      {/* tab navigation */}
      <div style={{
        display: 'flex', gap: 4, marginBottom: 22,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(167,139,250,0.12)',
        borderRadius: 12, padding: 4,
        width: 'fit-content',
      }}>
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              background: activeTab === tab
                ? 'linear-gradient(135deg, #7c3aed, #9333ea)'
                : 'transparent',
              border: 'none',
              borderRadius: 9,
              color: activeTab === tab ? '#fff' : '#8b7aaa',
              padding: '7px 18px',
              fontSize: 13, fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: activeTab === tab ? '0 4px 12px rgba(124,58,237,0.4)' : 'none',
            }}
          >{tab}</button>
        ))}
      </div>

      {/* chart area — conditionally render based on active tab */}
      {activeTab === 'Overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* top row: burndown + velocity side by side */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <BurndownChart />
            <VelocityChart />
          </div>
          {/* full-width team workload */}
          <TeamWorkload />
        </div>
      )}

      {activeTab === 'Burndown' && (
        <div style={{ maxWidth: 700 }}>
          <BurndownChart />
          {/* extra detail text only shown in focused view */}
          <div style={{ ...chartCardStyle, marginTop: 16 }}>
            <p style={{ color: '#d6d0e6', margin: 0, fontSize: 13, lineHeight: 1.7 }}>
              <strong style={{ color: '#c4b5fd' }}>Analysis:</strong> The team is currently{' '}
              <strong style={{ color: '#f87171' }}>8 points behind</strong> the ideal burndown line.
              At the current rate, Sprint 5 will end with ~8 points carried over.
              Recommend de-scoping Task #47 or adding a pair-programming session to close the gap.
            </p>
          </div>
        </div>
      )}

      {activeTab === 'Velocity' && (
        <div style={{ maxWidth: 700 }}>
          <VelocityChart />
        </div>
      )}

      {activeTab === 'Team' && (
        <div style={{ maxWidth: 600 }}>
          <TeamWorkload />
        </div>
      )}

    </PageWrapper>
  );
}

export default Reports;