import { useState, useRef, useEffect, type ReactNode } from 'react';
import { FluentIcon } from '../components/Window';

export function WordPad() {
  const [content] = useState('<p>Start typing here...</p>');
  const [fontFamily, setFontFamily] = useState('Calibri');
  const [fontSize, setFontSize] = useState(11);
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  const [underline, setUnderline] = useState(false);
  const [color, setColor] = useState('#000000');
  const [align, setAlign] = useState<'left' | 'center' | 'right' | 'justify'>('left');
  const [showRuler, setShowRuler] = useState(true);
  const editorRef = useRef<HTMLDivElement>(null);
  const [wordCount, setWordCount] = useState(0);

  const exec = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const updateWordCount = () => {
    const text = editorRef.current?.innerText || '';
    setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
  };

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = content;
      updateWordCount();
    }
  }, [content]);

  const fonts = ['Calibri', 'Arial', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana', 'Comic Sans MS', 'Trebuchet MS'];
  const sizes = [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72];

  const toolbarGroups: { items: { content: ReactNode; action: () => void; active?: boolean; title: string }[] }[] = [
    {
      items: [
        {
          content: <FluentIcon name="save" size={15} color="#1f2937" />,
          action: () => {
            const blob = new Blob([editorRef.current?.innerHTML || ''], { type: 'text/html' });
            const anchor = document.createElement('a');
            anchor.href = URL.createObjectURL(blob);
            anchor.download = 'document.html';
            anchor.click();
          },
          title: 'Save',
        },
        {
          content: <FluentIcon name="printer" size={15} color="#1f2937" />,
          action: () => window.print(),
          title: 'Print',
        },
      ],
    },
    {
      items: [
        { content: <strong>B</strong>, action: () => exec('bold'), active: bold, title: 'Bold (Ctrl+B)' },
        { content: <em>I</em>, action: () => exec('italic'), active: italic, title: 'Italic (Ctrl+I)' },
        { content: <span style={{ textDecoration: 'underline' }}>U</span>, action: () => exec('underline'), active: underline, title: 'Underline (Ctrl+U)' },
        { content: <FluentIcon name="strikethrough" size={15} color="#1f2937" />, action: () => exec('strikethrough'), title: 'Strikethrough' },
      ],
    },
    {
      items: [
        { content: <FluentIcon name="align_left" size={15} color="#1f2937" />, action: () => { setAlign('left'); exec('justifyLeft'); }, active: align === 'left', title: 'Align Left' },
        { content: <FluentIcon name="align_center" size={15} color="#1f2937" />, action: () => { setAlign('center'); exec('justifyCenter'); }, active: align === 'center', title: 'Center' },
        { content: <FluentIcon name="align_right" size={15} color="#1f2937" />, action: () => { setAlign('right'); exec('justifyRight'); }, active: align === 'right', title: 'Align Right' },
        { content: <FluentIcon name="align_justify" size={15} color="#1f2937" />, action: () => { setAlign('justify'); exec('justifyFull'); }, active: align === 'justify', title: 'Justify' },
      ],
    },
    {
      items: [
        { content: <FluentIcon name="list" size={15} color="#1f2937" />, action: () => exec('insertUnorderedList'), title: 'Bullet List' },
        { content: <FluentIcon name="list_ordered" size={15} color="#1f2937" />, action: () => exec('insertOrderedList'), title: 'Numbered List' },
      ],
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#f3f3f3', fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ background: '#f3f3f3', borderBottom: '1px solid #ccc', padding: '4px 8px', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', flexShrink: 0 }}>
        <select value={fontFamily} onChange={(event) => { setFontFamily(event.target.value); exec('fontName', event.target.value); }} style={{ padding: '3px 6px', border: '1px solid #ccc', fontSize: '13px', width: '130px' }}>
          {fonts.map((font) => (
            <option key={font} value={font} style={{ fontFamily: font }}>{font}</option>
          ))}
        </select>
        <select
          value={fontSize}
          onChange={(event) => {
            const size = Number(event.target.value);
            setFontSize(size);
            exec('fontSize', '3');
            if (editorRef.current) {
              const spans = editorRef.current.querySelectorAll('span[style*="font-size"]');
              spans.forEach((span) => {
                (span as HTMLElement).style.fontSize = `${size}pt`;
              });
            }
          }}
          style={{ padding: '3px 6px', border: '1px solid #ccc', fontSize: '13px', width: '50px' }}
        >
          {sizes.map((size) => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>

        <div style={{ width: '1px', height: '24px', background: '#ccc' }} />

        {toolbarGroups.map((group, groupIndex) => (
          <div key={groupIndex} style={{ display: 'flex', gap: '2px', padding: '0 4px', borderRight: '1px solid #ddd' }}>
            {group.items.map((item, itemIndex) => (
              <button
                key={itemIndex}
                title={item.title}
                onClick={item.action}
                style={{
                  width: '28px',
                  height: '28px',
                  border: `1px solid ${item.active ? '#0078D4' : 'transparent'}`,
                  background: item.active ? '#d0e4ff' : 'transparent',
                  cursor: 'pointer',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#1f2937',
                }}
              >
                {item.content}
              </button>
            ))}
          </div>
        ))}

        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <label style={{ fontSize: '12px' }}>Color:</label>
          <input type="color" value={color} onChange={(event) => { setColor(event.target.value); exec('foreColor', event.target.value); }} style={{ width: '28px', height: '28px', border: '1px solid #ccc', padding: '2px', cursor: 'pointer' }} />
        </div>
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <label style={{ fontSize: '12px' }}>BG:</label>
          <input type="color" onChange={(event) => exec('hiliteColor', event.target.value)} style={{ width: '28px', height: '28px', border: '1px solid #ccc', padding: '2px', cursor: 'pointer' }} />
        </div>
      </div>

      {showRuler && (
        <div style={{ height: '20px', background: '#e8e8e8', borderBottom: '1px solid #ccc', display: 'flex', alignItems: 'center', paddingLeft: '60px', flexShrink: 0, overflow: 'hidden' }}>
          {Array.from({ length: 18 }, (_, index) => (
            <div key={index} style={{ position: 'relative', width: '48px', height: '100%', borderLeft: '1px solid #aaa', display: 'flex', alignItems: 'flex-end', paddingBottom: '2px' }}>
              <span style={{ fontSize: '9px', color: '#888', paddingLeft: '2px' }}>{index + 1}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto', background: '#808080', padding: '20px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '816px', minHeight: '1056px', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.3)', padding: '96px 96px', boxSizing: 'border-box' }}>
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={updateWordCount}
            style={{ minHeight: '100%', outline: 'none', fontFamily, fontSize: `${fontSize}pt`, lineHeight: 1.5, color: '#000', userSelect: 'text', textAlign: align }}
          />
        </div>
      </div>

      <div style={{ height: '22px', background: '#0078D4', color: '#fff', display: 'flex', alignItems: 'center', padding: '0 12px', gap: '20px', fontSize: '12px', flexShrink: 0 }}>
        <span>{wordCount} words</span>
        <button onClick={() => setShowRuler((value) => !value)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '12px', opacity: 0.8 }}>
          {showRuler ? 'Hide' : 'Show'} ruler
        </button>
        <span style={{ marginLeft: 'auto' }}>100%</span>
      </div>
    </div>
  );
}
