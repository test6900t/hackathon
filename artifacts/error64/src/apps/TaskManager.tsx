import { useState, useEffect } from 'react';
import { useOS } from '../os/OSContext';
import { FluentIcon } from '../components/Window';

type TMTab = 'processes' | 'performance' | 'startup' | 'users' | 'details' | 'services';

const SYSTEM_PROCS = [
  { name: 'System', pid: 4, user: 'SYSTEM', cpu: 0, mem: 444, status: 'Running', type: 'system' },
  { name: 'smss.exe', pid: 396, user: 'SYSTEM', cpu: 0, mem: 1064, status: 'Running', type: 'system' },
  { name: 'csrss.exe', pid: 596, user: 'SYSTEM', cpu: 0.1, mem: 4832, status: 'Running', type: 'system' },
  { name: 'winlogon.exe', pid: 668, user: 'SYSTEM', cpu: 0, mem: 4096, status: 'Running', type: 'system' },
  { name: 'services.exe', pid: 748, user: 'SYSTEM', cpu: 0, mem: 5120, status: 'Running', type: 'system' },
  { name: 'svchost.exe', pid: 912, user: 'SYSTEM', cpu: 0.2, mem: 18432, status: 'Running', type: 'system' },
  { name: 'svchost.exe', pid: 1024, user: 'SYSTEM', cpu: 0.1, mem: 12288, status: 'Running', type: 'system' },
  { name: 'lsass.exe', pid: 800, user: 'SYSTEM', cpu: 0.1, mem: 8192, status: 'Running', type: 'system' },
  { name: 'dwm.exe', pid: 1140, user: 'DWM-1', cpu: 0.5, mem: 51200, status: 'Running', type: 'system' },
  { name: 'explorer.exe', pid: 2880, user: 'User', cpu: 0.3, mem: 62448, status: 'Running', type: 'app' },
  { name: 'SearchApp.exe', pid: 3012, user: 'User', cpu: 0.1, mem: 38912, status: 'Running', type: 'app' },
  { name: 'RuntimeBroker.exe', pid: 3156, user: 'User', cpu: 0, mem: 16384, status: 'Running', type: 'app' },
  { name: 'sihost.exe', pid: 3200, user: 'User', cpu: 0, mem: 9216, status: 'Running', type: 'app' },
  { name: 'taskhostw.exe', pid: 3240, user: 'User', cpu: 0, mem: 8192, status: 'Running', type: 'app' },
  { name: 'error64.exe', pid: 3344, user: 'User', cpu: 2.1, mem: 128000, status: 'Running', type: 'app' },
];

const STARTUP = [
  { name: 'Error64 Security', publisher: 'Error64 Corp', status: 'Enabled', impact: 'Low' },
  { name: 'OneDrive', publisher: 'Microsoft Corp', status: 'Enabled', impact: 'Medium' },
  { name: 'Discord', publisher: 'Discord Inc', status: 'Enabled', impact: 'High' },
  { name: 'Spotify', publisher: 'Spotify AB', status: 'Disabled', impact: 'High' },
  { name: 'Teams', publisher: 'Microsoft Corp', status: 'Enabled', impact: 'Medium' },
];

const SERVICES = [
  { name: 'AudioSrv', description: 'Windows Audio', status: 'Running', type: 'Automatic' },
  { name: 'BITS', description: 'Background Intelligent Transfer', status: 'Running', type: 'Manual' },
  { name: 'Dnscache', description: 'DNS Client', status: 'Running', type: 'Automatic' },
  { name: 'EventLog', description: 'Windows Event Log', status: 'Running', type: 'Automatic' },
  { name: 'FirewallSvc', description: 'Windows Firewall', status: 'Running', type: 'Automatic' },
  { name: 'WinDefend', description: 'Windows Defender', status: 'Running', type: 'Automatic' },
  { name: 'wuauserv', description: 'Windows Update', status: 'Stopped', type: 'Manual' },
  { name: 'Spooler', description: 'Print Spooler', status: 'Running', type: 'Automatic' },
  { name: 'SSDPSRV', description: 'SSDP Discovery', status: 'Running', type: 'Manual' },
  { name: 'wscsvc', description: 'Security Center', status: 'Running', type: 'Automatic' },
];

