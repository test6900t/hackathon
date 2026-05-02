import { useRef, useState, useEffect, useCallback } from 'react';

type Tool = 'pencil' | 'eraser' | 'fill' | 'colorpicker' | 'text' | 'select' | 'line' | 'rect' | 'ellipse' | 'rounded-rect';
type BrushType = 'round' | 'square' | 'calligraphy' | 'spray' | 'soft';

const COLORS = [
  '#000000','#444444','#666666','#999999','#cccccc','#ffffff',
  '#ff0000','#ff6600','#ffff00','#00ff00','#0000ff','#8800ff',
  '#ff00ff','#00ffff','#ff8888','#88ff88','#8888ff','#ffff88',
  '#884400','#004488','#448800','#880044','#004400','#440000',
  '#ff4400','#44ff00','#0044ff','#ff0044','#00ff44','#4400ff',
];

export function Paint() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<Tool>('pencil');
  const [color1, setColor1] = useState('#000000');
  const [color2, setColor2] = useState('#ffffff');
  const [size, setSize] = useState(3);
  const [drawing, setDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [canvasSize] = useState({ w: 900, h: 600 });
  const [undoStack, setUndoStack] = useState<ImageData[]>([]);
  const [showGrid, setShowGrid] = useState(false);
  const [showRuler, setShowRuler] = useState(true);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [textInput, setTextInput] = useState<{ x: number; y: number; value: string } | null>(null);
  const [brushType, setBrushType] = useState<BrushType>('round');
  const [activeTab, setActiveTab] = useState<'home' | 'view'>('home');
  const lastPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasSize.w, canvasSize.h);
  }, []);

  const saveUndo = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    setUndoStack(s => [...s, ctx.getImageData(0, 0, canvas.width, canvas.height)].slice(-50));
  }, []);

  const undo = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || undoStack.length === 0) return;
    const ctx = canvas.getContext('2d')!;
    ctx.putImageData(undoStack[undoStack.length - 1], 0, 0);
    setUndoStack(s => s.slice(0, -1));
  }, [undoStack]);

  const getPos = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: Math.round((e.clientX - rect.left) / zoom),
      y: Math.round((e.clientY - rect.top) / zoom),
    };
  };

  const floodFill = (ctx: CanvasRenderingContext2D, x: number, y: number, fillColor: string) => {
    const imgData = ctx.getImageData(0, 0, canvasSize.w, canvasSize.h);
    const data = imgData.data;
    const targetIdx = (y * canvasSize.w + x) * 4;
    const tr = data[targetIdx], tg = data[targetIdx+1], tb = data[targetIdx+2], ta = data[targetIdx+3];
    const fc = parseInt(fillColor.slice(1), 16);
    const fr = (fc >> 16) & 255, fg = (fc >> 8) & 255, fb = fc & 255;
    if (tr === fr && tg === fg && tb === fb) return;
    const stack = [[x, y]];
    while (stack.length) {
      const [cx, cy] = stack.pop()!;
      const idx = (cy * canvasSize.w + cx) * 4;
      if (cx < 0 || cx >= canvasSize.w || cy < 0 || cy >= canvasSize.h) continue;
      if (data[idx] !== tr || data[idx+1] !== tg || data[idx+2] !== tb || data[idx+3] !== ta) continue;
      data[idx] = fr; data[idx+1] = fg; data[idx+2] = fb; data[idx+3] = 255;
      stack.push([cx+1,cy],[cx-1,cy],[cx,cy+1],[cx,cy-1]);
    }
    ctx.putImageData(imgData, 0, 0);
  };

  const draw = useCallback((e: React.MouseEvent, isStart = false) => {
    const pos = getPos(e);
    const canvas = canvasRef.current;
    const overlay = overlayRef.current;
    if (!canvas || !overlay) return;
    const ctx = canvas.getContext('2d')!;
    const oct = overlay.getContext('2d')!;
    const activeColor = e.button === 2 ? color2 : color1;

    setCursorPos(pos);

    if (!drawing && !isStart) return;

    if (tool === 'pencil' || tool === 'eraser') {
      ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
      ctx.strokeStyle = tool === 'eraser' ? 'rgba(0,0,0,1)' : activeColor;
      ctx.lineWidth = size;
      ctx.lineCap = brushType === 'round' ? 'round' : 'square';
      ctx.lineJoin = 'round';
      if (isStart) {
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
      } else {
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
      }
      ctx.globalCompositeOperation = 'source-over';
    } else if (tool === 'fill' && isStart) {
      saveUndo();
      floodFill(ctx, pos.x, pos.y, activeColor);
    } else if (tool === 'colorpicker' && isStart) {
      const pixel = ctx.getImageData(pos.x, pos.y, 1, 1).data;
      const hex = '#' + [pixel[0],pixel[1],pixel[2]].map(v => v.toString(16).padStart(2,'0')).join('');
      if (e.button === 2) setColor2(hex); else setColor1(hex);
    } else if (['line','rect','ellipse','rounded-rect'].includes(tool)) {
      oct.clearRect(0, 0, overlay.width, overlay.height);
      if (!isStart) {
        oct.strokeStyle = activeColor;
        oct.lineWidth = size;
        oct.lineCap = 'round';
        if (tool === 'line') {
          oct.beginPath(); oct.moveTo(startPos.x, startPos.y); oct.lineTo(pos.x, pos.y); oct.stroke();
        } else if (tool === 'rect') {
          oct.strokeRect(startPos.x, startPos.y, pos.x - startPos.x, pos.y - startPos.y);
        } else if (tool === 'ellipse') {
          oct.beginPath();
          oct.ellipse(startPos.x + (pos.x-startPos.x)/2, startPos.y + (pos.y-startPos.y)/2, Math.abs(pos.x-startPos.x)/2, Math.abs(pos.y-startPos.y)/2, 0, 0, Math.PI*2);
          oct.stroke();
        }
      }
    } else if (tool === 'text' && isStart) {
      setTextInput({ x: pos.x, y: pos.y, value: '' });
      return;
    }

    lastPos.current = pos;
  }, [drawing, tool, color1, color2, size, startPos, brushType, zoom, saveUndo]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const pos = getPos(e);
    setStartPos(pos);
    lastPos.current = pos;
    setDrawing(true);
    if (!['fill','colorpicker','text'].includes(tool)) saveUndo();
    draw(e, true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    draw(e, false);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    setDrawing(false);
    // Commit overlay to canvas
    const canvas = canvasRef.current;
    const overlay = overlayRef.current;
    if (canvas && overlay && ['line','rect','ellipse'].includes(tool)) {
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(overlay, 0, 0);
      overlay.getContext('2d')!.clearRect(0, 0, overlay.width, overlay.height);
    }
  };

  const commitText = () => {
    if (!textInput) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = color1;
    ctx.font = `${size * 4}px sans-serif`;
    ctx.fillText(textInput.value, textInput.x, textInput.y);
    setTextInput(null);
  };

  const saveImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement('a');
    a.download = 'untitled.png';
    a.href = canvas.toDataURL();
    a.click();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    saveUndo();
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'z') { e.preventDefault(); undo(); }
      if (e.key === 'Escape' && textInput) { setTextInput(null); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, textInput]);

  const TOOLS: { id: Tool; label: string; icon: string }[] = [
    { id: 'pencil', label: 'Pencil', icon: '✏️' },
    { id: 'eraser', label: 'Eraser', icon: '⬜' },
    { id: 'fill', label: 'Fill', icon: '🪣' },
    { id: 'colorpicker', label: 'Color Picker', icon: '💉' },
    { id: 'text', label: 'Text', icon: 'A' },
    { id: 'select', label: 'Select', icon: '⬚' },
    { id: 'line', label: 'Line', icon: '╱' },
    { id: 'rect', label: 'Rectangle', icon: '▭' },
    { id: 'ellipse', label: 'Ellipse', icon: '⬭' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#c0c0c0', userSelect: 'none' }}>
      {/* Ribbon tabs */}
      <div style={{ background: '#f3f3f3', borderBottom: '1px solid #ddd', display: 'flex', gap: '2px', padding: '0 8px', flexShrink: 0 }}>
        {(['home','view'] as const).map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            style={{ padding: '6px 16px', border: 'none', background: activeTab === t ? '#fff' : 'transparent', borderBottom: activeTab === t ? '2px solid #0078D4' : '2px solid transparent', cursor: 'pointer', fontSize: '13px', fontWeight: activeTab === t ? 600 : 400 }}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Ribbon content */}
      <div style={{ background: '#f3f3f3', borderBottom: '1px solid #ccc', padding: '6px 8px', display: 'flex', gap: '12px', alignItems: 'stretch', flexShrink: 0, flexWrap: 'wrap' }}>
        {activeTab === 'home' && <>
          {/* File actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', borderRight: '1px solid #ddd', paddingRight: '12px' }}>
            <div style={{ fontSize: '10px', color: '#777', marginBottom: '2px' }}>FILE</div>
            <div style={{ display: 'flex', gap: '4px' }}>
              {[
                { label: 'New', action: clearCanvas },
                { label: 'Save', action: saveImage },
                { label: 'Undo', action: undo },
              ].map(b => (
                <button key={b.label} onClick={b.action}
                  style={{ padding: '4px 10px', border: '1px solid #ccc', background: '#fff', cursor: 'pointer', fontSize: '12px' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#e0e0e0')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
                >{b.label}</button>
              ))}
            </div>
          </div>

          {/* Tools */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', borderRight: '1px solid #ddd', paddingRight: '12px' }}>
            <div style={{ fontSize: '10px', color: '#777', marginBottom: '2px' }}>TOOLS</div>
            <div style={{ display: 'flex', gap: '2px', flexWrap: 'wrap', maxWidth: '260px' }}>
              {TOOLS.map(t => (
                <button key={t.id} title={t.label} onClick={() => setTool(t.id)}
                  style={{ width: '32px', height: '32px', border: `2px solid ${tool === t.id ? '#0078D4' : 'transparent'}`, background: tool === t.id ? '#d0e4ff' : '#f3f3f3', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {t.icon}
                </button>
              ))}
            </div>
          </div>

          {/* Size */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', borderRight: '1px solid #ddd', paddingRight: '12px' }}>
            <div style={{ fontSize: '10px', color: '#777', marginBottom: '2px' }}>SIZE</div>
            <input type="range" min={1} max={50} value={size} onChange={e => setSize(Number(e.target.value))}
              style={{ width: '80px', accentColor: '#0078D4' }} />
            <div style={{ fontSize: '11px', textAlign: 'center' }}>{size}px</div>
          </div>

          {/* Colors */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <div style={{ fontSize: '10px', color: '#777', marginBottom: '2px' }}>COLORS</div>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              {/* Color 1/2 swatches */}
              <div style={{ position: 'relative', width: '36px', height: '36px' }}>
                <div style={{ position: 'absolute', right: 0, bottom: 0, width: '24px', height: '24px', background: color2, border: '2px solid #aaa' }} />
                <div style={{ position: 'absolute', left: 0, top: 0, width: '24px', height: '24px', background: color1, border: '2px solid #555', cursor: 'pointer' }} onClick={() => { const t = color1; setColor1(color2); setColor2(t); }} />
              </div>
              {/* Palette */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 20px)', gap: '2px' }}>
                {COLORS.map(c => (
                  <div key={c}
                    style={{ width: '18px', height: '18px', background: c, border: '1px solid rgba(0,0,0,0.2)', cursor: 'pointer' }}
                    onClick={() => setColor1(c)}
                    onContextMenu={e => { e.preventDefault(); setColor2(c); }}
                    title={c}
                  />
                ))}
              </div>
              <input type="color" value={color1} onChange={e => setColor1(e.target.value)} title="Custom color" style={{ width: '28px', height: '28px', border: '1px solid #aaa', padding: '2px', cursor: 'pointer' }} />
            </div>
          </div>
        </>}

        {activeTab === 'view' && <>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
              <input type="checkbox" checked={showGrid} onChange={e => setShowGrid(e.target.checked)} />
              Gridlines
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
              <input type="checkbox" checked={showRuler} onChange={e => setShowRuler(e.target.checked)} />
              Ruler
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
              Zoom:
              <button onClick={() => setZoom(z => Math.max(0.25, z - 0.25))} style={{ padding: '2px 8px', cursor: 'pointer' }}>-</button>
              <span>{Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom(z => Math.min(8, z + 0.25))} style={{ padding: '2px 8px', cursor: 'pointer' }}>+</button>
            </div>
          </div>
        </>}
      </div>

      {/* Canvas area */}
      <div style={{ flex: 1, overflow: 'auto', background: '#808080', display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start', padding: '16px', position: 'relative' }}>
        {/* Ruler */}
        {showRuler && (
          <div style={{ position: 'sticky', top: 0, left: 0, height: '16px', background: '#f3f3f3', borderBottom: '1px solid #999', fontSize: '9px', color: '#555', display: 'flex', alignItems: 'flex-end', paddingBottom: '2px', minWidth: `${canvasSize.w * zoom}px` }}>
            {Array.from({ length: Math.floor(canvasSize.w / 50) }, (_, i) => (
              <div key={i} style={{ position: 'absolute', left: i * 50 * zoom, borderLeft: '1px solid #999', paddingLeft: '2px' }}>{i * 50}</div>
            ))}
          </div>
        )}
        <div style={{ position: 'relative', cursor: tool === 'fill' ? 'cell' : tool === 'eraser' ? 'cell' : tool === 'colorpicker' ? 'crosshair' : tool === 'text' ? 'text' : 'crosshair' }}>
          <canvas
            ref={canvasRef}
            width={canvasSize.w}
            height={canvasSize.h}
            style={{ display: 'block', transform: `scale(${zoom})`, transformOrigin: '0 0', imageRendering: 'pixelated', border: '1px solid #aaa' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onContextMenu={e => { e.preventDefault(); handleMouseDown(e); }}
          />
          <canvas
            ref={overlayRef}
            width={canvasSize.w}
            height={canvasSize.h}
            style={{ position: 'absolute', top: 0, left: 0, transform: `scale(${zoom})`, transformOrigin: '0 0', pointerEvents: 'none' }}
          />
          {showGrid && (
            <svg style={{ position: 'absolute', top: 0, left: 0, transform: `scale(${zoom})`, transformOrigin: '0 0', pointerEvents: 'none', width: canvasSize.w, height: canvasSize.h }}>
              <defs>
                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(0,0,200,0.2)" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          )}
          {textInput && (
            <input
              autoFocus
              value={textInput.value}
              onChange={e => setTextInput({ ...textInput, value: e.target.value })}
              onBlur={commitText}
              onKeyDown={e => { if (e.key === 'Enter') commitText(); }}
              style={{ position: 'absolute', left: textInput.x * zoom, top: textInput.y * zoom - size * 4, background: 'transparent', border: '1px dashed #0078D4', outline: 'none', color: color1, fontFamily: 'sans-serif', fontSize: `${size * 4 * zoom}px`, minWidth: '80px', zIndex: 10 }}
            />
          )}
        </div>
      </div>

      {/* Status bar */}
      <div style={{ height: '22px', background: '#f3f3f3', borderTop: '1px solid #ddd', display: 'flex', alignItems: 'center', padding: '0 12px', gap: '20px', fontSize: '12px', color: '#555', flexShrink: 0 }}>
        <span>{cursorPos.x}, {cursorPos.y}px</span>
        <span>{canvasSize.w} × {canvasSize.h}px</span>
        <span>{Math.round(zoom * 100)}%</span>
      </div>
    </div>
  );
}
