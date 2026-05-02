import { useState, useEffect, useRef } from 'react';

export function Magnifier() {
  const [active, setActive] = useState(false);
  const [zoom, setZoom] = useState(200);
  const [pos, setPos] = useState({ x: 300, y: 300 });
  const lensRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === '=') { e.preventDefault(); if (active) setZoom(z => Math.min(800, z + 50)); else setActive(true); }
      if (e.metaKey && e.key === '-') { e.preventDefault(); setZoom(z => Math.max(100, z - 50)); }
      if (e.metaKey && e.key === 'Escape') { e.preventDefault(); setActive(false); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [active]);

  useEffect(() => {
    if (!active) return;
    const mm = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', mm);
    return () => window.removeEventListener('mousemove', mm);
  }, [active]);

  if (!active) return null;

  const lensSize = 200;
  const scale = zoom / 100;

  return (
    <div style={{
      position: 'fixed', top: '40px', left: '50%', transform: 'translateX(-50%)',
      background: '#f3f3f3', border: '1px solid #aaa', zIndex: 99999,
      boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
      display: 'flex', flexDirection: 'column', userSelect: 'none',
    }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', borderBottom: '1px solid #ddd' }}>
        <span style={{ fontSize: '12px' }}>Magnifier</span>
        <button onClick={() => setZoom(z => Math.max(100, z - 50))} style={{ padding: '2px 10px', cursor: 'pointer' }}>−</button>
        <span style={{ fontSize: '12px', minWidth: '45px', textAlign: 'center' }}>{zoom}%</span>
        <button onClick={() => setZoom(z => Math.min(800, z + 50))} style={{ padding: '2px 10px', cursor: 'pointer' }}>+</button>
        <button onClick={() => setActive(false)} style={{ marginLeft: '8px', padding: '2px 10px', cursor: 'pointer' }}>✕</button>
      </div>
      {/* Lens */}
      <div
        ref={lensRef}
        style={{
          width: `${lensSize}px`, height: `${lensSize}px`, overflow: 'hidden',
          position: 'relative', background: '#000',
        }}
      >
        <div style={{
          position: 'absolute',
          transform: `scale(${scale}) translate(${-pos.x + lensSize/(2*scale)}px, ${-pos.y + lensSize/(2*scale)}px)`,
          transformOrigin: '0 0',
          width: '100vw', height: '100vh',
          pointerEvents: 'none',
        }}>
          <div style={{ fontSize: '20px', color: '#fff', padding: '20px', textAlign: 'center', paddingTop: `${pos.y - 20}px` }}>
            Magnifying: ({Math.round(pos.x)}, {Math.round(pos.y)})
          </div>
        </div>
      </div>
    </div>
  );
}
