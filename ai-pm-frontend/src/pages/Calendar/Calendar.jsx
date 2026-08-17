// Calendar.jsx
// This is the main Calendar page for the AI PM System.
// I built a full interactive month-grid here instead of just a list — 
// because seeing your whole month at a glance is *way* more useful for sprint planning.
// The grid auto-highlights today's date and lets you click any day to see events.
// All styling is done inline to keep it self-contained (no separate CSS file needed for this page).

import { useState } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';

// ─── sample events data ───────────────────────────────────────────────────────
// In real life this would come from an API/backend tied to sprint data.
// For now it's static mock data that gives the demo a realistic feel.
const EVENTS_DATA = {
  '2026-08-12': [
    { id: 1, title: 'Sprint 5 Kickoff', type: 'sprint', time: '9:00 AM' },
    { id: 2, title: 'Daily Standup', type: 'meeting', time: '10:00 AM' },
  ],
  '2026-08-14': [
    { id: 3, title: 'Backend API Review', type: 'review', time: '2:00 PM' },
    { id: 4, title: 'Daily Standup', type: 'meeting', time: '10:00 AM' },
  ],
  '2026-08-18': [
    { id: 5, title: 'Sprint Mid-Check', type: 'review', time: '11:00 AM' },
  ],
  '2026-08-21': [
    { id: 6, title: 'Daily Standup', type: 'meeting', time: '10:00 AM' },
    { id: 7, title: 'Design Sync', type: 'meeting', time: '3:00 PM' },
  ],
  '2026-08-26': [
    { id: 8, title: 'Sprint 5 Ends', type: 'deadline', time: 'EOD' },
  ],
  '2026-08-28': [
    { id: 9, title: 'Release v1.2 🚀', type: 'release', time: '6:00 PM' },
  ],
  '2026-09-01': [
    { id: 10, title: 'Sprint 6 Kickoff', type: 'sprint', time: '9:00 AM' },
  ],
};

// Each event type gets its own accent color — visual hierarchy is critical here
// so the user can instantly tell apart deadlines vs meetings without reading the text.
const EVENT_TYPE_COLORS = {
  sprint:   { bg: 'rgba(124,58,237,0.35)',  border: '#7c3aed', dot: '#a78bfa' },
  meeting:  { bg: 'rgba(99,102,241,0.25)',  border: '#6366f1', dot: '#818cf8' },
  review:   { bg: 'rgba(20,184,166,0.25)',  border: '#14b8a6', dot: '#2dd4bf' },
  deadline: { bg: 'rgba(239,68,68,0.25)',   border: '#ef4444', dot: '#f87171' },
  release:  { bg: 'rgba(234,179,8,0.25)',   border: '#eab308', dot: '#fbbf24' },
};

// Day-of-week header labels
const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// ─── helper: generate all days for a given month view ────────────────────────
// We include padding days from the prev/next month so the grid always starts
// on Sunday and fills out to a complete 6-row grid (42 cells). This is the
// standard calendar rendering approach — same thing Google Calendar does.
function buildCalendarDays(year, month) {
  const firstDay = new Date(year, month, 1).getDay();   // 0=Sun, 6=Sat
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const days = [];

  // trailing days from previous month (greyed out)
  for (let i = firstDay - 1; i >= 0; i--) {
    days.push({ day: daysInPrevMonth - i, currentMonth: false, overflow: 'prev' });
  }

  // actual days of current month
  for (let d = 1; d <= daysInMonth; d++) {
    days.push({ day: d, currentMonth: true, overflow: null });
  }

  // leading days of next month (greyed out) — fill to complete 42 cells
  const remaining = 42 - days.length;
  for (let d = 1; d <= remaining; d++) {
    days.push({ day: d, currentMonth: false, overflow: 'next' });
  }

  return days;
}

// helper to format a date as YYYY-MM-DD for event lookup
function formatKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

// ─── sub-component: single event pill shown inside a calendar cell ────────────
function EventPill({ event }) {
  const colors = EVENT_TYPE_COLORS[event.type] || EVENT_TYPE_COLORS.meeting;
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      background: colors.bg,
      border: `1px solid ${colors.border}`,
      borderRadius: 4,
      padding: '2px 5px',
      marginTop: 2,
      fontSize: 10,
      color: '#e5e0f0',
      cursor: 'pointer',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      transition: 'filter 0.15s',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: colors.dot, flexShrink: 0 }} />
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{event.title}</span>
    </div>
  );
}

