import { useState, useRef, useCallback, useEffect } from 'react';

export function WordPad() {
  const [content, setContent] = useState('<p>Start typing here...</p>');
  const [fontFamily, setFontFamily] = useState('Calibri');
  const [fontSize, setFontSize] = useState(11);
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  const [underline, setUnderline] = useState(false);
  const [color, setColor] = useState('#000000');
  const [align, setAlign] = useState<'left'|'center'|'right'|'justify'>('left');
  const [showRuler, setShowRuler] = useState(true);
  const editorRef = useRef<HTMLDivElement>(null);
  const [wordCount, setWordCount] = useState(0);

  const exec = (cmd: string, val?: string) => { document.execCommand(cmd, false, val); editorRef.current?.focus(); };

  const updateWordCount = () => {
    const text = editorRef.current?.innerText || '';
    setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
  };

  useEffect(() => {
    if (editorRef.current) { editorRef.current.innerHTML = content; updateWordCount(); }
  }, []);

  const FONTS = ['Calibri','Arial','Times New Roman','Courier New','Georgia','Verdana','Comic Sans MS','Trebuchet MS'];
  const SIZES = [8,9,10,11,12,14,16,18,20,22,24,26,28,36,48,72];

  const toolbar: { groups: { label?: string; items: { icon: string; action: () => void; active?: boolean; title: string }[] }[] }[] = [
    {
      groups: [
        {
          items: [
            { icon: '💾', action: () => { const b = new Blob([editorRef.current?.innerHTML || ''], { type: 'text/html' }); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'document.html'; a.click(); }, title: 'Save' },
            { icon: '🖨', action: () => window.print(), title: 'Print' },
          ]
        },
        {
          items: [
            { icon: '<b>B</b>', action: () => exec('bold'), active: bold, title: 'Bold (Ctrl+B)' },
            { icon: '<i>I</i>', action: () => exec('italic'), active: italic, title: 'Italic (Ctrl+I)' },
            { icon: '<u>U</u>', action: () => exec('underline'), active: underline, title: 'Underline (Ctrl+U)' },
            { icon: '𝑺̶', action: () => exec('strikethrough'), title: 'Strikethrough' },
          ]
        },
        {
          items: [
            { icon: '⬅', action: () => { setAlign('left'); exec('justifyLeft'); }, active: align === 'left', title: 'Align Left' },
            { icon: '≡', action: () => { setAlign('center'); exec('justifyCenter'); }, active: align === 'center', title: 'Center' },
            { icon: '➡', action: () => { setAlign('right'); exec('justifyRight'); }, active: align === 'right', title: 'Align Right' },
            { icon: '⁞≡', action: () => { setAlign('justify'); exec('justifyFull'); }, active: align === 'justify', title: 'Justify' },
          ]
        },
        {
          items: [
            { icon: '• —', action: () => exec('insertUnorderedList'), title: 'Bullet List' },
            { icon: '1. —', action: () => exec('insertOrderedList'), title: 'Numbered List' },
          ]
        },
      ]
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#f3f3f3', fontFamily: "'Segoe UI', sans-serif" }}>
      {/* Ribbon */}
      <div style={{ background: '#f3f3f3', borderBottom: '1px solid #ccc', padding: '4px 8px', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', flexShrink: 0 }}>
        {/* Font controls */}
        <select value={fontFamily} onChange={e => { setFontFamily(e.target.value); exec('fontName', e.target.value); }}
          style={{ padding: '3px 6px', border: '1px solid #ccc', fontSize: '13px', width: '130px' }}>
          {FONTS.map(f => <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>)}
        </select>
        <select value={fontSize} onChange={e => { const s = Number(e.target.value); setFontSize(s); exec('fontSize', '3'); if (editorRef.current) { const spans = editorRef.current.querySelectorAll('span[style*="font-size"]'); spans.forEach(sp => { (sp as HTMLElement).style.fontSize = s + 'pt'; }); } }}
          style={{ padding: '3px 6px', border: '1px solid #ccc', fontSize: '13px', width: '50px' }}>
          {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <div style={{ width: '1px', height: '24px', background: '#ccc' }} />

        {toolbar[0].groups.map((g, gi) => (
          <div key={gi} style={{ display: 'flex', gap: '2px', padding: '0 4px', borderRight: '1px solid #ddd' }}>
            {g.items.map((item, ii) => (
              <button key={ii} title={item.title} onClick={item.action}
                dangerouslySetInnerHTML={{ __html: item.icon }}
                style={{
                  width: '28px', height: '28px', border: `1px solid ${item.active ? '#0078D4' : 'transparent'}`,
                  background: item.active ? '#d0e4ff' : 'transparent', cursor: 'pointer', fontSize: '13px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              />
            ))}
          </div>
        ))}

        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <label style={{ fontSize: '12px' }}>Color:</label>
          <input type="color" value={color} onChange={e => { setColor(e.target.value); exec('foreColor', e.target.value); }}
            style={{ width: '28px', height: '28px', border: '1px solid #ccc', padding: '2px', cursor: 'pointer' }} />
        </div>
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <label style={{ fontSize: '12px' }}>BG:</label>
          <input type="color" onChange={e => exec('hiliteColor', e.target.value)}
            style={{ width: '28px', height: '28px', border: '1px solid #ccc', padding: '2px', cursor: 'pointer' }} />
        </div>
      </div>

      {/* Ruler */}
      {showRuler && (
        <div style={{ height: '20px', background: '#e8e8e8', borderBottom: '1px solid #ccc', display: 'flex', alignItems: 'center', paddingLeft: '60px', flexShrink: 0, overflow: 'hidden' }}>
          {Array.from({ length: 18 }, (_, i) => (
            <div key={i} style={{ position: 'relative', width: '48px', height: '100%', borderLeft: '1px solid #aaa', display: 'flex', alignItems: 'flex-end', paddingBottom: '2px' }}>
              <span style={{ fontSize: '9px', color: '#888', paddingLeft: '2px' }}>{i + 1}</span>
            </div>
          ))}
        </div>
      )}

      {/* Page */}
      <div style={{ flex: 1, overflowY: 'auto', background: '#808080', padding: '20px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '816px', minHeight: '1056px', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.3)', padding: '96px 96px', boxSizing: 'border-box' }}>
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={updateWordCount}
            style={{
              minHeight: '100%', outline: 'none', fontFamily, fontSize: `${fontSize}pt`,
              lineHeight: 1.5, color: '#000', userSelect: 'text',
              textAlign: align,
            }}
          />
        </div>
      </div>

      {/* Status bar */}
      <div style={{ height: '22px', background: '#0078D4', color: '#fff', display: 'flex', alignItems: 'center', padding: '0 12px', gap: '20px', fontSize: '12px', flexShrink: 0 }}>
        <span>{wordCount} words</span>
        <button onClick={() => setShowRuler(v => !v)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '12px', opacity: 0.8 }}>
          {showRuler ? 'Hide' : 'Show'} ruler
        </button>
        <span style={{ marginLeft: 'auto' }}>100%</span>
      </div>
    </div>
  );
}
