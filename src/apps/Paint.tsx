import { useRef, useState, useEffect, useCallback } from 'react';

type Tool = 'pencil' | 'eraser' | 'fill' | 'colorpicker' | 'text' | 'select' | 'line' | 'rect' | 'ellipse' | 'rounded-rect';
type BrushType = 'round' | 'square' | 'calligraphy' | 'spray';

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tool, setTool] = useState<Tool>('pencil');
  const [color1, setColor1] = useState('#000000');
  const [color2, setColor2] = useState('#ffffff');
  const [size, setSize] = useState(3);
  const [drawing, setDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [canvasSize] = useState({ w: 900, h: 600 });
  const [undoStack, setUndoStack] = useState<ImageData[]>([]);
  const [redoStack, setRedoStack] = useState<ImageData[]>([]);
  const [showGrid, setShowGrid] = useState(false);
  const [showRuler, setShowRuler] = useState(true);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [textInput, setTextInput] = useState<{ x: number; y: number; value: string; fontSize: number } | null>(null);
  const [brushType, setBrushType] = useState<BrushType>('round');
  const [activeTab, setActiveTab] = useState<'home' | 'view'>('home');
  const [selection, setSelection] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
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
    setUndoStack(s => [...s.slice(-49), ctx.getImageData(0, 0, canvas.width, canvas.height)]);
    setRedoStack([]);
  }, []);

  const undo = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || undoStack.length === 0) return;
    const ctx = canvas.getContext('2d')!;
    const currentState = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setRedoStack(s => [...s, currentState]);
    ctx.putImageData(undoStack[undoStack.length - 1], 0, 0);
    setUndoStack(s => s.slice(0, -1));
  }, [undoStack]);

  const redo = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || redoStack.length === 0) return;
    const ctx = canvas.getContext('2d')!;
    const currentState = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setUndoStack(s => [...s, currentState]);
    ctx.putImageData(redoStack[redoStack.length - 1], 0, 0);
    setRedoStack(s => s.slice(0, -1));
  }, [redoStack]);

  const getPos = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { x: Math.round((e.clientX - rect.left) / zoom), y: Math.round((e.clientY - rect.top) / zoom) };
  };

  const floodFill = (ctx: CanvasRenderingContext2D, x: number, y: number, fillColor: string) => {
    const imgData = ctx.getImageData(0, 0, canvasSize.w, canvasSize.h);
    const data = imgData.data;
    const targetIdx = (y * canvasSize.w + x) * 4;
    const tr = data[targetIdx], tg = data[targetIdx+1], tb = data[targetIdx+2];
    const fc = parseInt(fillColor.slice(1), 16);
    const fr = (fc >> 16) & 255, fg = (fc >> 8) & 255, fb = fc & 255;
    if (tr === fr && tg === fg && tb === fb) return;
    const stack = [[x, y]], visited = new Set<string>();
    while (stack.length) {
      const [cx, cy] = stack.pop()!;
      const key = `${cx},${cy}`;
      if (visited.has(key)) continue;
      visited.add(key);
      const idx = (cy * canvasSize.w + cx) * 4;
      if (cx < 0 || cx >= canvasSize.w || cy < 0 || cy >= canvasSize.h) continue;
      if (data[idx] !== tr || data[idx+1] !== tg || data[idx+2] !== tb) continue;
      data[idx] = fr; data[idx+1] = fg; data[idx+2] = fb; data[idx+3] = 255;
      stack.push([cx+1,cy],[cx-1,cy],[cx,cy+1],[cx,cy-1]);
    }
    ctx.putImageData(imgData, 0, 0);
  };

  const draw = useCallback((e: React.MouseEvent, isStart = false) => {
    const pos = getPos(e);
    const canvas = canvasRef.current, overlay = overlayRef.current;
    if (!canvas || !overlay) return;
    const ctx = canvas.getContext('2d')!, oct = overlay.getContext('2d')!;
    const activeColor = e.button === 2 ? color2 : color1;
    setCursorPos(pos);
    if (!drawing && !isStart) return;

    if (tool === 'pencil' || tool === 'eraser') {
      ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
      ctx.strokeStyle = tool === 'eraser' ? 'rgba(0,0,0,1)' : activeColor;
      ctx.lineWidth = size;
      ctx.lineCap = 'round';
      if (brushType === 'spray' && tool === 'pencil') {
        for (let i = 0; i < 20; i++) {
          const angle = Math.random() * Math.PI * 2, radius = Math.random() * size * 3;
          const px = Math.round(pos.x + Math.cos(angle) * radius), py = Math.round(pos.y + Math.sin(angle) * radius);
          if (px >= 0 && px < canvasSize.w && py >= 0 && py < canvasSize.h) {
            ctx.fillStyle = activeColor; ctx.globalAlpha = 0.5; ctx.fillRect(px, py, 1, 1);
          }
        }
        ctx.globalAlpha = 1;
      } else {
        if (isStart) { ctx.beginPath(); ctx.moveTo(pos.x, pos.y); }
        else { ctx.lineTo(pos.x, pos.y); ctx.stroke(); }
      }
      ctx.globalCompositeOperation = 'source-over';
    } else if (tool === 'fill' && isStart) { saveUndo(); floodFill(ctx, pos.x, pos.y, activeColor); }
    else if (tool === 'colorpicker' && isStart) {
      const pixel = ctx.getImageData(pos.x, pos.y, 1, 1).data;
      const hex = '#' + [pixel[0],pixel[1],pixel[2]].map(v => v.toString(16).padStart(2,'0')).join('');
      if (e.button === 2) setColor2(hex); else setColor1(hex);
    } else if (['line','rect','ellipse','rounded-rect'].includes(tool)) {
      oct.clearRect(0, 0, overlay.width, overlay.height);
      if (!isStart) {
        oct.strokeStyle = activeColor; oct.lineWidth = size; oct.lineCap = 'round';
        const x1 = startPos.x, y1 = startPos.y, x2 = pos.x, y2 = pos.y;
        if (tool === 'line') { oct.beginPath(); oct.moveTo(x1, y1); oct.lineTo(x2, y2); oct.stroke(); }
        else if (tool === 'rect') oct.strokeRect(x1, y1, x2 - x1, y2 - y1);
        else if (tool === 'ellipse') { oct.beginPath(); oct.ellipse(x1 + (x2-x1)/2, y1 + (y2-y1)/2, Math.abs(x2-x1)/2, Math.abs(y2-y1)/2, 0, 0, Math.PI*2); oct.stroke(); }
        else if (tool === 'rounded-rect') { const r = 10; oct.beginPath(); oct.moveTo(x1 + r, y1); oct.lineTo(x2 - r, y1); oct.quadraticCurveTo(x2, y1, x2, y1 + r); oct.lineTo(x2, y2 - r); oct.quadraticCurveTo(x2, y2, x2 - r, y2); oct.lineTo(x1 + r, y2); oct.quadraticCurveTo(x1, y2, x1, y2 - r); oct.lineTo(x1, y1 + r); oct.quadraticCurveTo(x1, y1, x1 + r, y1); oct.closePath(); oct.stroke(); }
      }
    } else if (tool === 'text' && isStart) { setTextInput({ x: pos.x, y: pos.y, value: '', fontSize: size * 4 }); return; }
    else if (tool === 'select' && isStart) { setStartPos(pos); }
    else if (tool === 'select' && drawing) {
      oct.clearRect(0, 0, overlay.width, overlay.height);
      const x = Math.min(startPos.x, pos.x), y = Math.min(startPos.y, pos.y), w = Math.abs(pos.x - startPos.x), h = Math.abs(pos.y - startPos.y);
      if (w > 5 && h > 5) { setSelection({ x, y, w, h }); oct.strokeStyle = '#0078D4'; oct.lineWidth = 1; oct.setLineDash([5, 5]); oct.strokeRect(x, y, w, h); oct.setLineDash([]); }
    }
    lastPos.current = pos;
  }, [drawing, tool, color1, color2, size, startPos, brushType, zoom, saveUndo]);

  const handleMouseDown = (e: React.MouseEvent) => { e.preventDefault(); const pos = getPos(e); setStartPos(pos); lastPos.current = pos; setDrawing(true); if (!['fill','colorpicker','text','select'].includes(tool)) saveUndo(); draw(e, true); };
  const handleMouseMove = (e: React.MouseEvent) => { draw(e, false); };
  const handleMouseUp = () => {
    setDrawing(false);
    const canvas = canvasRef.current, overlay = overlayRef.current;
    if (canvas && overlay && ['line','rect','ellipse','rounded-rect'].includes(tool)) { canvas.getContext('2d')!.drawImage(overlay, 0, 0); overlay.getContext('2d')!.clearRect(0, 0, overlay.width, overlay.height); }
  };

  const commitText = () => { if (!textInput) return; const canvas = canvasRef.current; if (!canvas) return; const ctx = canvas.getContext('2d')!; ctx.fillStyle = color1; ctx.font = `${textInput.fontSize}px sans-serif`; ctx.fillText(textInput.value, textInput.x, textInput.y); setTextInput(null); };
  const saveImage = () => { const canvas = canvasRef.current; if (!canvas) return; const a = document.createElement('a'); a.download = 'drawing.png'; a.href = canvas.toDataURL(); a.click(); };
  const openImage = (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = (ev) => { const img = new Image(); img.onload = () => { const canvas = canvasRef.current; if (!canvas) return; const ctx = canvas.getContext('2d')!; ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvasSize.w, canvasSize.h); const scale = Math.min(canvasSize.w / img.width, canvasSize.h / img.height); ctx.drawImage(img, (canvasSize.w - img.width * scale) / 2, (canvasSize.h - img.height * scale) / 2, img.width * scale, img.height * scale); }; img.src = ev.target?.result as string; }; reader.readAsDataURL(file); e.target.value = ''; };
  const clearCanvas = () => { const canvas = canvasRef.current; if (!canvas) return; saveUndo(); canvas.getContext('2d')!.fillStyle = '#ffffff'; canvas.getContext('2d')!.fillRect(0, 0, canvas.width, canvas.height); };
  const deleteSelection = () => { if (!selection) return; const canvas = canvasRef.current; if (!canvas) return; saveUndo(); const ctx = canvas.getContext('2d')!; ctx.fillStyle = '#ffffff'; ctx.fillRect(selection.x, selection.y, selection.w, selection.h); setSelection(null); overlayRef.current?.getContext('2d')!.clearRect(0, 0, 900, 600); };

  useEffect(() => { const h = (e: KeyboardEvent) => { if (e.ctrlKey && e.key === 'z') { e.preventDefault(); undo(); } if (e.ctrlKey && e.key === 'y') { e.preventDefault(); redo(); } if (e.key === 'Escape' && textInput) setTextInput(null); if (e.key === 'Delete' && selection) deleteSelection(); }; window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h); }, [undo, redo, textInput, selection]);

  const TOOLS = [ { id: 'select', icon: '⊞' }, { id: 'pencil', icon: '✏' }, { id: 'eraser', icon: '⌫' }, { id: 'fill', icon: '▼' }, { id: 'colorpicker', icon: '◎' }, { id: 'text', icon: 'A' }, { id: 'line', icon: '╱' }, { id: 'rect', icon: '▢' }, { id: 'ellipse', icon: '◯' }, { id: 'rounded-rect', icon: '▣' } ];
  const BRUSHES: { id: BrushType; label: string }[] = [ { id: 'round', label: 'Round' }, { id: 'square', label: 'Square' }, { id: 'calligraphy', label: 'Calligraphy' }, { id: 'spray', label: 'Spray' } ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#c0c0c0', userSelect: 'none' }}>
      <input type="file" ref={fileInputRef} onChange={openImage} accept="image/*" style={{ display: 'none' }} />
      <div style={{ background: '#f3f3f3', borderBottom: '1px solid #ddd', display: 'flex', gap: '2px', padding: '0 8px', flexShrink: 0 }}>
        {(['home','view'] as const).map(t => <button key={t} onClick={() => setActiveTab(t)} style={{ padding: '6px 16px', border: 'none', background: activeTab === t ? '#fff' : 'transparent', borderBottom: activeTab === t ? '2px solid #0078D4' : '2px solid transparent', cursor: 'pointer', fontSize: '13px', fontWeight: activeTab === t ? 600 : 400 }}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>)}
      </div>
      <div style={{ background: '#f3f3f3', borderBottom: '1px solid #ccc', padding: '6px 8px', display: 'flex', gap: '12px', alignItems: 'stretch', flexShrink: 0, flexWrap: 'wrap' }}>
        {activeTab === 'home' && <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', borderRight: '1px solid #ddd', paddingRight: '12px' }}>
            <div style={{ fontSize: '10px', color: '#777', marginBottom: '2px' }}>FILE</div>
            <div style={{ display: 'flex', gap: '4px' }}>
              {[{ label: 'New', fn: clearCanvas }, { label: 'Open', fn: () => fileInputRef.current?.click() }, { label: 'Save', fn: saveImage }].map(b => <button key={b.label} onClick={b.fn} style={{ padding: '4px 10px', border: '1px solid #ccc', background: '#fff', cursor: 'pointer', fontSize: '12px' }}>{b.label}</button>)}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', borderRight: '1px solid #ddd', paddingRight: '12px' }}>
            <div style={{ fontSize: '10px', color: '#777', marginBottom: '2px' }}>EDIT</div>
            <div style={{ display: 'flex', gap: '4px' }}>
              {[{ label: 'Undo', fn: undo, dis: undoStack.length === 0 }, { label: 'Redo', fn: redo, dis: redoStack.length === 0 }].map(b => <button key={b.label} onClick={b.fn} disabled={b.dis} style={{ padding: '4px 10px', border: '1px solid #ccc', background: b.dis ? '#eee' : '#fff', cursor: b.dis ? 'not-allowed' : 'pointer', fontSize: '12px', opacity: b.dis ? 0.5 : 1 }}>{b.label}</button>)}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', borderRight: '1px solid #ddd', paddingRight: '12px' }}>
            <div style={{ fontSize: '10px', color: '#777', marginBottom: '2px' }}>TOOLS</div>
            <div style={{ display: 'flex', gap: '2px', flexWrap: 'wrap', maxWidth: '280px' }}>
              {TOOLS.map(t => <button key={t.id} title={t.id} onClick={() => setTool(t.id as Tool)} style={{ width: '32px', height: '32px', border: `2px solid ${tool === t.id ? '#0078D4' : 'transparent'}`, background: tool === t.id ? '#d0e4ff' : '#f3f3f3', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{t.icon}</button>)}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', borderRight: '1px solid #ddd', paddingRight: '12px' }}>
            <div style={{ fontSize: '10px', color: '#777', marginBottom: '2px' }}>BRUSH</div>
            <select value={brushType} onChange={e => setBrushType(e.target.value as BrushType)} style={{ padding: '4px', fontSize: '12px', border: '1px solid #ccc' }}>{BRUSHES.map(b => <option key={b.id} value={b.id}>{b.label}</option>)}</select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', borderRight: '1px solid #ddd', paddingRight: '12px' }}>
            <div style={{ fontSize: '10px', color: '#777', marginBottom: '2px' }}>SIZE</div>
            <input type="range" min={1} max={50} value={size} onChange={e => setSize(Number(e.target.value))} style={{ width: '80px', accentColor: '#0078D4' }} />
            <div style={{ fontSize: '11px', textAlign: 'center' }}>{size}px</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <div style={{ fontSize: '10px', color: '#777', marginBottom: '2px' }}>COLORS</div>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <div style={{ position: 'relative', width: '36px', height: '36px' }}>
                <div style={{ position: 'absolute', right: 0, bottom: 0, width: '24px', height: '24px', background: color2, border: '2px solid #aaa' }} />
                <div style={{ position: 'absolute', left: 0, top: 0, width: '24px', height: '24px', background: color1, border: '2px solid #555', cursor: 'pointer' }} onClick={() => { const t = color1; setColor1(color2); setColor2(t); }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 20px)', gap: '2px' }}>{COLORS.map(c => <div key={c} style={{ width: '18px', height: '18px', background: c, border: '1px solid rgba(0,0,0,0.2)', cursor: 'pointer' }} onClick={() => setColor1(c)} onContextMenu={e => { e.preventDefault(); setColor2(c); }} />)}</div>
              <input type="color" value={color1} onChange={e => setColor1(e.target.value)} style={{ width: '28px', height: '28px', border: '1px solid #aaa', padding: '2px' }} />
            </div>
          </div>
        </>}
        {activeTab === 'view' && <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}><input type="checkbox" checked={showGrid} onChange={e => setShowGrid(e.target.checked)} />Gridlines</label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}><input type="checkbox" checked={showRuler} onChange={e => setShowRuler(e.target.checked)} />Ruler</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>Zoom: <button onClick={() => setZoom(z => Math.max(0.25, z - 0.25))}>-</button><span>{Math.round(zoom * 100)}%</span><button onClick={() => setZoom(z => Math.min(8, z + 0.25))}>+</button><button onClick={() => setZoom(1)} style={{ fontSize: '11px' }}>Reset</button></div>
        </div>}
      </div>
      <div style={{ flex: 1, overflow: 'auto', background: '#808080', display: 'flex', alignItems: 'flex-start', padding: '16px' }}>
        <div style={{ position: 'relative' }}>
          <canvas ref={canvasRef} width={canvasSize.w} height={canvasSize.h} style={{ display: 'block', transform: `scale(${zoom})`, transformOrigin: '0 0', imageRendering: 'pixelated', border: '1px solid #aaa' }} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} onContextMenu={e => { e.preventDefault(); handleMouseDown(e); }} />
          <canvas ref={overlayRef} width={canvasSize.w} height={canvasSize.h} style={{ position: 'absolute', top: 0, left: 0, transform: `scale(${zoom})`, transformOrigin: '0 0', pointerEvents: 'none' }} />
          {showGrid && <svg style={{ position: 'absolute', top: 0, left: 0, transform: `scale(${zoom})`, transformOrigin: '0 0', pointerEvents: 'none' }}><defs><pattern id="g" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(0,0,200,0.2)" strokeWidth="0.5"/></pattern></defs><rect width="100%" height="100%" fill="url(#g)" /></svg>}
          {textInput && <input autoFocus value={textInput.value} onChange={e => setTextInput({ ...textInput, value: e.target.value })} onBlur={commitText} onKeyDown={e => e.key === 'Enter' && commitText()} style={{ position: 'absolute', left: textInput.x * zoom, top: textInput.y * zoom - textInput.fontSize * zoom / 2, background: 'transparent', border: '1px dashed #0078D4', color: color1, fontSize: `${textInput.fontSize * zoom}px`, minWidth: '80px' }} />}
        </div>
      </div>
      <div style={{ height: '22px', background: '#f3f3f3', borderTop: '1px solid #ddd', display: 'flex', alignItems: 'center', padding: '0 12px', gap: '20px', fontSize: '12px', color: '#555' }}>
        <span>{cursorPos.x}, {cursorPos.y}px</span>
        <span>{canvasSize.w} x {canvasSize.h}</span>
        <span>{Math.round(zoom * 100)}%</span>
        <span>{tool}</span>
      </div>
    </div>
  );
}