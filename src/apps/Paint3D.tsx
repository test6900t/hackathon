import { useRef, useState, useEffect } from 'react';
import { FluentIcon } from '../components/Window';

type Tool3D = 'brush' | 'eraser' | 'fill' | 'shapes' | 'text' | 'stickers' | 'effects';
type Shape3D = 'cube' | 'sphere' | 'cone' | 'cylinder' | 'none';

export function Paint3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<Tool3D>('brush');
  const [color, setColor] = useState('#0078D4');
  const [brushSize, setBrushSize] = useState(8);
  const [drawing, setDrawing] = useState(false);
  const [shape, setShape] = useState<Shape3D>('none');
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [undoStack, setUndoStack] = useState<ImageData[]>([]);
  const lastPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    // Draw default background
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, '#1a1a2e');
    grad.addColorStop(1, '#16213e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw 3D grid
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 30) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 30) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }
  }, []);

  const getPos = (e: React.MouseEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const saveUndo = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    setUndoStack(s => [...s, ctx.getImageData(0, 0, canvas.width, canvas.height)].slice(-30));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const pos = getPos(e);
    saveUndo();
    setDrawing(true);
    lastPos.current = pos;

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;

    if (tool === 'brush') {
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    }

    if (tool === 'shapes' && shape !== 'none') {
      // Draw 3D shape at click position
      draw3DShape(ctx, pos.x, pos.y, shape, color);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!drawing) return;
    const pos = getPos(e);
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;

    if (tool === 'brush') {
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    } else if (tool === 'eraser') {
      ctx.clearRect(pos.x - brushSize/2, pos.y - brushSize/2, brushSize, brushSize);
    }
    lastPos.current = pos;
  };

  const draw3DShape = (ctx: CanvasRenderingContext2D, x: number, y: number, shape: Shape3D, color: string) => {
    const size = 60;
    ctx.save();
    ctx.translate(x, y);

    if (shape === 'cube') {
      const f = parseInt(color.slice(1), 16);
      const darken = (hex: string) => {
        const n = parseInt(hex.slice(1), 16);
        return `rgb(${Math.max(0, (n>>16)-60)},${Math.max(0, ((n>>8)&255)-60)},${Math.max(0, (n&255)-60)})`;
      };
      ctx.fillStyle = color;
      ctx.fillRect(-size/2, -size/2, size, size);
      ctx.fillStyle = darken(color);
      ctx.beginPath(); ctx.moveTo(-size/2, -size/2); ctx.lineTo(-size/2+20, -size/2-20); ctx.lineTo(size/2+20, -size/2-20); ctx.lineTo(size/2, -size/2); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(size/2, -size/2); ctx.lineTo(size/2+20, -size/2-20); ctx.lineTo(size/2+20, size/2-20); ctx.lineTo(size/2, size/2); ctx.closePath(); ctx.fill();
    } else if (shape === 'sphere') {
      const grad = ctx.createRadialGradient(-size/4, -size/4, 0, 0, 0, size/2);
      grad.addColorStop(0, '#fff');
      grad.addColorStop(0.3, color);
      grad.addColorStop(1, '#000');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, size/2, 0, Math.PI * 2);
      ctx.fill();
    } else if (shape === 'cone') {
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.moveTo(0, -size); ctx.lineTo(-size/2, size/2); ctx.lineTo(size/2, size/2); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath(); ctx.ellipse(0, size/2, size/2, 10, 0, 0, Math.PI*2); ctx.fill();
    } else if (shape === 'cylinder') {
      ctx.fillStyle = color;
      ctx.fillRect(-size/2, -size/2, size, size);
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.beginPath(); ctx.ellipse(0, size/2, size/2, 12, 0, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.beginPath(); ctx.ellipse(0, -size/2, size/2, 12, 0, 0, Math.PI*2); ctx.fill();
    }
    ctx.restore();
  };

  const TOOLS: { id: Tool3D; icon?: string; text?: string; label: string }[] = [
    { id: 'brush', icon: 'brush', label: 'Brushes' },
    { id: 'eraser', icon: 'eraser', label: 'Eraser' },
    { id: 'fill', icon: 'paint_bucket', label: 'Fill' },
    { id: 'shapes', icon: 'shapes', label: '3D Shapes' },
    { id: 'text', text: 'A', label: 'Text' },
    { id: 'stickers', icon: 'sticker', label: 'Stickers' },
    { id: 'effects', icon: 'sparkles', label: 'Effects' },
  ];

  const SHAPES: { id: Shape3D; icon: string }[] = [
    { id: 'none', icon: 'minus' },
    { id: 'cube', icon: 'cube' },
    { id: 'sphere', icon: 'sphere' },
    { id: 'cone', icon: 'cone' },
    { id: 'cylinder', icon: 'eraser' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#201f1e', userSelect: 'none' }}>
      {/* Top toolbar */}
      <div style={{ background: '#323130', borderBottom: '1px solid #484644', padding: '6px 12px', display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0, flexWrap: 'wrap' }}>
        <span style={{ color: '#fff', fontWeight: 600, fontSize: '14px', marginRight: '8px' }}>Paint 3D</span>
        <div style={{ display: 'flex', gap: '2px' }}>
          {TOOLS.map(t => (
            <button key={t.id} title={t.label} onClick={() => setTool(t.id)}
              style={{ padding: '6px 10px', background: tool === t.id ? '#0078D4' : 'rgba(255,255,255,0.08)', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '14px', borderRadius: '2px' }}>
              {t.icon ? <FluentIcon name={t.icon} size={15} white /> : t.text}
            </button>
          ))}
        </div>
        <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.15)', margin: '0 4px' }} />
        <input type="color" value={color} onChange={e => setColor(e.target.value)}
          style={{ width: '32px', height: '32px', border: 'none', background: 'none', cursor: 'pointer' }} />
        <input type="range" min={1} max={50} value={brushSize} onChange={e => setBrushSize(Number(e.target.value))}
          style={{ width: '80px', accentColor: '#0078D4' }} />
        <button onClick={() => { const c = canvasRef.current; if (!c || !undoStack.length) return; const ctx = c.getContext('2d')!; ctx.putImageData(undoStack[undoStack.length-1], 0, 0); setUndoStack(s => s.slice(0,-1)); }}
          style={{ padding: '5px 14px', background: 'rgba(255,255,255,0.08)', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '12px' }}>
          Undo
        </button>

        {/* 3D shape buttons */}
        {tool === 'shapes' && (
          <>
            <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.15)' }} />
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>Shape:</span>
            {SHAPES.map(s => (
              <button key={s.id} onClick={() => setShape(s.id)}
                style={{ padding: '4px 10px', background: shape === s.id ? '#0078D4' : 'rgba(255,255,255,0.08)', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '14px' }}>
                <FluentIcon name={s.icon} size={14} white />
              </button>
            ))}
          </>
        )}
      </div>

      {/* Canvas */}
      <div style={{ flex: 1, overflow: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#333' }}>
        <canvas
          ref={canvasRef}
          width={900}
          height={600}
          style={{ cursor: tool === 'eraser' ? 'cell' : 'crosshair', border: '1px solid #555', display: 'block' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={() => setDrawing(false)}
          onMouseLeave={() => setDrawing(false)}
        />
      </div>

      {/* Status */}
      <div style={{ height: '24px', background: '#201f1e', borderTop: '1px solid #484644', display: 'flex', alignItems: 'center', padding: '0 12px', gap: '20px', fontSize: '12px', color: 'rgba(255,255,255,0.6)', flexShrink: 0 }}>
        <span>900 × 600px</span>
        <span>Tool: {tool}</span>
        <span>Size: {brushSize}px</span>
      </div>
    </div>
  );
}
