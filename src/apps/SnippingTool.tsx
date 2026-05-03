import { useState, useRef } from 'react';
import { FluentIcon } from '../components/Window';

type Mode = 'free' | 'rect' | 'window' | 'fullscreen' | 'none';

export function SnippingTool() {
  const [mode, setMode] = useState<Mode>('none');
  const [capturing, setCapturing] = useState(false);
  const [start, setStart] = useState({ x: 0, y: 0 });
  const [current, setCurrent] = useState({ x: 0, y: 0 });
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [annotation, setAnnotation] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [delay, setDelay] = useState(0);
  const [countdown, setCountdown] = useState(0);

  const startCapture = () => {
    if (delay > 0) {
      setCountdown(delay);
      const interval = setInterval(() => {
        setCountdown((value) => {
          if (value <= 1) {
            clearInterval(interval);
            doCapture();
            return 0;
          }
          return value - 1;
        });
      }, 1000);
      return;
    }

    doCapture();
  };

  const doCapture = () => {
    if (mode === 'fullscreen') {
      setTimeout(() => {
        const dataUrl = `data:image/svg+xml,${encodeURIComponent(`
          <svg width="800" height="500" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="#1a2030"/>
            <text x="50%" y="50%" font-family="Segoe UI" font-size="20" fill="white" text-anchor="middle">
              Screenshot captured! (Full screen simulation)
            </text>
          </svg>
        `)}`;
        setScreenshot(dataUrl);
        setCapturing(false);
      }, 100);
      return;
    }

    setCapturing(true);
  };

  const finishCapture = () => {
    const width = Math.abs(current.x - start.x);
    const height = Math.abs(current.y - start.y);
    if (width > 10 && height > 10) {
      const dataUrl = `data:image/svg+xml,${encodeURIComponent(`
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#2c3e50"/>
          <text x="50%" y="50%" font-family="Segoe UI" font-size="14" fill="white" text-anchor="middle" dy=".3em">
            Captured region: ${Math.round(width)}x${Math.round(height)}px
          </text>
        </svg>
      `)}`;
      setScreenshot(dataUrl);
    }
    setCapturing(false);
  };

  const saveScreenshot = () => {
    if (!screenshot) return;
    const anchor = document.createElement('a');
    anchor.href = screenshot;
    anchor.download = `snip_${Date.now()}.png`;
    anchor.click();
  };

  const copyScreenshot = async () => {
    if (!screenshot) return;
    try {
      const response = await fetch(screenshot);
      const blob = await response.blob();
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    } catch {
      alert('Copied to clipboard (simulation)');
    }
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', fontFamily: "'Segoe UI', sans-serif", background: '#fff' }}>
      <div style={{ background: '#f3f3f3', borderBottom: '1px solid #ddd', padding: '8px 12px', display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0, flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 600, marginRight: '8px' }}>Snipping Tool</span>

        <select value={mode} onChange={(event) => setMode(event.target.value as Mode)} style={{ padding: '5px 10px', border: '1px solid #ccc', fontSize: '13px' }}>
          <option value="none">- Select mode -</option>
          <option value="free">Free-form Snip</option>
          <option value="rect">Rectangular Snip</option>
          <option value="window">Window Snip</option>
          <option value="fullscreen">Full-screen Snip</option>
        </select>

        <select value={delay} onChange={(event) => setDelay(Number(event.target.value))} style={{ padding: '5px 10px', border: '1px solid #ccc', fontSize: '13px' }}>
          <option value={0}>No Delay</option>
          <option value={1}>1 second</option>
          <option value={3}>3 seconds</option>
          <option value={5}>5 seconds</option>
        </select>

        <button onClick={startCapture} disabled={mode === 'none'} style={{ padding: '6px 20px', background: mode !== 'none' ? '#0078D4' : '#ccc', color: '#fff', border: 'none', cursor: mode !== 'none' ? 'pointer' : 'default', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <FluentIcon name="screenshot" size={14} white />
          {countdown > 0 ? `${countdown}...` : 'New'}
        </button>

        {screenshot && (
          <>
            <button onClick={saveScreenshot} style={toolbarButton}>
              <FluentIcon name="save" size={14} color="#111827" />
              Save
            </button>
            <button onClick={copyScreenshot} style={toolbarButton}>
              <FluentIcon name="copy" size={14} color="#111827" />
              Copy
            </button>
            <button onClick={() => setAnnotation((value) => !value)} style={{ ...toolbarButton, border: `1px solid ${annotation ? '#0078D4' : '#ccc'}`, background: annotation ? '#d0e4ff' : '#fff' }}>
              <FluentIcon name="brush" size={14} color="#111827" />
              Annotate
            </button>
            <button onClick={() => setScreenshot(null)} style={toolbarButton}>
              <FluentIcon name="close" size={14} color="#111827" />
              Clear
            </button>
          </>
        )}
      </div>

      <div style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
        {capturing ? (
          <div
            style={{ position: 'fixed', inset: 0, cursor: 'crosshair', background: 'rgba(0,0,0,0.3)', zIndex: 99999 }}
            onMouseDown={(event) => {
              setStart({ x: event.clientX, y: event.clientY });
              setCurrent({ x: event.clientX, y: event.clientY });
            }}
            onMouseMove={(event) => setCurrent({ x: event.clientX, y: event.clientY })}
            onMouseUp={finishCapture}
          >
            <div
              style={{
                position: 'absolute',
                left: Math.min(start.x, current.x),
                top: Math.min(start.y, current.y),
                width: Math.abs(current.x - start.x),
                height: Math.abs(current.y - start.y),
                border: '2px solid #0078D4',
                background: 'rgba(0,120,212,0.1)',
              }}
            />
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#fff', fontSize: '16px', textShadow: '0 0 10px rgba(0,0,0,0.8)' }}>
              Drag to select area. Press Esc to cancel.
            </div>
          </div>
        ) : screenshot ? (
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <img src={screenshot} alt="Screenshot" style={{ maxWidth: '100%', border: '1px solid #ddd', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#888', gap: '12px' }}>
            <div style={{ display: 'inline-flex', width: '88px', height: '88px', borderRadius: '24px', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6' }}>
              <FluentIcon name="screenshot" size={40} color="#6b7280" />
            </div>
            <div style={{ fontSize: '16px' }}>Select a snip mode and click New to take a screenshot</div>
            <div style={{ fontSize: '13px', opacity: 0.7 }}>Keyboard shortcut: Win+Shift+S</div>
          </div>
        )}
      </div>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}

const toolbarButton: React.CSSProperties = {
  padding: '6px 16px',
  border: '1px solid #ccc',
  background: '#fff',
  cursor: 'pointer',
  fontSize: '13px',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
};
