import { useOS } from '../os/OSContext';
import { useState, useEffect, useRef } from 'react';

export function LockScreen() {
  const { phase, setPhase } = useOS();
  const [showLogin, setShowLogin] = useState(false);
  const [time, setTime] = useState(new Date());
  const [password, setPassword] = useState('');
  const [shaking, setShaking] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (phase !== 'lock') { setShowLogin(false); setPassword(''); return; }
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, [phase]);

  useEffect(() => {
    if (showLogin) setTimeout(() => inputRef.current?.focus(), 300);
  }, [showLogin]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (phase !== 'lock') return;
      if (!showLogin) { setShowLogin(true); return; }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [phase, showLogin]);

  if (phase !== 'lock') return null;

  const fmt = (d: Date) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const fmtDate = (d: Date) => d.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });

  const handleUnlock = () => {
    setTransitioning(true);
    setTimeout(() => { setPhase('desktop'); setTransitioning(false); }, 400);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleUnlock();
  };

  return (
    <div
      className="fixed inset-0 z-[99990] overflow-hidden text-white cursor-pointer"
      style={{
        background: 'linear-gradient(135deg, #0d1b2a 0%, #1b2838 25%, #16213e 50%, #0f3460 75%, #533483 100%)',
        transform: transitioning ? 'translateY(-100%)' : 'translateY(0)',
        transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
      onClick={() => !showLogin && setShowLogin(true)}
    >
      {/* Clock panel */}
      <div
        style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          transform: showLogin ? 'translateY(-100%)' : 'translateY(0)',
          transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          opacity: showLogin ? 0 : 1,
        }}
      >
        <div style={{ textAlign: 'center', marginTop: '120px' }}>
          <div style={{ fontSize: '96px', fontWeight: 100, lineHeight: 1, letterSpacing: '-2px' }}>{fmt(time)}</div>
          <div style={{ fontSize: '24px', fontWeight: 300, marginTop: '12px', opacity: 0.85 }}>{fmtDate(time)}</div>
        </div>
        <div style={{ position: 'absolute', bottom: '80px', opacity: 0.6, fontSize: '13px' }}>
          Click or press any key to unlock
        </div>
      </div>

      {/* Login panel */}
      <div
        style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(20px)',
          background: 'rgba(0,0,0,0.35)',
          opacity: showLogin ? 1 : 0,
          pointerEvents: showLogin ? 'auto' : 'none',
          transition: 'opacity 0.4s ease',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          {/* Avatar */}
          <div style={{
            width: '120px', height: '120px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.15)',
            border: '2px solid rgba(255,255,255,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden',
          }}>
            <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '80px', height: '80px', marginTop: '16px', opacity: 0.9 }}>
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>

          <div style={{ fontSize: '22px', fontWeight: 400 }}>User</div>

          <div
            style={{
              display: 'flex', alignItems: 'center', gap: '0',
              animation: shaking ? 'shake 0.4s ease' : 'none',
            }}
          >
            <input
              ref={inputRef}
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Password"
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.4)',
                borderRight: 'none',
                color: '#fff',
                padding: '10px 16px',
                fontSize: '14px',
                outline: 'none',
                width: '220px',
              }}
            />
            <button
              onClick={handleUnlock}
              style={{
                background: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.4)',
                borderLeft: 'none',
                color: '#fff',
                width: '42px', height: '40px',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '18px', height: '18px' }}>
                <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
              </svg>
            </button>
          </div>

          <div style={{ fontSize: '12px', opacity: 0.6 }}>Enter any password to sign in</div>

          {/* Sign-in options */}
          <div style={{ display: 'flex', gap: '20px', marginTop: '12px', opacity: 0.75 }}>
            <button style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '12px' }}>Sign-in options</button>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes shake {
          0%,100%{transform:translateX(0)} 25%{transform:translateX(-8px)} 75%{transform:translateX(8px)}
        }
      `}</style>
    </div>
  );
}
