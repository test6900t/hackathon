import { useState } from 'react';

type EventLevel = 'Information' | 'Warning' | 'Error' | 'Critical';
type EventLogName = 'System' | 'Application' | 'Security';

interface LogEvent {
  id: number;
  level: EventLevel;
  date: string;
  source: string;
  eventId: number;
  category: EventLogName;
  message: string;
}

const generateEvents = (): LogEvent[] => {
  const sources = ['Error64Kernel', 'EventLog', 'Security-Auditing', 'Disk', 'Dhcp-Client', 'DNS-Client', 'DistributedCOM', 'Application Error'];
  const levels: EventLevel[] = ['Information', 'Information', 'Information', 'Warning', 'Warning', 'Error', 'Critical', 'Information'];

  return Array.from({ length: 150 }, (_, i) => ({
    id: i + 1,
    level: levels[i % levels.length],
    date: new Date(Date.now() - i * 60000 * Math.random() * 30).toLocaleString(),
    source: sources[i % sources.length],
    eventId: Math.floor(Math.random() * 9999) + 1,
    category: i % 3 === 0 ? 'Security' : i % 3 === 1 ? 'System' : 'Application',
    message: [
      'The Error64 system has started successfully.',
      'A user account password changed.',
      'The system time has changed.',
      'A service was installed in the system.',
      'An account was successfully logged on.',
      'Event log service started.',
      'The browser service failed while processing the command.',
    ][i % 7],
  }));
};

const ALL_EVENTS = generateEvents();

const LEVEL_COLOR: Record<EventLevel, string> = {
  Information: '#0078D4',
  Warning: '#FFA500',
  Error: '#D13438',
  Critical: '#8B0000',
};

const LEVEL_ICON: Record<EventLevel, string> = {
  Information: '\u2139',
  Warning: '\u26A0',
  Error: '\u2716',
  Critical: '\u{1F480}',
};

