import { useState, useEffect } from 'react';
import { FluentIcon } from './Window';

export function XboxGameBar() {
  const [open, setOpen] = useState(false);
  const [fps] = useState(() => Math.floor(Math.random() * 20) + 55);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.metaKey && event.key === 'g') {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  if (!open) return null;

  return (
    <div style={{ position: 'fixed', top: '60px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(20,20,20,0.95)', border: '1px solid rgba(255,255,255,0.15)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', zIndex: 99998, display: 'flex', gap: '0', backdropFilter: 'blur(20px)', color: '#fff' }}>
      {[
        { label: 'Capture', icon: 'camera', action: () => {} },
        { label: 'Audio', icon: 'speaker_2', action: () => {} },
        { label: 'Performance', icon: 'chart', action: () => {} },
        { label: 'Xbox Social', icon: 'social', action: () => {} },
      ].map((panel) => (
        <button
          key={panel.label}
          onClick={panel.action}
          style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '12px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', fontSize: '11px', borderRight: '1px solid rgba(255,255,255,0.1)' }}
          onMouseEnter={(event) => {
            event.currentTarget.style.background = 'rgba(255,255,255,0.1)';
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.background = 'none';
          }}
        >
          <FluentIcon name={panel.icon} size={20} white />
          {panel.label}
        </button>
      ))}
      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', borderLeft: '1px solid rgba(255,255,255,0.1)', fontSize: '11px' }}>
        <span style={{ color: '#107c10', fontSize: '18px', fontWeight: 700 }}>{fps}</span>
        <span>FPS</span>
      </div>
      <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <FluentIcon name="close" size={16} white />
      </button>
    </div>
  );
}