export function TaskManager() {
  const { windows, closeWindow } = useOS();
  const [tab, setTab] = useState<TMTab>('processes');
  const [cpuHistory, setCpuHistory] = useState<number[]>(Array(60).fill(0));
  const [memHistory, setMemHistory] = useState<number[]>(Array(60).fill(0));
  const [cpu, setCpu] = useState(0);
  const [mem, setMem] = useState(0);
  const [processes, setProcesses] = useState(SYSTEM_PROCS);
  const [sortKey, setSortKey] = useState<'cpu' | 'mem' | 'name' | 'pid'>('cpu');
  const [sortAsc, setSortAsc] = useState(false);
  const [selectedPid, setSelectedPid] = useState<number | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const newCpu = Math.max(0, Math.min(100, 5 + Math.random() * 15 + (windows.length * 2)));
      const newMem = 35 + windows.length * 3 + Math.random() * 5;
      setCpu(newCpu);
      setMem(newMem);
      setCpuHistory(h => [...h.slice(1), newCpu]);
      setMemHistory(h => [...h.slice(1), newMem]);
      setProcesses(prev => prev.map(p => ({
        ...p,
        cpu: p.name === 'error64.exe' ? Math.random() * 5 : Math.max(0, p.cpu + (Math.random() - 0.5) * 0.2),
      })));
    }, 1000);
    return () => clearInterval(interval);
  }, [windows.length]);

  const appProcs = windows.map((w, i) => ({
    name: `${w.appId}.exe`, pid: 4000 + i, user: 'User',
    cpu: 0.5 + Math.random(), mem: 30000 + Math.random() * 80000,
    status: 'Running', type: 'app',
  }));

  const allProcs = [...appProcs, ...processes].sort((a, b) => {
    const cmp = sortKey === 'name' ? a.name.localeCompare(b.name) : sortKey === 'pid' ? a.pid - b.pid : sortKey === 'cpu' ? a.cpu - b.cpu : a.mem - b.mem;
    return sortAsc ? cmp : -cmp;
  });

  const handleSort = (k: typeof sortKey) => { if (sortKey === k) setSortAsc(a => !a); else { setSortKey(k); setSortAsc(false); } };

  const endTask = () => {
    if (!selectedPid) return;
    const proc = appProcs.find(p => p.pid === selectedPid);
    if (proc) {
      const winIdx = parseInt(proc.pid.toString()) - 4000;
      if (windows[winIdx]) closeWindow(windows[winIdx].id);
    }
    setSelectedPid(null);
  };

  const renderPerf = (label: string, value: number, history: number[], color: string, sub: string[]) => (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{ fontWeight: 600, fontSize: '14px' }}>{label}</span>
        <span style={{ fontSize: '14px', color }}>{value.toFixed(0)}%</span>
      </div>
      <svg width="100%" height="80" style={{ background: '#0a0a1a' }}>
        <polyline
          points={history.map((v, i) => `${(i / 59) * 100}%,${80 - (v / 100) * 76}`).join(' ')}
          fill="none" stroke={color} strokeWidth="2"
        />
        <polygon
          points={`0,80 ${history.map((v, i) => `${(i / 59) * 100}%,${80 - (v / 100) * 76}`).join(' ')} 100%,80`}
          fill={color + '33'}
        />
      </svg>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', marginTop: '8px', fontSize: '12px' }}>
        {sub.map((s, i) => <div key={i} style={{ color: i % 2 === 0 ? '#888' : '#333' }}>{s}</div>)}
      </div>
    </div>
  );

  const TABS: { id: TMTab; label: string }[] = [
    { id: 'processes', label: 'Processes' },
    { id: 'performance', label: 'Performance' },
    { id: 'startup', label: 'Startup' },
    { id: 'users', label: 'Users' },
    { id: 'details', label: 'Details' },
    { id: 'services', label: 'Services' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontFamily: "'Segoe UI', sans-serif", fontSize: '13px' }}>
      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #ddd', background: '#f3f3f3', flexShrink: 0 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ padding: '8px 14px', border: 'none', background: tab === t.id ? '#fff' : 'transparent', borderBottom: tab === t.id ? '2px solid #0078D4' : '2px solid transparent', cursor: 'pointer', fontSize: '13px' }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflow: 'auto' }}>
        {tab === 'processes' && (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ position: 'sticky', top: 0, background: '#f3f3f3', zIndex: 1 }}>
              <tr>
                {[['name','Name'],['cpu','CPU'],['mem','Memory'],['pid','PID']].map(([k, l]) => (
                  <th key={k} onClick={() => handleSort(k as typeof sortKey)}
                    style={{ padding: '8px 12px', textAlign: 'left', cursor: 'pointer', fontWeight: 600, borderBottom: '2px solid #ddd', userSelect: 'none' }}>
                    {l} {sortKey === k ? (sortAsc ? '▲' : '▼') : ''}
                  </th>
                ))}
                <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, borderBottom: '2px solid #ddd' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {allProcs.map((p, i) => (
                <tr key={i} onClick={() => setSelectedPid(p.pid)}
                  style={{ background: selectedPid === p.pid ? '#d0e4ff' : i % 2 === 0 ? '#fff' : '#fafafa', cursor: 'default' }}
                  onMouseEnter={e => { if (selectedPid !== p.pid) e.currentTarget.style.background = '#e8f0fe'; }}
                  onMouseLeave={e => { if (selectedPid !== p.pid) e.currentTarget.style.background = i % 2 === 0 ? '#fff' : '#fafafa'; }}>
                  <td style={{ padding: '5px 12px' }}>{p.name}</td>
                  <td style={{ padding: '5px 12px', color: p.cpu > 20 ? '#D13438' : p.cpu > 5 ? '#CA5010' : '#333' }}>
                    {p.cpu.toFixed(1)}%
                    <div style={{ width: '60px', height: '4px', background: '#e0e0e0', marginTop: '2px' }}>
                      <div style={{ width: `${Math.min(100, p.cpu * 5)}%`, height: '100%', background: p.cpu > 20 ? '#D13438' : '#0078D4' }} />
                    </div>
                  </td>
                  <td style={{ padding: '5px 12px' }}>{(p.mem / 1024).toFixed(1)} MB</td>
                  <td style={{ padding: '5px 12px', color: '#666' }}>{p.pid}</td>
                  <td style={{ padding: '5px 12px' }}><span style={{ color: '#107C10' }}>●</span> {p.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === 'performance' && (
          <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: '200px 1fr', gap: '16px' }}>
            {/* Left */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {[
                { label: 'CPU', value: cpu, color: '#0078D4', active: true },
                { label: 'Memory', value: mem, color: '#107C10', active: false },
                { label: 'Disk', value: 12, color: '#CA5010', active: false },
                { label: 'GPU', value: 8, color: '#8764B8', active: false },
                { label: 'Network', value: 0.1, color: '#038387', active: false },
              ].map(item => (
                <div key={item.label} style={{ padding: '10px 12px', border: '1px solid #ddd', cursor: 'pointer', background: item.active ? '#e8f0fe' : '#fff' }}>
                  <div style={{ fontSize: '12px', color: '#666' }}>{item.label}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                    <div style={{ width: '60px', height: '20px', background: '#0a0a1a', overflow: 'hidden' }}>
                      <div style={{ width: '100%', height: '100%', background: item.color, opacity: 0.4, transform: `scaleX(${item.value/100})`, transformOrigin: 'left' }} />
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>{item.value.toFixed(0)}%</span>
                  </div>
                </div>
              ))}
            </div>
            {/* Right */}
            <div>
              {renderPerf('CPU', cpu, cpuHistory, '#0078D4', [
                'Speed', '2.90 GHz', 'Cores', '6', 'Logical processors', '12', 'Virtualization', 'Enabled',
              ])}
              {renderPerf('Memory', mem, memHistory, '#107C10', [
                'In use', `${(mem * 81.92 / 100).toFixed(0)} MB`, 'Available', `${(8192 - mem * 81.92).toFixed(0)} MB`, 'Total', '8.00 GB', 'Speed', '3200 MHz',
              ])}
            </div>
          </div>
        )}

        {tab === 'startup' && (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ position: 'sticky', top: 0, background: '#f3f3f3' }}>
              <tr>
                {['Name','Publisher','Status','Startup Impact'].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, borderBottom: '2px solid #ddd' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {STARTUP.map(s => (
                <tr key={s.name} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '8px 12px' }}>{s.name}</td>
                  <td style={{ padding: '8px 12px', color: '#666' }}>{s.publisher}</td>
                  <td style={{ padding: '8px 12px' }}>
                    <span style={{ color: s.status === 'Enabled' ? '#107C10' : '#888' }}>● {s.status}</span>
                  </td>
                  <td style={{ padding: '8px 12px' }}>
                    <span style={{ color: s.impact === 'High' ? '#D13438' : s.impact === 'Medium' ? '#CA5010' : '#107C10' }}>{s.impact}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === 'users' && (
          <div style={{ padding: '16px' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '12px', border: '1px solid #ddd' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#0078D4', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '18px' }}>U</div>
              <div>
                <div style={{ fontWeight: 600 }}>User</div>
                <div style={{ fontSize: '12px', color: '#666' }}>Active — Using {((mem * 81.92 * 0.4) / 1024).toFixed(1)} MB</div>
              </div>
              <div style={{ marginLeft: 'auto', fontSize: '12px', color: '#666' }}>Administrator</div>
            </div>
          </div>
        )}

        {tab === 'details' && (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead style={{ position: 'sticky', top: 0, background: '#f3f3f3' }}>
              <tr>
                {['Name','PID','Status','User','CPU','Memory'].map(h => (
                  <th key={h} style={{ padding: '6px 10px', textAlign: 'left', fontWeight: 600, borderBottom: '2px solid #ddd' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allProcs.map((p, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '5px 10px' }}>{p.name}</td>
                  <td style={{ padding: '5px 10px', color: '#666' }}>{p.pid}</td>
                  <td style={{ padding: '5px 10px', color: '#107C10' }}>{p.status}</td>
                  <td style={{ padding: '5px 10px', color: '#666' }}>{p.user}</td>
                  <td style={{ padding: '5px 10px' }}>{p.cpu.toFixed(1)}%</td>
                  <td style={{ padding: '5px 10px' }}>{(p.mem / 1024).toFixed(0)} K</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === 'services' && (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ position: 'sticky', top: 0, background: '#f3f3f3' }}>
              <tr>
                {['Name','Description','Status','Startup Type'].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, borderBottom: '2px solid #ddd' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SERVICES.map(s => (
                <tr key={s.name} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '7px 12px', fontWeight: 500 }}>{s.name}</td>
                  <td style={{ padding: '7px 12px', color: '#555' }}>{s.description}</td>
                  <td style={{ padding: '7px 12px' }}><span style={{ color: s.status === 'Running' ? '#107C10' : '#888' }}>● {s.status}</span></td>
                  <td style={{ padding: '7px 12px', color: '#666' }}>{s.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid #ddd', padding: '6px 12px', display: 'flex', gap: '20px', fontSize: '12px', color: '#555', background: '#f9f9f9', flexShrink: 0 }}>
        <span>Processes: {allProcs.length}</span>
        <span>CPU usage: {cpu.toFixed(0)}%</span>
        <span>Memory: {mem.toFixed(0)}%</span>
        {selectedPid && (
          <button onClick={endTask} style={{ marginLeft: 'auto', padding: '3px 12px', background: '#D13438', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '12px' }}>End Task</button>
        )}
      </div>
    </div>
  );
}