// ─── sub-component: the right-side panel showing selected day's events ────────
// Keeping this as a separate component keeps the main render clean.
// It slides open only when a date with events (or any date) is selected.
function DayEventPanel({ selectedDate, events, onClose }) {
  if (!selectedDate) return null;

  const dateObj = new Date(selectedDate + 'T00:00:00'); // avoid timezone shift
  const label = dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div style={{
      width: 300,
      background: 'linear-gradient(160deg, rgba(26,15,46,0.95), rgba(15,8,23,0.98))',
      border: '1px solid rgba(167,139,250,0.25)',
      borderRadius: 16,
      padding: '24px 20px',
      position: 'sticky',
      top: 24,
      alignSelf: 'flex-start',
      backdropFilter: 'blur(12px)',
      boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
    }}>
      {/* panel header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 11, color: '#a78bfa', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
            Selected Day
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#e5e0f0', marginTop: 4, lineHeight: 1.3 }}>
            {label}
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255,255,255,0.07)',
            border: 'none',
            color: '#a78bfa',
            width: 28,
            height: 28,
            borderRadius: 7,
            fontSize: 16,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
          }}
        >×</button>
      </div>

      {/* event list or empty state */}
      {events.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '32px 0',
          color: '#6b6087',
        }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>📅</div>
          <div style={{ fontSize: 13 }}>No events scheduled</div>
          <div style={{ fontSize: 11, marginTop: 4 }}>Clear day — good for deep work!</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {events.map((ev) => {
            const colors = EVENT_TYPE_COLORS[ev.type] || EVENT_TYPE_COLORS.meeting;
            return (
              <div key={ev.id} style={{
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${colors.border}33`,
                borderLeft: `3px solid ${colors.border}`,
                borderRadius: 10,
                padding: '12px 14px',
                transition: 'background 0.2s',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: colors.dot, flexShrink: 0,
                  }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#e5e0f0' }}>{ev.title}</span>
                </div>
                <div style={{ fontSize: 11, color: '#8b7aaa', paddingLeft: 16 }}>
                  🕐 {ev.time}
                </div>
                <div style={{
                  marginTop: 8, paddingLeft: 16,
                  fontSize: 10, color: colors.dot,
                  textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 600,
                }}>
                  {ev.type}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* quick stats at the bottom */}
      <div style={{
        marginTop: 20,
        paddingTop: 16,
        borderTop: '1px solid rgba(167,139,250,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#c4b5fd' }}>{events.length}</div>
          <div style={{ fontSize: 10, color: '#6b6087' }}>Events</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#c4b5fd' }}>
            {events.filter(e => e.type === 'meeting').length}
          </div>
          <div style={{ fontSize: 10, color: '#6b6087' }}>Meetings</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#c4b5fd' }}>
            {events.filter(e => e.type === 'deadline' || e.type === 'release').length}
          </div>
          <div style={{ fontSize: 10, color: '#6b6087' }}>Deadlines</div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
function Calendar() {
  const today = new Date();

  // useState for which month the user is viewing — default to current month
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear]   = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);

  // build the 42-cell grid for the current view
  const calDays = buildCalendarDays(viewYear, viewMonth);

  const todayKey = formatKey(today.getFullYear(), today.getMonth(), today.getDate());

  // navigation: previous month
  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }

  // navigation: next month
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  // clicking a day cell selects it and shows the panel
  function handleDayClick(year, month, day, isCurrentMonth) {
    if (!isCurrentMonth) return; // don't select overflow days — confusing UX
    const key = formatKey(year, month, day);
    setSelectedDate(prev => prev === key ? null : key); // toggle on second click
  }

  const selectedEvents = selectedDate ? (EVENTS_DATA[selectedDate] || []) : [];

  // count total events in the visible month for the header stat
  const monthEventCount = Object.keys(EVENTS_DATA).filter(k =>
    k.startsWith(`${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`)
  ).reduce((acc, k) => acc + EVENTS_DATA[k].length, 0);

  return (
    <PageWrapper>

      {/* ── page header ── */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* glowing icon badge — gives premium feel immediately */}
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'linear-gradient(135deg, #7c3aed, #9333ea)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22,
            boxShadow: '0 0 20px rgba(124,58,237,0.4)',
          }}>📅</div>
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#e5e0f0' }}>Sprint Calendar</h1>
            <p style={{ margin: 0, fontSize: 13, color: '#8b7aaa', marginTop: 2 }}>
              Track deadlines, meetings & release milestones
            </p>
          </div>
        </div>

        {/* legend — helps users understand event types at a glance */}
        <div style={{ display: 'flex', gap: 16, marginTop: 16, flexWrap: 'wrap' }}>
          {Object.entries(EVENT_TYPE_COLORS).map(([type, colors]) => (
            <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: colors.dot }} />
              <span style={{ fontSize: 12, color: '#8b7aaa', textTransform: 'capitalize' }}>{type}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── main layout: calendar + side panel ── */}
      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>

        {/* ── CALENDAR CARD ── */}
        <div style={{
          flex: 1,
          background: 'linear-gradient(160deg, rgba(26,15,46,0.7), rgba(15,8,23,0.8))',
          border: '1px solid rgba(167,139,250,0.2)',
          borderRadius: 20,
          overflow: 'hidden',
          boxShadow: '0 24px 48px rgba(0,0,0,0.3)',
          backdropFilter: 'blur(10px)',
        }}>

          {/* calendar toolbar: month navigation + month stats */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '20px 24px',
            borderBottom: '1px solid rgba(167,139,250,0.12)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              {/* prev/next month nav buttons */}
              {['←', '→'].map((arrow, i) => (
                <button
                  key={arrow}
                  onClick={i === 0 ? prevMonth : nextMonth}
                  style={{
                    width: 34, height: 34,
                    background: 'rgba(124,58,237,0.15)',
                    border: '1px solid rgba(167,139,250,0.2)',
                    borderRadius: 9, color: '#a78bfa',
                    fontSize: 16, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background 0.2s',
                    padding: 0,
                  }}
                >{arrow}</button>
              ))}
              <div>
                <span style={{ fontSize: 22, fontWeight: 800, color: '#e5e0f0' }}>
                  {MONTH_NAMES[viewMonth]}
                </span>
                <span style={{ fontSize: 18, color: '#8b7aaa', marginLeft: 8 }}>{viewYear}</span>
              </div>
            </div>

            {/* month event count badge */}
            <div style={{
              background: 'rgba(124,58,237,0.2)',
              border: '1px solid rgba(167,139,250,0.25)',
              borderRadius: 24,
              padding: '6px 16px',
              fontSize: 13,
              color: '#c4b5fd',
              fontWeight: 600,
            }}>
              {monthEventCount} event{monthEventCount !== 1 ? 's' : ''} this month
            </div>
          </div>

          {/* day-of-week header row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            padding: '14px 16px 8px',
          }}>
            {WEEK_DAYS.map(d => (
              <div key={d} style={{
                textAlign: 'center',
                fontSize: 11,
                fontWeight: 700,
                color: '#6b6087',
                textTransform: 'uppercase',
                letterSpacing: 0.8,
                paddingBottom: 8,
              }}>{d}</div>
            ))}
          </div>

          {/* ── THE GRID ── 
              Each cell is 1/7 of the row. I used padding-bottom trick to make cells
              proportional, but since we want event pills to overflow naturally,
              I just set a fixed min-height and let content grow. */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: 2,
            padding: '0 16px 16px',
          }}>
            {calDays.map((cell, idx) => {
              const cellKey = cell.currentMonth
                ? formatKey(viewYear, viewMonth, cell.day)
                : null;
              const cellEvents = cellKey ? (EVENTS_DATA[cellKey] || []) : [];
              const isToday = cellKey === todayKey;
              const isSelected = cellKey === selectedDate;
              const hasEvents = cellEvents.length > 0;

              return (
                <div
                  key={idx}
                  onClick={() => cell.currentMonth && handleDayClick(viewYear, viewMonth, cell.day, cell.currentMonth)}
                  style={{
                    minHeight: 82,
                    borderRadius: 10,
                    padding: '8px 7px',
                    cursor: cell.currentMonth ? 'pointer' : 'default',
                    position: 'relative',
                    // selected state gets full violet bg
                    background: isSelected
                      ? 'rgba(124,58,237,0.25)'
                      : isToday
                      ? 'rgba(124,58,237,0.12)'
                      : cell.currentMonth
                      ? 'rgba(255,255,255,0.025)'
                      : 'transparent',
                    border: isSelected
                      ? '1px solid rgba(167,139,250,0.6)'
                      : isToday
                      ? '1px solid rgba(124,58,237,0.4)'
                      : '1px solid transparent',
                    transition: 'background 0.2s, border 0.2s',
                  }}
                >
                  {/* day number — today gets a special circle badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{
                      fontSize: 13,
                      fontWeight: isToday ? 800 : 500,
                      color: isToday
                        ? '#fff'
                        : cell.currentMonth
                        ? '#c9c2dd'
                        : '#3d3358',
                      background: isToday ? 'linear-gradient(135deg,#7c3aed,#9333ea)' : 'transparent',
                      width: isToday ? 26 : 'auto',
                      height: isToday ? 26 : 'auto',
                      borderRadius: isToday ? '50%' : 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      {cell.day}
                    </span>

                    {/* tiny dot indicator when there are events but no room to show them */}
                    {hasEvents && (
                      <span style={{
                        width: 5, height: 5, borderRadius: '50%',
                        background: '#a78bfa', opacity: 0.7,
                      }} />
                    )}
                  </div>

                  {/* show max 2 event pills, "+N more" label if overflow */}
                  {cell.currentMonth && cellEvents.slice(0, 2).map(ev => (
                    <EventPill key={ev.id} event={ev} />
                  ))}
                  {cell.currentMonth && cellEvents.length > 2 && (
                    <div style={{ fontSize: 9, color: '#8b7aaa', marginTop: 3, paddingLeft: 2 }}>
                      +{cellEvents.length - 2} more
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── SIDE PANEL — shows events for the selected day ── */}
        {selectedDate && (
          <DayEventPanel
            selectedDate={selectedDate}
            events={selectedEvents}
            onClose={() => setSelectedDate(null)}
          />
        )}
      </div>

      {/* ── upcoming events strip at the bottom ── */}
      {/* This gives a quick "agenda view" without the user having to click every cell */}
      <div style={{
        marginTop: 24,
        background: 'linear-gradient(160deg, rgba(26,15,46,0.7), rgba(15,8,23,0.8))',
        border: '1px solid rgba(167,139,250,0.15)',
        borderRadius: 16,
        padding: '20px 24px',
        backdropFilter: 'blur(10px)',
      }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 14, color: '#a78bfa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
          Upcoming Events
        </h3>
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4 }}>
          {/* flatten and sort all events by date */}
          {Object.entries(EVENTS_DATA)
            .sort(([a], [b]) => a.localeCompare(b))
            .flatMap(([dateKey, evs]) =>
              evs.map(ev => ({ ...ev, dateKey }))
            )
            .slice(0, 6)
            .map(ev => {
              const colors = EVENT_TYPE_COLORS[ev.type] || EVENT_TYPE_COLORS.meeting;
              const d = new Date(ev.dateKey + 'T00:00:00');
              return (
                <div
                  key={ev.id}
                  onClick={() => setSelectedDate(ev.dateKey)}
                  style={{
                    flexShrink: 0,
                    minWidth: 160,
                    background: colors.bg,
                    border: `1px solid ${colors.border}55`,
                    borderRadius: 12,
                    padding: '12px 14px',
                    cursor: 'pointer',
                    transition: 'transform 0.15s',
                  }}
                >
                  <div style={{ fontSize: 10, color: colors.dot, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                    {d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#e5e0f0', marginTop: 4 }}>{ev.title}</div>
                  <div style={{ fontSize: 11, color: '#8b7aaa', marginTop: 2 }}>{ev.time}</div>
                </div>
              );
            })
          }
        </div>
      </div>

    </PageWrapper>
  );
}

export default Calendar;