export function EventViewer() {
  const [selected, setSelected] = useState<LogEvent | null>(null);
  const [filterLevel, setFilterLevel] = useState<EventLevel | 'All'>('All');
  const [filterSource, setFilterSource] = useState('');
  const [log, setLog] = useState<EventLogName>('System');

  const logEvents = ALL_EVENTS.filter(event => event.category === log);
  const filtered = logEvents.filter(event => {
    if (filterLevel !== 'All' && event.level !== filterLevel) return false;
    if (filterSource && !event.source.toLowerCase().includes(filterSource.toLowerCase())) return false;
    return true;
  });

  const counts: Record<EventLevel, number> = {
    Information: logEvents.filter(event => event.level === 'Information').length,
    Warning: logEvents.filter(event => event.level === 'Warning').length,
    Error: logEvents.filter(event => event.level === 'Error').length,
    Critical: logEvents.filter(event => event.level === 'Critical').length,
  };

  return (
    <div style={{ display: 'flex', height: '100%', fontFamily: "'Segoe UI', sans-serif", fontSize: '13px' }}>
      <div style={{ width: '200px', background: '#f3f3f3', borderRight: '1px solid #ddd', flexShrink: 0, overflowY: 'auto' }}>
        <div style={{ padding: '8px 12px', fontWeight: 700, fontSize: '12px', color: '#555' }}>EVENT VIEWER (LOCAL)</div>
        <div style={{ paddingLeft: '12px' }}>
          <div style={{ fontWeight: 600, padding: '6px 8px', cursor: 'pointer' }}>{'\u25BE'} Error64 Logs</div>
          {(['Application', 'Security', 'System'] as const).map(logName => (
            <div
              key={logName}
              onClick={() => setLog(logName)}
              style={{
                padding: '6px 20px',
                cursor: 'pointer',
                background: log === logName ? '#d0e4ff' : 'transparent',
                borderLeft: log === logName ? '3px solid #0078D4' : '3px solid transparent',
              }}
              onMouseEnter={event => {
                if (log !== logName) event.currentTarget.style.background = '#e8e8e8';
              }}
              onMouseLeave={event => {
                if (log !== logName) event.currentTarget.style.background = '';
              }}
            >
              {logName}
            </div>
          ))}
          <div style={{ fontWeight: 600, padding: '6px 8px', marginTop: '8px', cursor: 'pointer' }}>{'\u25B8'} Applications and Services Logs</div>
          <div style={{ fontWeight: 600, padding: '6px 8px', cursor: 'pointer' }}>{'\u25B8'} Subscriptions</div>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', background: '#f9f9f9', borderBottom: '1px solid #ddd', display: 'flex', gap: '12px', flexShrink: 0 }}>
          <div style={{ fontWeight: 600, marginRight: '8px' }}>{log}</div>
          {(Object.entries(counts) as [EventLevel, number][]).map(([level, count]) => (
            <div
              key={level}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 10px',
                border: '1px solid #ddd',
                cursor: 'pointer',
                background: filterLevel === level ? '#d0e4ff' : '#fff',
              }}
              onClick={() => setFilterLevel(filterLevel === level ? 'All' : level)}
            >
              <span style={{ color: LEVEL_COLOR[level] }}>{LEVEL_ICON[level]}</span>
              <span>{level}s</span>
              <span style={{ fontWeight: 700, color: LEVEL_COLOR[level] }}>{count}</span>
            </div>
          ))}
          <button
            onClick={() => setFilterLevel('All')}
            style={{
              padding: '4px 12px',
              border: '1px solid #ccc',
              background: filterLevel === 'All' ? '#0078D4' : '#fff',
              color: filterLevel === 'All' ? '#fff' : '#333',
              cursor: 'pointer',
            }}
          >
            All
          </button>
          <div style={{ marginLeft: 'auto' }}>
            <input
              placeholder="Filter by source..."
              value={filterSource}
              onChange={event => setFilterSource(event.target.value)}
              style={{ padding: '4px 8px', border: '1px solid #ccc', fontSize: '12px' }}
            />
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead style={{ position: 'sticky', top: 0, background: '#f3f3f3', zIndex: 1 }}>
                <tr>
                  {['Level', 'Date and Time', 'Source', 'Event ID', 'Category'].map(header => (
                    <th
                      key={header}
                      style={{ padding: '6px 10px', textAlign: 'left', fontWeight: 600, borderBottom: '2px solid #ddd', whiteSpace: 'nowrap' }}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(event => (
                  <tr
                    key={event.id}
                    onClick={() => setSelected(event)}
                    style={{
                      background: selected?.id === event.id ? '#d0e4ff' : 'transparent',
                      cursor: 'pointer',
                      borderBottom: '1px solid #f0f0f0',
                    }}
                    onMouseEnter={mouseEvent => {
                      if (selected?.id !== event.id) mouseEvent.currentTarget.style.background = '#e8f0fe';
                    }}
                    onMouseLeave={mouseEvent => {
                      if (selected?.id !== event.id) mouseEvent.currentTarget.style.background = '';
                    }}
                  >
                    <td style={{ padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ color: LEVEL_COLOR[event.level] }}>{LEVEL_ICON[event.level]}</span>
                      {event.level}
                    </td>
                    <td style={{ padding: '4px 10px', whiteSpace: 'nowrap' }}>{event.date}</td>
                    <td style={{ padding: '4px 10px', whiteSpace: 'nowrap' }}>{event.source}</td>
                    <td style={{ padding: '4px 10px' }}>{event.eventId}</td>
                    <td style={{ padding: '4px 10px', color: '#666' }}>{event.category}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selected && (
            <div style={{ height: '160px', borderTop: '2px solid #ddd', padding: '12px 16px', background: '#fff', overflowY: 'auto', flexShrink: 0 }}>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '8px', fontSize: '12px', color: '#666', flexWrap: 'wrap' }}>
                <span>Level: <strong style={{ color: LEVEL_COLOR[selected.level] }}>{selected.level}</strong></span>
                <span>Date: <strong>{selected.date}</strong></span>
                <span>Source: <strong>{selected.source}</strong></span>
                <span>Event ID: <strong>{selected.eventId}</strong></span>
                <span>Category: <strong>{selected.category}</strong></span>
              </div>
              <div style={{ borderTop: '1px solid #eee', paddingTop: '8px', fontSize: '12px' }}>
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>General</div>
                {selected.message}
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ width: '160px', background: '#f3f3f3', borderLeft: '1px solid #ddd', padding: '12px 8px', flexShrink: 0 }}>
        <div style={{ fontWeight: 700, fontSize: '11px', marginBottom: '8px', color: '#555' }}>ACTIONS</div>
        {['Open Saved Log...', 'Create Custom View...', 'Import Custom View...', 'Clear Log...', 'Filter Current Log...', 'Properties...', 'Find...', 'Save All Events As...', 'Refresh', 'Help'].map(action => (
          <div
            key={action}
            style={{ padding: '5px 8px', cursor: 'pointer', fontSize: '12px', color: '#0078D4', borderBottom: '1px solid #e8e8e8' }}
            onMouseEnter={event => {
              event.currentTarget.style.background = '#e8e8e8';
            }}
            onMouseLeave={event => {
              event.currentTarget.style.background = '';
            }}
          >
            {action}
          </div>
        ))}
      </div>
    </div>
  );
}
