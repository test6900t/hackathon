import { useState, useCallback } from 'react';

const FONT_FAMILIES = ['Segoe UI', 'Arial', 'Times New Roman', 'Courier New', 'Symbol', 'Wingdings', 'Webdings', 'Georgia'];

export function CharacterMap() {
  const [font, setFont] = useState('Segoe UI');
  const [selected, setSelected] = useState<number | null>(null);
  const [copied, setCopied] = useState('');
  const [search, setSearch] = useState('');
  const [range, setRange] = useState({ start: 32, end: 900 });
  const [zoom, setZoom] = useState<number | null>(null);

  const chars = Array.from({ length: range.end - range.start }, (_, i) => range.start + i)
    .filter(c => {
      if (!search) return true;
      const ch = String.fromCodePoint(c);
      return ch.toLowerCase().includes(search.toLowerCase());
    });

  const addChar = (code: number) => {
    setCopied(prev => prev + String.fromCodePoint(code));
  };

  const copyToClipboard = async () => {
    try { await navigator.clipboard.writeText(copied); alert('Copied to clipboard!'); } catch {}
  };

  const RANGES = [
    { label: 'Basic Latin (32-127)', start: 32, end: 128 },
    { label: 'Latin Extended (128-255)', start: 128, end: 256 },
    { label: 'Greek (880-1023)', start: 880, end: 1024 },
    { label: 'Cyrillic (1024-1279)', start: 1024, end: 1280 },
    { label: 'Hebrew (1488-1599)', start: 1488, end: 1600 },
    { label: 'Arabic (1536-1791)', start: 1536, end: 1792 },
    { label: 'Math Operators (8704-8959)', start: 8704, end: 8960 },
    { label: 'Box Drawing (9472-9599)', start: 9472, end: 9600 },
    { label: 'Block Elements (9600-9631)', start: 9600, end: 9632 },
    { label: 'Geometric Shapes (9632-9727)', start: 9632, end: 9728 },
    { label: 'Emoji (128512-128591)', start: 128512, end: 128592 },
    { label: 'All Basic (32-900)', start: 32, end: 900 },
  ];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', fontFamily: "'Segoe UI', sans-serif", fontSize: '13px' }}>
      {/* Controls */}
      <div style={{ background: '#f3f3f3', borderBottom: '1px solid #ddd', padding: '8px 12px', display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0, flexWrap: 'wrap' }}>
        <label>Font:</label>
        <select value={font} onChange={e => setFont(e.target.value)}
          style={{ padding: '4px 8px', border: '1px solid #ccc', fontSize: '13px', fontFamily: font }}>
          {FONT_FAMILIES.map(f => <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>)}
        </select>
        <label>Range:</label>
        <select onChange={e => { const r = RANGES[Number(e.target.value)]; setRange({ start: r.start, end: r.end }); }}
          style={{ padding: '4px 8px', border: '1px solid #ccc', fontSize: '13px' }}>
          {RANGES.map((r, i) => <option key={i} value={i}>{r.label}</option>)}
        </select>
        <input placeholder="Search character..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ padding: '4px 8px', border: '1px solid #ccc', fontSize: '13px', width: '160px' }} />
      </div>

      {/* Grid */}
      <div style={{ flex: 1, overflow: 'auto', padding: '8px', background: '#fff' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1px' }}>
          {chars.slice(0, 2000).map(code => {
            const ch = String.fromCodePoint(code);
            return (
              <div
                key={code}
                onClick={() => { setSelected(code); addChar(code); }}
                onMouseEnter={() => setZoom(code)}
                onMouseLeave={() => setZoom(null)}
                title={`U+${code.toString(16).toUpperCase().padStart(4, '0')} ${ch}`}
                style={{
                  width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: font, fontSize: '16px', cursor: 'pointer',
                  background: selected === code ? '#0078D4' : 'transparent',
                  color: selected === code ? '#fff' : '#333',
                  border: '1px solid #e0e0e0',
                  position: 'relative',
                }}
              >
                {ch}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom panel */}
      <div style={{ background: '#f3f3f3', borderTop: '1px solid #ddd', padding: '8px 12px', display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
        {selected !== null && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '12px' }}>
            <div style={{ width: '48px', height: '48px', border: '1px solid #ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: font, fontSize: '32px', background: '#fff' }}>
              {String.fromCodePoint(selected)}
            </div>
            <div>
              <div style={{ fontWeight: 600 }}>U+{selected.toString(16).toUpperCase().padStart(4, '0')}</div>
              <div style={{ fontSize: '11px', color: '#666' }}>Decimal: {selected}</div>
            </div>
          </div>
        )}
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flex: 1 }}>
          <label style={{ fontSize: '12px' }}>Characters to copy:</label>
          <input value={copied} onChange={e => setCopied(e.target.value)} readOnly
            style={{ flex: 1, padding: '4px 8px', border: '1px solid #ccc', fontFamily: font, fontSize: '16px' }} />
          <button onClick={() => setCopied('')} style={{ padding: '4px 10px', cursor: 'pointer', border: '1px solid #ccc' }}>Clear</button>
          <button onClick={copyToClipboard} disabled={!copied}
            style={{ padding: '4px 16px', background: '#0078D4', color: '#fff', border: 'none', cursor: 'pointer' }}>
            Copy
          </button>
        </div>
      </div>
    </div>
  );
}
