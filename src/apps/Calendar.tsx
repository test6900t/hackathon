import { useState, useEffect } from 'react';
import { FluentIcon } from '../components/Window';

interface Event {
  id: string;
  date: string;
  title: string;
  time: string;
  color: string;
  allDay: boolean;
}

type View = 'month' | 'week' | 'day' | 'agenda';
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const COLORS = ['#0078D4','#107C10','#D13438','#8764B8','#CA5010','#038387'];

export function Calendar() {
  const [view, setView] = useState<View>('month');
  const [current, setCurrent] = useState(new Date());
  const [selected, setSelected] = useState<Date | null>(new Date());
  const [events, setEvents] = useState<Event[]>(() => {
    try { return JSON.parse(localStorage.getItem('error64_calendar') || '[]'); } catch { return []; }
  });
  const [showNewEvent, setShowNewEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', time: '09:00', color: '#0078D4', allDay: false });

  const saveEvents = (e: Event[]) => {
    setEvents(e);
    localStorage.setItem('error64_calendar', JSON.stringify(e));
  };

  const today = new Date();
  const year = current.getFullYear();
  const month = current.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prev = () => {
    if (view === 'month') setCurrent(new Date(year, month - 1, 1));
    else setCurrent(d => new Date(d.getTime() - 86400000 * 7));
  };
  const next = () => {
    if (view === 'month') setCurrent(new Date(year, month + 1, 1));
    else setCurrent(d => new Date(d.getTime() + 86400000 * 7));
  };
  const goToday = () => { setCurrent(new Date()); setSelected(new Date()); };

  const dateStr = (d: Date) => d.toISOString().split('T')[0];
  const selStr = selected ? dateStr(selected) : '';

  const eventsOn = (d: string) => events.filter(e => e.date === d);

  const addEvent = () => {
    if (!newEvent.title.trim() || !selStr) return;
    const ev: Event = {
      id: `ev-${Date.now()}`,
      date: selStr,
      title: newEvent.title,
      time: newEvent.time,
      color: newEvent.color,
      allDay: newEvent.allDay,
    };
    saveEvents([...events, ev]);
    setNewEvent({ title: '', time: '09:00', color: '#0078D4', allDay: false });
    setShowNewEvent(false);
  };

  const deleteEvent = (id: string) => saveEvents(events.filter(e => e.id !== id));

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div style={{ display: 'flex', height: '100%', fontFamily: "'Segoe UI', sans-serif" }}>
      {/* Sidebar */}
      <div style={{ width: '240px', background: '#f3f3f3', borderRight: '1px solid #ddd', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        {/* New event button */}
        <div style={{ padding: '12px' }}>
          <button onClick={() => setShowNewEvent(true)}
            style={{ width: '100%', padding: '10px', background: '#0078D4', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            + New Event
          </button>
        </div>

        {/* Mini calendar */}
        <div style={{ padding: '0 12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <button onClick={prev} style={miniBtn}>‹</button>
            <span style={{ fontSize: '13px', fontWeight: 600 }}>{MONTHS[month]} {year}</span>
            <button onClick={next} style={miniBtn}>›</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', fontSize: '11px' }}>
            {DAYS.map(d => <div key={d} style={{ textAlign: 'center', color: '#888', padding: '2px' }}>{d[0]}</div>)}
            {cells.map((day, i) => {
              if (!day) return <div key={i} />;
              const d = new Date(year, month, day);
              const ds = dateStr(d);
              const isToday = ds === dateStr(today);
              const isSel = ds === selStr;
              const hasEvents = eventsOn(ds).length > 0;
              return (
                <div key={i} onClick={() => setSelected(d)}
                  style={{ textAlign: 'center', padding: '3px', cursor: 'pointer', borderRadius: '50%', fontSize: '12px',
                    background: isSel ? '#0078D4' : isToday ? '#e8f0fe' : 'transparent',
                    color: isSel ? '#fff' : isToday ? '#0078D4' : '#333',
                    fontWeight: isToday ? 700 : 400, position: 'relative' }}>
                  {day}
                  {hasEvents && !isSel && <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '4px', height: '4px', background: '#0078D4', borderRadius: '50%' }} />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming events */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
          <div style={{ fontSize: '11px', color: '#888', fontWeight: 600, marginBottom: '8px' }}>UPCOMING</div>
          {events.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
            .filter(e => e.date >= dateStr(today))
            .slice(0, 10)
            .map(e => (
              <div key={e.id} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'flex-start' }}>
                <div style={{ width: '4px', height: '36px', background: e.color, borderRadius: '2px', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.title}</div>
                  <div style={{ fontSize: '11px', color: '#888' }}>{e.date} {e.allDay ? 'All day' : e.time}</div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Main calendar */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #ddd', gap: '12px', flexShrink: 0 }}>
          <button onClick={goToday} style={{ padding: '6px 16px', border: '1px solid #ddd', background: '#fff', cursor: 'pointer', fontSize: '13px' }}>Today</button>
          <button onClick={prev} style={miniBtn}>‹</button>
          <button onClick={next} style={miniBtn}>›</button>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 300 }}>{MONTHS[month]} {year}</h2>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '2px' }}>
            {(['month','week','day','agenda'] as View[]).map(v => (
              <button key={v} onClick={() => setView(v)}
                style={{ padding: '5px 12px', border: `1px solid ${view === v ? '#0078D4' : '#ddd'}`, background: view === v ? '#0078D4' : '#fff', color: view === v ? '#fff' : '#333', cursor: 'pointer', fontSize: '12px' }}>
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          {/* Day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', background: '#f3f3f3', position: 'sticky', top: 0, zIndex: 5 }}>
            {DAYS.map(d => (
              <div key={d} style={{ padding: '8px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#555', borderRight: '1px solid #ddd' }}>{d}</div>
            ))}
          </div>

          {/* Month grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {cells.map((day, i) => {
              const d = day ? new Date(year, month, day) : null;
              const ds = d ? dateStr(d) : '';
              const isToday = ds === dateStr(today);
              const isSel = ds === selStr;
              const dayEvents = ds ? eventsOn(ds) : [];

              return (
                <div key={i}
                  onClick={() => d && setSelected(d)}
                  style={{ minHeight: '100px', border: '1px solid #eee', padding: '4px', background: isSel ? '#e8f0fe' : '#fff', cursor: 'pointer' }}
                  onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = '#f5f5f5'; }}
                  onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = '#fff'; }}>
                  {day && (
                    <>
                      <div style={{
                        width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: isToday ? '#0078D4' : 'transparent', color: isToday ? '#fff' : '#333',
                        fontWeight: isToday ? 700 : 400, fontSize: '13px', marginBottom: '4px',
                      }}>{day}</div>
                      {dayEvents.slice(0, 3).map(e => (
                        <div key={e.id}
                          onClick={ev => { ev.stopPropagation(); if (confirm(`Delete "${e.title}"?`)) deleteEvent(e.id); }}
                          style={{ background: e.color, color: '#fff', fontSize: '11px', padding: '2px 4px', marginBottom: '2px', borderRadius: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {!e.allDay && <span style={{ opacity: 0.85 }}>{e.time} </span>}{e.title}
                        </div>
                      ))}
                      {dayEvents.length > 3 && <div style={{ fontSize: '10px', color: '#666' }}>+{dayEvents.length - 3} more</div>}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* New Event Modal */}
      {showNewEvent && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}
          onClick={() => setShowNewEvent(false)}>
          <div style={{ background: '#fff', width: '360px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)', padding: '0' }} onClick={e => e.stopPropagation()}>
            <div style={{ background: '#0078D4', color: '#fff', padding: '14px 16px', fontSize: '15px' }}>New Event</div>
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input placeholder="Title" value={newEvent.title} onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                autoFocus style={{ padding: '8px', border: '1px solid #ddd', fontSize: '14px', outline: 'none' }} />
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <label style={{ fontSize: '13px', minWidth: '60px' }}>Date:</label>
                <span style={{ fontSize: '13px' }}>{selStr || 'Select a date'}</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <label style={{ fontSize: '13px', minWidth: '60px' }}>All Day:</label>
                <input type="checkbox" checked={newEvent.allDay} onChange={e => setNewEvent({ ...newEvent, allDay: e.target.checked })} />
              </div>
              {!newEvent.allDay && (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <label style={{ fontSize: '13px', minWidth: '60px' }}>Time:</label>
                  <input type="time" value={newEvent.time} onChange={e => setNewEvent({ ...newEvent, time: e.target.value })}
                    style={{ padding: '4px', border: '1px solid #ddd', fontSize: '13px' }} />
                </div>
              )}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <label style={{ fontSize: '13px', minWidth: '60px' }}>Color:</label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {COLORS.map(c => (
                    <div key={c} onClick={() => setNewEvent({ ...newEvent, color: c })}
                      style={{ width: '24px', height: '24px', borderRadius: '50%', background: c, cursor: 'pointer', border: newEvent.color === c ? '3px solid #333' : '2px solid transparent' }} />
                  ))}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', padding: '0 16px 16px' }}>
              <button onClick={() => setShowNewEvent(false)} style={{ padding: '7px 20px', border: '1px solid #ddd', background: '#fff', cursor: 'pointer', fontSize: '13px' }}>Cancel</button>
              <button onClick={addEvent} style={{ padding: '7px 20px', background: '#0078D4', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '13px' }}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const miniBtn: React.CSSProperties = {
  background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', padding: '4px 8px', lineHeight: 1,
};
