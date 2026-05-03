import { useState, useEffect, useCallback } from 'react';
import { useOS, type StickyNote } from '../os/OSContext';

const COLORS: Record<string, { bg: string; header: string; text: string }> = {
  yellow:  { bg: '#fff8a1', header: '#f5e642', text: '#1a1a1a' },
  green:   { bg: '#c8f5c8', header: '#6fc76f', text: '#1a1a1a' },
  pink:    { bg: '#ffd6e7', header: '#ff8cb3', text: '#1a1a1a' },
  purple:  { bg: '#e8d5ff', header: '#c084fc', text: '#1a1a1a' },
  blue:    { bg: '#d0ecff', header: '#60b8f5', text: '#1a1a1a' },
  gray:    { bg: '#e5e5e5', header: '#b0b0b0', text: '#1a1a1a' },
  charcoal:{ bg: '#404040', header: '#2a2a2a', text: '#ffffff' },
};

export function StickyNotesApp() {
  const { stickyNotes, setStickyNotes } = useOS();
  const [editingId, setEditingId] = useState<string | null>(null);

  const addNote = useCallback(() => {
    const id = `sticky-${Date.now()}`;
    const note: StickyNote = {
      id, content: '', color: 'yellow',
      x: 200 + Math.random() * 200, y: 150 + Math.random() * 100,
      width: 240, height: 220,
    };
    setStickyNotes([...stickyNotes, note]);
  }, [stickyNotes, setStickyNotes]);

  const updateNote = useCallback((id: string, updates: Partial<StickyNote>) => {
    setStickyNotes(stickyNotes.map(n => n.id === id ? { ...n, ...updates } : n));
  }, [stickyNotes, setStickyNotes]);

  const deleteNote = useCallback((id: string) => {
    setStickyNotes(stickyNotes.filter(n => n.id !== id));
  }, [stickyNotes, setStickyNotes]);

  useEffect(() => {
    if (stickyNotes.length === 0) {
      addNote();
    }
  }, []);

  if (stickyNotes.length === 0) {
    return (
      <div style={{ padding: 20, textAlign: 'center', color: '#666' }}>
        Loading notes... <button onClick={addNote}>Create Note</button>
      </div>
    );
  }

  return (
    <div style={{ 
      position: 'absolute', 
      inset: 0, 
      overflow: 'auto',
      background: '#2d2d2d',
      padding: 16,
    }}>
      <div style={{ 
        display: 'flex', 
        gap: 12, 
        flexWrap: 'wrap',
        alignItems: 'flex-start',
      }}>
        <button
          onClick={addNote}
          style={{
            width: 100,
            height: 100,
            border: '2px dashed #666',
            borderRadius: 8,
            background: 'transparent',
            color: '#888',
            fontSize: 48,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          +
        </button>
        
        {stickyNotes.map(note => (
          <StickyNoteCard
            key={note.id}
            note={note}
            editor={editingId === note.id}
            onEditor={() => setEditingId(note.id)}
            onSave={(content) => { updateNote(note.id, { content }); setEditingId(null); }}
            onUpdate={(updates) => updateNote(note.id, updates)}
            onDelete={() => deleteNote(note.id)}
          />
        ))}
      </div>
    </div>
  );
}

function StickyNoteCard({ note, editor, onEditor, onSave, onUpdate, onDelete }: {
  note: StickyNote;
  editor: boolean;
  onEditor: () => void;
  onSave: (content: string) => void;
  onUpdate: (u: Partial<StickyNote>) => void;
  onDelete: () => void;
}) {
  const { bg, header, text } = COLORS[note.color] || COLORS.yellow;
  const [editContent, setEditContent] = useState(note.content);

  const handleSave = () => {
    onSave(editContent);
  };

  if (editor) {
    return (
      <div style={{
        width: note.width,
        height: note.height,
        background: bg,
        borderRadius: 8,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '2px 4px 12px rgba(0,0,0,0.3)',
      }}>
        <div style={{
          background: header,
          height: 28,
          borderRadius: '8px 8px 0 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 8px',
        }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: text }}>Edit</span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={handleSave} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: text }}>Save</button>
            <button onClick={onDelete} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: text }}>x</button>
          </div>
        </div>
        <textarea
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          autoFocus
          style={{
            flex: 1,
            padding: 8,
            border: 'none',
            resize: 'none',
            outline: 'none',
            background: 'transparent',
            color: text,
            fontFamily: "'Segoe UI', sans-serif",
            fontSize: 13,
          }}
        />
      </div>
    );
  }

  return (
    <div
      onDoubleClick={onEditor}
      style={{
        width: note.width,
        height: note.height,
        background: bg,
        borderRadius: 8,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '2px 4px 12px rgba(0,0,0,0.3)',
        cursor: 'pointer',
      }}
    >
      <div style={{
        background: header,
        height: 28,
        borderRadius: '8px 8px 0 0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 8px',
      }}>
        <div style={{ display: 'flex', gap: 3 }}>
          {Object.entries(COLORS).map(([k, c]) => (
            <div
              key={k}
              onClick={(e) => { e.stopPropagation(); onUpdate({ color: k }); }}
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: c.header,
                cursor: 'pointer',
                border: k === note.color ? '1px solid #000' : '1px solid #888',
              }}
            />
          ))}
        </div>
        <button onClick={onDelete} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: text }}>x</button>
      </div>
      <div style={{
        flex: 1,
        padding: 8,
        overflow: 'hidden',
        color: text,
        fontFamily: "'Segoe UI', sans-serif",
        fontSize: 13,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}
      dangerouslySetInnerHTML={{ __html: note.content || '<span style="color:#999">Double-click to edit</span>' }}
      />
    </div>
  );
}