import { useOS } from '../os/OSContext';
import { useEffect, useState } from 'react';
import { FluentIcon } from './Window';

export function AltTabSwitcher() {
  const { altTabOpen, setAltTabOpen, windows, bringToFront, restoreWindow } = useOS();
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (!altTabOpen) return;
    setSelected(0);
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Tab' && e.altKey) {
        e.preventDefault();
        setSelected(prev => (prev + (e.shiftKey ? -1 : 1) + windows.length) % Math.max(1, windows.length));
      }
      if (!e.altKey) {
        // Alt released — switch to selected
        const win = windows[selected];
        if (win) { bringToFront(win.id); restoreWindow(win.id); }
        setAltTabOpen(false);
      }
      if (e.key === 'Escape') setAltTabOpen(false);
    };
    window.addEventListener('keydown', handler);
    window.addEventListener('keyup', handler);
    return () => { window.removeEventListener('keydown', handler); window.removeEventListener('keyup', handler); };
  }, [altTabOpen, windows, selected, bringToFront, restoreWindow, setAltTabOpen]);

  if (!altTabOpen || windows.length === 0) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 99999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)',
    }}>
      <div style={{
        background: 'rgba(30,30,30,0.95)', border: '1px solid rgba(255,255,255,0.15)',
        padding: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap', maxWidth: '80vw',
        justifyContent: 'center',
      }}>
        {windows.map((win, i) => (
          <div
            key={win.id}
            onClick={() => { bringToFront(win.id); restoreWindow(win.id); setAltTabOpen(false); }}
            style={{
              width: '140px', cursor: 'pointer',
              border: i === selected ? '2px solid #0078D4' : '2px solid transparent',
              background: 'rgba(255,255,255,0.08)', padding: '12px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
            }}
          >
            <FluentIcon name={win.icon} size={48} white />
            <div style={{ fontSize: '11px', color: '#fff', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>
              {win.title}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
