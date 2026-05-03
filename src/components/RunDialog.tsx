import { useOS } from '../os/OSContext';
import { useState, useEffect, useRef } from 'react';

const COMMANDS: Record<string, { appId: string; title: string; icon: string }> = {
  notepad: { appId: 'notepad', title: 'Notepad', icon: 'notepad' },
  calc: { appId: 'calculator', title: 'Calculator', icon: 'calculator' },
  cmd: { appId: 'cmd', title: 'Command Prompt', icon: 'prompt' },
  explorer: { appId: 'explorer', title: 'File Explorer', icon: 'folder' },
  paint: { appId: 'paint', title: 'Paint', icon: 'paint_bucket' },
  mspaint: { appId: 'paint', title: 'Paint', icon: 'paint_bucket' },
  taskmgr: { appId: 'taskmanager', title: 'Task Manager', icon: 'task_list_square_ltr' },
  control: { appId: 'controlpanel', title: 'Control Panel', icon: 'apps_list' },
  'ms-settings': { appId: 'settings', title: 'Settings', icon: 'settings' },
  snippingtool: { appId: 'snipping', title: 'Snipping Tool', icon: 'screenshot' },
  mstsc: { appId: 'remote-desktop', title: 'Remote Desktop', icon: 'remote_desktop' },
  winver: { appId: 'about', title: 'About Error64', icon: 'info' },
  charmap: { appId: 'charmap', title: 'Character Map', icon: 'text_font' },
  wordpad: { appId: 'wordpad', title: 'WordPad', icon: 'document' },
  osk: { appId: 'osk', title: 'On-Screen Keyboard', icon: 'keyboard' },
};

export function RunDialog() {
  const { runDialogOpen, setRunDialogOpen, openWindow } = useOS();
  const [value, setValue] = useState('');
  const [history, setHistory] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('error64_run_history') || '[]'); } catch { return []; }
  });
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (runDialogOpen) { setValue(''); setTimeout(() => inputRef.current?.focus(), 100); }
  }, [runDialogOpen]);

  if (!runDialogOpen) return null;

  const handleRun = () => {
    const cmd = value.trim().toLowerCase();
    const app = COMMANDS[cmd];
    if (app) {
      openWindow(app.appId, app.title, app.icon);
    } else if (cmd.startsWith('http')) {
      openWindow('browser', 'Error64 Browser', 'globe', { url: cmd });
    } else if (cmd) {
      openWindow('cmd', 'Command Prompt', 'prompt');
    }
    const newHistory = [value, ...history.filter(h => h !== value)].slice(0, 20);
    setHistory(newHistory);
    localStorage.setItem('error64_run_history', JSON.stringify(newHistory));
    setRunDialogOpen(false);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 99999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.3)',
    }} onClick={() => setRunDialogOpen(false)}>
      <div
        style={{
          background: '#f3f3f3', border: '1px solid #aaa',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          width: '400px', padding: '0',
          animation: 'windowOpen 150ms ease',
          fontFamily: "'Segoe UI', sans-serif",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Title bar */}
        <div style={{ background: '#0078D4', color: '#fff', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg viewBox="0 0 21 21" width="16" height="16">
            <path d="M0 0h10v10H0z" fill="#f35325"/>
            <path d="M11 0h10v10H11z" fill="#81bc06"/>
            <path d="M0 11h10v10H0z" fill="#05a6f0"/>
            <path d="M11 11h10v10H11z" fill="#ffba08"/>
          </svg>
          <span style={{ fontSize: '13px' }}>Run</span>
        </div>
        <div style={{ padding: '20px' }}>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '40px', height: '40px', flexShrink: 0 }}>
              <svg viewBox="0 0 24 24" fill="#0078D4" width="40" height="40"><path d="M1 12L12 3l11 9h-3v9h-5v-6H9v6H4v-9H1z"/></svg>
            </div>
            <div>
              <div style={{ fontSize: '13px', marginBottom: '12px', color: '#333' }}>
                Type the name of a program, folder, document, or Internet resource, and Error64 will open it for you.
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <label style={{ fontSize: '13px', color: '#333', whiteSpace: 'nowrap' }}>Open:</label>
                <input
                  ref={inputRef}
                  list="run-history"
                  value={value}
                  onChange={e => setValue(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleRun(); if (e.key === 'Escape') setRunDialogOpen(false); }}
                  style={{ flex: 1, border: '1px solid #aaa', padding: '3px 6px', fontSize: '13px', outline: 'none' }}
                />
                <datalist id="run-history">
                  {history.map(h => <option key={h} value={h} />)}
                </datalist>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            {[
              { label: 'OK', onClick: handleRun, primary: true },
              { label: 'Cancel', onClick: () => setRunDialogOpen(false), primary: false },
              { label: 'Browse...', onClick: () => { openWindow('explorer', 'File Explorer', 'folder'); setRunDialogOpen(false); }, primary: false },
            ].map(btn => (
              <button
                key={btn.label}
                onClick={btn.onClick}
                style={{
                  padding: '5px 20px', fontSize: '13px', cursor: 'pointer',
                  background: btn.primary ? '#0078D4' : '#f3f3f3',
                  color: btn.primary ? '#fff' : '#333',
                  border: '1px solid', borderColor: btn.primary ? '#0078D4' : '#aaa',
                }}
              >{btn.label}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
