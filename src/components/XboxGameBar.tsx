import { useState, useEffect } from 'react';

export function XboxGameBar() {
  const [open, setOpen] = useState(false);
  const [fps] = useState(() => Math.floor(Math.random() * 20) + 55);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === 'g') { e.preventDefault(); setOpen(v => !v); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  if (!open) return null;

  return (
    <div style={{
      position: 'fixed', top: '60px', left: '50%', transform: 'translateX(-50%)',
      background: 'rgba(20,20,20,0.95)', border: '1px solid rgba(255,255,255,0.15)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      zIndex: 99998, display: 'flex', gap: '0',
      backdropFilter: 'blur(20px)', color: '#fff',
    }}>
      {[
        { label: 'Capture', icon: '⏺', action: () => {} },
        { label: 'Audio', icon: '🔊', action: () => {} },
        { label: 'Performance', icon: '📊', action: () => {} },
        { label: 'Xbox Social', icon: '👥', action: () => {} },
      ].map(p => (
        <button
          key={p.label}
          onClick={p.action}
          style={{
            background: 'none', border: 'none', color: '#fff', cursor: 'pointer',
            padding: '12px 20px', display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: '4px', fontSize: '11px',
            borderRight: '1px solid rgba(255,255,255,0.1)',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'none')}
        >
          <span style={{ fontSize: '20px' }}>{p.icon}</span>
          {p.label}
        </button>
      ))}
      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', borderLeft: '1px solid rgba(255,255,255,0.1)', fontSize: '11px' }}>
        <span style={{ color: '#107c10', fontSize: '18px', fontWeight: 700 }}>{fps}</span>
        <span>FPS</span>
      </div>
      <button
        onClick={() => setOpen(false)}
        style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '12px 16px', fontSize: '14px' }}
      >✕</button>
    </div>
  );
}
