import { useOS } from '../os/OSContext';
import { useState, useRef, useEffect } from 'react';
import type { StickyNote } from '../os/OSContext';

const COLORS: Record<string, { bg: string; header: string; text: string }> = {
  yellow:  { bg: '#fff8a1', header: '#f5e642', text: '#1a1a1a' },
  green:   { bg: '#c8f5c8', header: '#6fc76f', text: '#1a1a1a' },
  pink:    { bg: '#ffd6e7', header: '#ff8cb3', text: '#1a1a1a' },
  purple:  { bg: '#e8d5ff', header: '#c084fc', text: '#1a1a1a' },
  blue:    { bg: '#d0ecff', header: '#60b8f5', text: '#1a1a1a' },
  gray:    { bg: '#e5e5e5', header: '#b0b0b0', text: '#1a1a1a' },
  charcoal:{ bg: '#404040', header: '#2a2a2a', text: '#ffffff' },
};

export function StickyNotesLayer() {
  const { stickyNotes, setStickyNotes } = useOS();

  const addNote = () => {
    const id = `sticky-${Date.now()}`;
    const note: StickyNote = {
      id, content: '', color: 'yellow',
      x: 200 + Math.random() * 200, y: 100 + Math.random() * 200,
      width: 200, height: 200,
    };
    setStickyNotes([...stickyNotes, note]);
  };

  return (
    <>
      {stickyNotes.map(note => (
        <StickyNoteCard key={note.id} note={note} onUpdate={(updates) => {
          setStickyNotes(stickyNotes.map(n => n.id === note.id ? { ...n, ...updates } : n));
        }} onDelete={() => {
          setStickyNotes(stickyNotes.filter(n => n.id !== note.id));
        }} onAdd={addNote} />
      ))}
    </>
  );
}

function StickyNoteCard({ note, onUpdate, onDelete, onAdd }: {
  note: StickyNote;
  onUpdate: (u: Partial<StickyNote>) => void;
  onDelete: () => void;
  onAdd: () => void;
}) {
  const { bg, header, text } = COLORS[note.color] || COLORS.yellow;
  const dragStart = useRef<{ mx: number; my: number; nx: number; ny: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, [contenteditable]')) return;
    dragStart.current = { mx: e.clientX, my: e.clientY, nx: note.x, ny: note.y };
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;
    const mm = (e: MouseEvent) => {
      if (!dragStart.current) return;
      onUpdate({
        x: dragStart.current.nx + e.clientX - dragStart.current.mx,
        y: dragStart.current.ny + e.clientY - dragStart.current.my,
      });
    };
    const mu = () => setIsDragging(false);
    window.addEventListener('mousemove', mm);
    window.addEventListener('mouseup', mu);
    return () => { window.removeEventListener('mousemove', mm); window.removeEventListener('mouseup', mu); };
  }, [isDragging, onUpdate]);

  return (
    <div style={{
      position: 'fixed', left: note.x, top: note.y,
      width: note.width, height: note.height,
      background: bg, boxShadow: '2px 4px 12px rgba(0,0,0,0.2)',
      display: 'flex', flexDirection: 'column',
      zIndex: 8000, resize: 'both', overflow: 'auto',
      minWidth: '160px', minHeight: '140px',
      cursor: isDragging ? 'grabbing' : 'default',
    }}>
      {/* Header */}
      <div
        style={{
          background: header, height: '30px', display: 'flex',
          alignItems: 'center', justifyContent: 'space-between',
          padding: '0 8px', cursor: 'grab', flexShrink: 0, userSelect: 'none',
        }}
        onMouseDown={handleMouseDown}
      >
        {/* Color picker */}
        <div style={{ display: 'flex', gap: '4px' }}>
          {Object.entries(COLORS).map(([k, c]) => (
            <div
              key={k}
              onClick={() => onUpdate({ color: k })}
              style={{
                width: '12px', height: '12px', borderRadius: '50%',
                background: c.header, cursor: 'pointer',
                border: k === note.color ? '2px solid rgba(0,0,0,0.5)' : '1px solid rgba(0,0,0,0.2)',
              }}
            />
          ))}
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button onClick={onAdd} title="New note" style={{ background: 'none', border: 'none', cursor: 'pointer', color: text, fontSize: '16px', lineHeight: 1 }}>+</button>
          <button onClick={onDelete} title="Delete" style={{ background: 'none', border: 'none', cursor: 'pointer', color: text, fontSize: '14px', lineHeight: 1 }}>×</button>
        </div>
      </div>

      {/* Content */}
      <div
        contentEditable
        suppressContentEditableWarning
        style={{
          flex: 1, padding: '8px', outline: 'none',
          color: text, fontSize: '13px', lineHeight: 1.5,
          overflowY: 'auto', wordBreak: 'break-word',
          fontFamily: "'Segoe UI', sans-serif",
        }}
        onInput={e => onUpdate({ content: (e.target as HTMLElement).innerHTML })}
        dangerouslySetInnerHTML={{ __html: note.content }}
      />
    </div>
  );
}
