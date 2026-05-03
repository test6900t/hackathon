import { useState, useRef, useEffect, useCallback } from 'react';
import { VirtualFS } from '../os/VirtualFS';

interface NotepadProps {
  filePath?: string;
  initialContent?: string;
}

export function Notepad({ filePath, initialContent }: NotepadProps) {
  const [content, setContent] = useState('');
  const [savedContent, setSavedContent] = useState('');
  const [currentFile, setCurrentFile] = useState<string | null>(filePath || null);
  const [wordWrap, setWordWrap] = useState(true);
  const [showStatusBar, setShowStatusBar] = useState(true);
  const [showFind, setShowFind] = useState(false);
  const [showReplace, setShowReplace] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [matchCase, setMatchCase] = useState(false);
  const [fontFamily, setFontFamily] = useState('Consolas');
  const [fontSize, setFontSize] = useState(13);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [caretPos, setCaretPos] = useState({ line: 1, col: 1 });
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (filePath) {
      VirtualFS.readFile(filePath).then(c => {
        const text = c || '';
        setContent(text); setSavedContent(text);
      });
    } else if (initialContent !== undefined) {
      setContent(initialContent); setSavedContent(initialContent);
    }
  }, [filePath, initialContent]);

  const isDirty = content !== savedContent;

  const pushUndo = useCallback((prev: string) => {
    setUndoStack(s => [...s, prev].slice(-100));
    setRedoStack([]);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    pushUndo(content);
    setContent(e.target.value);
  };

  const undo = useCallback(() => {
    setUndoStack(s => {
      if (!s.length) return s;
      const prev = s[s.length - 1];
      setRedoStack(r => [...r, content]);
      setContent(prev);
      return s.slice(0, -1);
    });
  }, [content]);

  const redo = useCallback(() => {
    setRedoStack(s => {
      if (!s.length) return s;
      const next = s[s.length - 1];
      setUndoStack(r => [...r, content]);
      setContent(next);
      return s.slice(0, -1);
    });
  }, [content]);

  const updateCaret = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    const text = ta.value.substring(0, ta.selectionStart);
    const lines = text.split('\n');
    setCaretPos({ line: lines.length, col: lines[lines.length - 1].length + 1 });
  };

  const saveFile = useCallback(async (path?: string) => {
    const savePath = path || currentFile;
    if (!savePath) { saveAs(); return; }
    await VirtualFS.writeFile(savePath, content);
    setSavedContent(content);
    setCurrentFile(savePath);
  }, [content, currentFile]);

  const saveAs = useCallback(() => {
    const name = prompt('Save as:', 'Untitled.txt');
    if (!name) return;
    VirtualFS.createFile('C:\\Users\\User\\Documents', name, content);
    const path = `C:\\Users\\User\\Documents\\${name}`;
    setSavedContent(content); setCurrentFile(path);
  }, [content]);

  const openFile = async () => {
    const path = prompt('Open file path:', 'C:\\Users\\User\\Documents\\Welcome.txt');
    if (!path) return;
    const c = await VirtualFS.readFile(path);
    if (c !== null) { setContent(c); setSavedContent(c); setCurrentFile(path); }
    else alert('Cannot find file: ' + path);
  };

  const newFile = useCallback(() => {
    if (isDirty && !confirm('Discard unsaved changes?')) return;
    setContent(''); setSavedContent(''); setCurrentFile(null);
    setUndoStack([]); setRedoStack([]);
  }, [isDirty]);

  const findNext = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta || !findText) return;
    const text = matchCase ? content : content.toLowerCase();
    const query = matchCase ? findText : findText.toLowerCase();
    const start = ta.selectionEnd;
    const idx = text.indexOf(query, start);
    if (idx === -1) { alert(`Cannot find "${findText}"`); return; }
    ta.setSelectionRange(idx, idx + findText.length);
    ta.focus();
  }, [content, findText, matchCase]);

  const replaceAll = useCallback(() => {
    if (!findText) return;
    const flags = matchCase ? 'g' : 'gi';
    const regex = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
    pushUndo(content);
    setContent(c => c.replace(regex, replaceText));
  }, [findText, replaceText, matchCase, content, pushUndo]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!textareaRef.current?.matches(':focus') && document.activeElement !== textareaRef.current) {
        if (!(e.target instanceof HTMLTextAreaElement)) return;
      }
      if (e.ctrlKey) {
        if (e.key === 's') { e.preventDefault(); saveFile(); }
        if (e.key === 'n') { e.preventDefault(); newFile(); }
        if (e.key === 'f') { e.preventDefault(); setShowFind(true); setShowReplace(false); }
        if (e.key === 'h') { e.preventDefault(); setShowFind(true); setShowReplace(true); }
        if (e.key === 'z') { e.preventDefault(); undo(); }
        if (e.key === 'y') { e.preventDefault(); redo(); }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [saveFile, newFile, undo, redo]);

  const menus: Record<string, { label: string; action?: () => void; shortcut?: string; sep?: boolean; check?: boolean }[]> = {
    File: [
      { label: 'New', action: newFile, shortcut: 'Ctrl+N' },
      { sep: true, label: '' },
      { label: 'Open...', action: openFile, shortcut: 'Ctrl+O' },
      { sep: true, label: '' },
      { label: 'Save', action: () => saveFile(), shortcut: 'Ctrl+S' },
      { label: 'Save As...', action: saveAs },
      { sep: true, label: '' },
      { label: 'Print...', action: () => window.print() },
    ],
    Edit: [
      { label: 'Undo', action: undo, shortcut: 'Ctrl+Z' },
      { label: 'Redo', action: redo, shortcut: 'Ctrl+Y' },
      { sep: true, label: '' },
      { label: 'Find...', action: () => { setShowFind(true); setShowReplace(false); }, shortcut: 'Ctrl+F' },
      { label: 'Replace...', action: () => { setShowFind(true); setShowReplace(true); }, shortcut: 'Ctrl+H' },
      { sep: true, label: '' },
      { label: 'Select All', action: () => textareaRef.current?.select(), shortcut: 'Ctrl+A' },
      { label: 'Time/Date', action: () => { const now = new Date().toLocaleString(); const ta = textareaRef.current; if (ta) { const s = ta.selectionStart; const n = content.slice(0, s) + now + content.slice(ta.selectionEnd); pushUndo(content); setContent(n); } }, shortcut: 'F5' },
    ],
    Format: [
      { label: 'Word Wrap', action: () => setWordWrap(v => !v), check: wordWrap },
      { label: 'Font...', action: () => { const f = prompt('Font family:', fontFamily); if (f) setFontFamily(f); } },
    ],
    View: [
      { label: 'Status Bar', action: () => setShowStatusBar(v => !v), check: showStatusBar },
      { label: 'Zoom In', action: () => setFontSize(f => Math.min(48, f + 2)) },
      { label: 'Zoom Out', action: () => setFontSize(f => Math.max(6, f - 2)) },
      { label: 'Restore Zoom', action: () => setFontSize(13) },
    ],
    Help: [
      { label: 'About Notepad', action: () => alert('Error64 Notepad\nPart of Error64 OS') },
    ],
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff', userSelect: 'text' }}>
      {/* Menu Bar */}
      <div style={{ display: 'flex', background: '#f3f3f3', borderBottom: '1px solid #ddd', flexShrink: 0, fontSize: '13px' }}>
        {Object.entries(menus).map(([name, items]) => (
          <div key={name} style={{ position: 'relative' }}>
            <div
              onClick={() => setActiveMenu(activeMenu === name ? null : name)}
              onMouseEnter={() => { if (activeMenu && activeMenu !== name) setActiveMenu(name); }}
              style={{ padding: '4px 10px', cursor: 'default', background: activeMenu === name ? '#0078D4' : 'transparent', color: activeMenu === name ? '#fff' : '#000', userSelect: 'none' }}
            >{name}</div>
            {activeMenu === name && (
              <div style={{ position: 'absolute', left: 0, top: '100%', background: '#fff', border: '1px solid #ccc', boxShadow: '2px 4px 12px rgba(0,0,0,0.15)', zIndex: 9999, minWidth: '200px', padding: '2px 0' }}
                onMouseLeave={() => setActiveMenu(null)}>
                {items.map((item, i) => item.sep
                  ? <div key={i} style={{ height: '1px', background: '#e0e0e0', margin: '3px 0' }} />
                  : <div key={i} onClick={() => { setActiveMenu(null); item.action?.(); }}
                      style={{ padding: '5px 24px', display: 'flex', justifyContent: 'space-between', cursor: 'default', fontSize: '13px' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = '#0078D4'; (e.currentTarget as HTMLDivElement).style.color = '#fff'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = ''; (e.currentTarget as HTMLDivElement).style.color = ''; }}>
                      <span>{item.check !== undefined ? (item.check ? '✓ ' : '\u00a0\u00a0\u00a0') : ''}{item.label}</span>
                      {item.shortcut && <span style={{ opacity: 0.6, marginLeft: '20px', fontSize: '12px' }}>{item.shortcut}</span>}
                    </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Find/Replace bar */}
      {showFind && (
        <div style={{ background: '#f3f3f3', borderBottom: '1px solid #ddd', padding: '6px 12px', display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0, fontSize: '12px' }}>
          <input autoFocus placeholder="Find..." value={findText} onChange={e => setFindText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') findNext(); if (e.key === 'Escape') setShowFind(false); }}
            style={{ padding: '3px 8px', border: '1px solid #aaa', width: '150px' }} />
          {showReplace && <input placeholder="Replace with..." value={replaceText} onChange={e => setReplaceText(e.target.value)}
            style={{ padding: '3px 8px', border: '1px solid #aaa', width: '150px' }} />}
          <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <input type="checkbox" checked={matchCase} onChange={e => setMatchCase(e.target.checked)} /> Match case
          </label>
          <button onClick={findNext} style={{ padding: '3px 12px', cursor: 'pointer' }}>Find Next</button>
          {showReplace && <>
            <button onClick={replaceAll} style={{ padding: '3px 12px', cursor: 'pointer' }}>Replace All</button>
          </>}
          <button onClick={() => setShowFind(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', marginLeft: 'auto' }}>✕</button>
        </div>
      )}

      {/* Textarea */}
      <textarea ref={textareaRef} value={content} onChange={handleChange} onKeyUp={updateCaret} onClick={updateCaret}
        spellCheck style={{ flex: 1, resize: 'none', border: 'none', outline: 'none', padding: '8px',
          fontFamily, fontSize: `${fontSize}px`, lineHeight: 1.5, color: '#000', background: '#fff',
          whiteSpace: wordWrap ? 'pre-wrap' : 'pre', overflowX: wordWrap ? 'hidden' : 'auto', userSelect: 'text',
        }} />

      {/* Status bar */}
      {showStatusBar && (
        <div style={{ height: '22px', background: '#f3f3f3', borderTop: '1px solid #ddd', display: 'flex', alignItems: 'center', padding: '0 12px', gap: '24px', fontSize: '12px', color: '#555', flexShrink: 0 }}>
          <span>Ln {caretPos.line}, Col {caretPos.col}</span>
          <span>{content.length} chars</span>
          <span style={{ marginLeft: 'auto' }}>UTF-8</span>
          <span>Windows (CRLF)</span>
        </div>
      )}
    </div>
  );
}
