import { useState, useEffect, useCallback } from 'react';
import { VirtualFS, VFSNode } from '../os/VirtualFS';
import { useOS } from '../os/OSContext';
import { FluentIcon } from '../components/Window';
import { ContextMenu } from '../components/ContextMenu';

interface FileExplorerProps { initialPath?: string; }
type ViewMode = 'details' | 'large-icons' | 'medium-icons' | 'list';
type SortKey = 'name' | 'modified' | 'type' | 'size';

export function FileExplorer({ initialPath = 'C:\\Users\\User' }: FileExplorerProps) {
  const { openWindow } = useOS();
  const [path, setPath] = useState(initialPath);
  const [history, setHistory] = useState<string[]>([initialPath]);
  const [histIdx, setHistIdx] = useState(0);
  const [items, setItems] = useState<VFSNode[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [view, setView] = useState<ViewMode>('details');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortAsc, setSortAsc] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number; item?: VFSNode } | null>(null);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [addressEdit, setAddressEdit] = useState(false);
  const [addressValue, setAddressValue] = useState(path);
  const [clipboardItems, setClipboardItems] = useState<VFSNode[]>([]);
  const [clipMode, setClipMode] = useState<'copy' | 'cut'>('copy');

  const loadItems = useCallback(() => {
    const children = VirtualFS.getChildren(path, false);
    setItems(children);
    setSelected(new Set());
  }, [path]);

  useEffect(() => { loadItems(); }, [loadItems]);

  const navigate = (newPath: string) => {
    const node = VirtualFS.getNode(newPath);
    if (!node && newPath !== 'C:' && !VirtualFS.getChildren(newPath, true).length) return;
    setPath(newPath);
    setAddressValue(newPath);
    setHistory(h => [...h.slice(0, histIdx + 1), newPath]);
    setHistIdx(i => i + 1);
    setSelected(new Set());
  };

  const goBack = () => { if (histIdx > 0) { const p = history[histIdx - 1]; setPath(p); setAddressValue(p); setHistIdx(i => i - 1); } };
  const goForward = () => { if (histIdx < history.length - 1) { const p = history[histIdx + 1]; setPath(p); setAddressValue(p); setHistIdx(i => i + 1); } };
  const goUp = () => { const parent = path.split('\\').slice(0, -1).join('\\') || 'C:'; navigate(parent); };

  const sorted = [...items].filter(i => !searchQuery || i.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
      let cmp = 0;
      if (sortKey === 'name') cmp = a.name.localeCompare(b.name);
      else if (sortKey === 'modified') cmp = a.modified.localeCompare(b.modified);
      else if (sortKey === 'type') cmp = (a.extension || '').localeCompare(b.extension || '');
      else if (sortKey === 'size') cmp = a.size - b.size;
      return sortAsc ? cmp : -cmp;
    });

  const openItem = (item: VFSNode) => {
    if (item.type === 'folder') { navigate(item.path); return; }
    const ext = item.extension?.toLowerCase();
    if (ext === 'txt') openWindow('notepad', 'Notepad - ' + item.name, 'notepad', { filePath: item.path });
    else if (['png','jpg','jpeg','gif','webp'].includes(ext || '')) openWindow('photos', 'Photos', 'image');
    else if (['mp3','wav','ogg'].includes(ext || '')) openWindow('mediaplayer', 'Media Player', 'play_circle');
    else openWindow('notepad', 'Notepad', 'notepad', { filePath: item.path });
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(a => !a);
    else { setSortKey(key); setSortAsc(true); }
  };

  const newFolder = () => {
    const name = 'New Folder';
    VirtualFS.createFolder(path, name);
    loadItems();
    setTimeout(() => { setRenaming(`${path}\\${name}`); setRenameValue(name); }, 100);
  };

  const deleteSelected = () => {
    for (const p of selected) VirtualFS.delete(p);
    loadItems();
  };

  const copy = () => { setClipboardItems(sorted.filter(i => selected.has(i.path))); setClipMode('copy'); };
  const cut = () => { setClipboardItems(sorted.filter(i => selected.has(i.path))); setClipMode('cut'); };
  const paste = () => {
    for (const item of clipboardItems) {
      if (clipMode === 'cut') VirtualFS.move(item.path, path);
      else VirtualFS.createFile(path, item.name, '');
    }
    setClipboardItems([]);
    loadItems();
  };

  const quickAccess = [
    { name: 'Desktop', path: 'C:\\Users\\User\\Desktop', icon: 'desktop' },
    { name: 'Documents', path: 'C:\\Users\\User\\Documents', icon: 'document' },
    { name: 'Downloads', path: 'C:\\Users\\User\\Downloads', icon: 'arrow_download' },
    { name: 'Pictures', path: 'C:\\Users\\User\\Pictures', icon: 'image' },
    { name: 'Music', path: 'C:\\Users\\User\\Music', icon: 'music_note_1' },
    { name: 'Videos', path: 'C:\\Users\\User\\Videos', icon: 'video_clip' },
  ];

  const thisPC = [
    { name: 'C:\\', path: 'C:', icon: 'hard_drive' },
  ];

  const breadcrumbs = path.split('\\').filter(Boolean).reduce<{ label: string; path: string }[]>((acc, seg, i, arr) => {
    const p = arr.slice(0, i + 1).join('\\') || 'C:';
    acc.push({ label: seg, path: p });
    return acc;
  }, []);

  const itemContextItems = (item: VFSNode) => [
    { label: 'Open', onClick: () => openItem(item) },
    { separator: true },
    { label: 'Cut', onClick: () => { setSelected(new Set([item.path])); cut(); } },
    { label: 'Copy', onClick: () => { setSelected(new Set([item.path])); copy(); } },
    { separator: true },
    { label: 'Delete', onClick: () => { VirtualFS.delete(item.path); loadItems(); } },
    { label: 'Rename', onClick: () => { setRenaming(item.path); setRenameValue(item.name); } },
    { separator: true },
    { label: 'Properties', onClick: () => {} },
  ];

  const bgContextItems = [
    { label: 'View', submenu: [
      { label: 'Large Icons', onClick: () => setView('large-icons') },
      { label: 'Medium Icons', onClick: () => setView('medium-icons') },
      { label: 'Details', onClick: () => setView('details') },
      { label: 'List', onClick: () => setView('list') },
    ]},
    { label: 'Sort by', submenu: [
      { label: 'Name', onClick: () => handleSort('name') },
      { label: 'Date modified', onClick: () => handleSort('modified') },
      { label: 'Type', onClick: () => handleSort('type') },
      { label: 'Size', onClick: () => handleSort('size') },
    ]},
    { separator: true },
    { label: 'New Folder', onClick: newFolder },
    { separator: true },
    { label: 'Paste', onClick: paste },
    { separator: true },
    { label: 'Properties', onClick: () => {} },
  ];

  const fmtSize = (n: number) => n === 0 ? '' : n < 1024 ? `${n} B` : n < 1048576 ? `${(n/1024).toFixed(1)} KB` : `${(n/1048576).toFixed(1)} MB`;
  const fmtDate = (s: string) => new Date(s).toLocaleDateString();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff', userSelect: 'none' }}>
      {/* Ribbon toolbar */}
      <div style={{ background: '#f3f3f3', borderBottom: '1px solid #ddd', padding: '6px 8px', display: 'flex', gap: '4px', flexShrink: 0, flexWrap: 'wrap' }}>
        {[
          { label: 'New Folder', icon: 'folder_add', action: newFolder },
          { label: 'Cut', icon: 'cut', action: cut },
          { label: 'Copy', icon: 'copy', action: copy },
          { label: 'Paste', icon: 'clipboard_paste', action: paste },
          { label: 'Rename', icon: 'rename', action: () => { const sel = sorted.find(i => selected.has(i.path)); if (sel) { setRenaming(sel.path); setRenameValue(sel.name); } } },
          { label: 'Delete', icon: 'delete', action: deleteSelected },
        ].map(b => (
          <button key={b.label} onClick={b.action} title={b.label}
            style={{ padding: '4px 8px', background: 'transparent', border: '1px solid transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#e0e0e0', e.currentTarget.style.borderColor = '#ccc')}
            onMouseLeave={e => (e.currentTarget.style.background = '', e.currentTarget.style.borderColor = 'transparent')}
          >
            <FluentIcon name={b.icon} size={16} />
            {b.label}
          </button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '4px' }}>
          {(['large-icons','medium-icons','details','list'] as ViewMode[]).map(v => (
            <button key={v} onClick={() => setView(v)} title={v}
              style={{ padding: '4px 6px', background: view === v ? '#d0d0d0' : 'transparent', border: '1px solid', borderColor: view === v ? '#aaa' : 'transparent', cursor: 'pointer', fontSize: '11px' }}>
              {v === 'details' ? '☰' : v === 'large-icons' ? '⊞' : v === 'medium-icons' ? '⊟' : '≡'}
            </button>
          ))}
        </div>
      </div>

      {/* Address bar */}
      <div style={{ background: '#fff', borderBottom: '1px solid #ddd', padding: '4px 8px', display: 'flex', gap: '4px', alignItems: 'center', flexShrink: 0 }}>
        <button onClick={goBack} disabled={histIdx === 0} title="Back" style={{ background: 'none', border: 'none', cursor: histIdx > 0 ? 'pointer' : 'default', opacity: histIdx > 0 ? 1 : 0.4, fontSize: '14px' }}>←</button>
        <button onClick={goForward} disabled={histIdx === history.length - 1} title="Forward" style={{ background: 'none', border: 'none', cursor: histIdx < history.length - 1 ? 'pointer' : 'default', opacity: histIdx < history.length - 1 ? 1 : 0.4, fontSize: '14px' }}>→</button>
        <button onClick={goUp} title="Up" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}>↑</button>

        {addressEdit ? (
          <input autoFocus value={addressValue} onChange={e => setAddressValue(e.target.value)}
            onBlur={() => { navigate(addressValue); setAddressEdit(false); }}
            onKeyDown={e => { if (e.key === 'Enter') { navigate(addressValue); setAddressEdit(false); } if (e.key === 'Escape') setAddressEdit(false); }}
            style={{ flex: 1, padding: '3px 8px', border: '1px solid #0078D4', outline: 'none', fontSize: '13px' }} />
        ) : (
          <div onClick={() => setAddressEdit(true)} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '2px', padding: '3px 8px', border: '1px solid #ddd', cursor: 'text', fontSize: '13px', overflow: 'hidden' }}>
            <FluentIcon name="folder" size={14} />
            {breadcrumbs.map((b, i) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '2px', whiteSpace: 'nowrap' }}>
                {i > 0 && <span style={{ opacity: 0.4 }}>&rsaquo;</span>}
                <span onClick={(e) => { e.stopPropagation(); navigate(b.path); }}
                  style={{ cursor: 'pointer', padding: '0 3px' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#e8f0fe')}
                  onMouseLeave={e => (e.currentTarget.style.background = '')}
                >{b.label}</span>
              </span>
            ))}
          </div>
        )}

        <button onClick={loadItems} title="Refresh" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}>↻</button>

        <input placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
          style={{ width: '160px', padding: '3px 8px', border: '1px solid #ddd', fontSize: '13px', outline: 'none' }} />
      </div>

      {/* Main area */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        <div style={{ width: '180px', borderRight: '1px solid #ddd', overflowY: 'auto', background: '#f8f8f8', flexShrink: 0, padding: '8px 0' }}>
          <SideSection title="Quick Access">
            {quickAccess.map(a => (
              <SideItem key={a.path} label={a.name} icon={a.icon} active={path === a.path} onClick={() => navigate(a.path)} />
            ))}
          </SideSection>
          <SideSection title="This PC">
            {thisPC.map(a => (
              <SideItem key={a.path} label={a.name} icon={a.icon} active={path === a.path} onClick={() => navigate(a.path)} />
            ))}
          </SideSection>
          <SideSection title="Network">
            <SideItem label="Network" icon="network_check" onClick={() => {}} />
          </SideSection>
          <SideSection title="">
            <SideItem label="Recycle Bin" icon="delete" active={path === 'C:\\Recycle Bin'} onClick={() => navigate('C:\\Recycle Bin')} />
          </SideSection>
        </div>

        {/* Content */}
        <div
          style={{ flex: 1, overflow: 'auto', padding: view === 'details' ? '0' : '12px' }}
          onClick={() => setSelected(new Set())}
          onContextMenu={e => { e.preventDefault(); setCtxMenu({ x: e.clientX, y: e.clientY }); }}
        >
          {view === 'details' ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f3f3f3', position: 'sticky', top: 0 }}>
                  {(['name','modified','type','size'] as SortKey[]).map(k => (
                    <th key={k} onClick={() => handleSort(k)} style={{ padding: '6px 12px', textAlign: 'left', cursor: 'pointer', fontWeight: 500, borderBottom: '1px solid #ddd', whiteSpace: 'nowrap' }}>
                      {k.charAt(0).toUpperCase() + k.slice(1).replace('_', ' ')} {sortKey === k ? (sortAsc ? '▲' : '▼') : ''}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map(item => (
                  <tr key={item.path}
                    onMouseEnter={e => (e.currentTarget.style.background = '#e8f0fe')}
                    onMouseLeave={e => (e.currentTarget.style.background = selected.has(item.path) ? '#d0e4ff' : '')}
                    style={{ background: selected.has(item.path) ? '#d0e4ff' : '', cursor: 'default' }}
                    onClick={e => { e.stopPropagation(); if (e.ctrlKey) { const s = new Set(selected); s.has(item.path) ? s.delete(item.path) : s.add(item.path); setSelected(s); } else setSelected(new Set([item.path])); }}
                    onDoubleClick={() => openItem(item)}
                    onContextMenu={e => { e.preventDefault(); e.stopPropagation(); setSelected(new Set([item.path])); setCtxMenu({ x: e.clientX, y: e.clientY, item }); }}
                  >
                    <td style={{ padding: '5px 12px', display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}>
                      {renaming === item.path ? (
                        <input autoFocus value={renameValue} onChange={e => setRenameValue(e.target.value)}
                          onBlur={() => { if (renameValue.trim() !== item.name) VirtualFS.rename(item.path, renameValue.trim()); loadItems(); setRenaming(null); }}
                          onKeyDown={e => { if (e.key === 'Enter') { VirtualFS.rename(item.path, renameValue.trim()); loadItems(); setRenaming(null); } if (e.key === 'Escape') setRenaming(null); e.stopPropagation(); }}
                          onClick={e => e.stopPropagation()}
                          style={{ border: '1px solid #0078D4', padding: '1px 4px', fontSize: '13px', outline: 'none', width: '160px' }} />
                      ) : (
                        <>
                          <FluentIcon name={item.type === 'folder' ? 'folder' : (item.extension === 'txt' ? 'document' : 'document_bullet_list')} size={16} />
                          {item.name}
                        </>
                      )}
                    </td>
                    <td style={{ padding: '5px 12px', color: '#555', whiteSpace: 'nowrap' }}>{fmtDate(item.modified)}</td>
                    <td style={{ padding: '5px 12px', color: '#555', whiteSpace: 'nowrap' }}>{item.type === 'folder' ? 'File folder' : `${item.extension?.toUpperCase() || ''} File`}</td>
                    <td style={{ padding: '5px 12px', color: '#555', whiteSpace: 'nowrap' }}>{fmtSize(item.size)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {sorted.map(item => {
                const iconSize = view === 'large-icons' ? 48 : 32;
                return (
                  <div key={item.path}
                    onClick={e => { e.stopPropagation(); setSelected(new Set([item.path])); }}
                    onDoubleClick={() => openItem(item)}
                    onContextMenu={e => { e.preventDefault(); e.stopPropagation(); setSelected(new Set([item.path])); setCtxMenu({ x: e.clientX, y: e.clientY, item }); }}
                    style={{
                      width: view === 'large-icons' ? '90px' : view === 'list' ? '160px' : '80px',
                      display: 'flex', flexDirection: view === 'list' ? 'row' : 'column',
                      alignItems: view === 'list' ? 'center' : 'center', gap: '4px',
                      padding: '6px', cursor: 'default', fontSize: '12px', textAlign: 'center',
                      background: selected.has(item.path) ? '#d0e4ff' : 'transparent',
                    }}
                  >
                    <FluentIcon name={item.type === 'folder' ? 'folder' : 'document'} size={iconSize} />
                    <span style={{ wordBreak: 'break-word', fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{item.name}</span>
                  </div>
                );
              })}
            </div>
          )}
          {sorted.length === 0 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', opacity: 0.5, fontSize: '13px' }}>
              This folder is empty
            </div>
          )}
        </div>
      </div>

      {/* Status bar */}
      <div style={{ height: '22px', background: '#f3f3f3', borderTop: '1px solid #ddd', display: 'flex', alignItems: 'center', padding: '0 12px', gap: '12px', fontSize: '12px', color: '#555', flexShrink: 0 }}>
        <span>{sorted.length} items</span>
        {selected.size > 0 && <span>{selected.size} selected</span>}
      </div>

      {ctxMenu && (
        <ContextMenu x={ctxMenu.x} y={ctxMenu.y}
          items={ctxMenu.item ? itemContextItems(ctxMenu.item) : bgContextItems}
          onClose={() => setCtxMenu(null)} />
      )}
    </div>
  );
}

function SideSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '4px' }}>
      {title && <div style={{ padding: '6px 12px 2px', fontSize: '11px', fontWeight: 600, color: '#555', userSelect: 'none' }}>{title}</div>}
      {children}
    </div>
  );
}

function SideItem({ label, icon, active, onClick }: { label: string; icon: string; active?: boolean; onClick: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 16px', cursor: 'pointer', fontSize: '13px', background: active ? '#d0e4ff' : hover ? '#e8e8e8' : 'transparent' }}>
      <FluentIcon name={icon} size={16} />
      {label}
    </div>
  );
}
