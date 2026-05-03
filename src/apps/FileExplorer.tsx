import { useState, useEffect, useCallback } from 'react';
import { VirtualFS, VFSNode } from '../os/VirtualFS';
import { useOS } from '../os/OSContext';
import { ContextMenu } from '../components/ContextMenu';
import { FluentIcon } from '../components/Window';

interface FileExplorerProps {
  initialPath?: string;
}

type ViewMode = 'details' | 'large-icons' | 'medium-icons' | 'list';
type SortKey = 'name' | 'modified' | 'type' | 'size';
type RibbonTab = 'File' | 'Home' | 'Share' | 'View';

const VIEW_OPTIONS: { mode: ViewMode; label: string; icon: string }[] = [
  { mode: 'details', label: 'Details', icon: 'document_bullet_list' },
  { mode: 'large-icons', label: 'Large icons', icon: 'layout_grid' },
  { mode: 'medium-icons', label: 'Medium icons', icon: 'apps_list' },
  { mode: 'list', label: 'List', icon: 'list' },
];

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
  const [ribbonTab, setRibbonTab] = useState<RibbonTab>('Home');

  const loadItems = useCallback(() => {
    const children = VirtualFS.getChildren(path, false);
    setItems(children);
    setSelected(new Set());
  }, [path]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const navigate = (newPath: string) => {
    const node = VirtualFS.getNode(newPath);
    if (!node && newPath !== 'C:' && !VirtualFS.getChildren(newPath, true).length) return;
    setPath(newPath);
    setAddressValue(newPath);
    setHistory((value) => [...value.slice(0, histIdx + 1), newPath]);
    setHistIdx((value) => value + 1);
    setSelected(new Set());
  };

  const goBack = () => {
    if (histIdx <= 0) return;
    const previousPath = history[histIdx - 1];
    setPath(previousPath);
    setAddressValue(previousPath);
    setHistIdx((value) => value - 1);
    setSelected(new Set());
  };

  const goForward = () => {
    if (histIdx >= history.length - 1) return;
    const nextPath = history[histIdx + 1];
    setPath(nextPath);
    setAddressValue(nextPath);
    setHistIdx((value) => value + 1);
    setSelected(new Set());
  };

  const goUp = () => {
    const parent = path.split('\\').slice(0, -1).join('\\') || 'C:';
    navigate(parent);
  };

  const sorted = [...items]
    .filter((item) => !searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
      let cmp = 0;
      if (sortKey === 'name') cmp = a.name.localeCompare(b.name);
      else if (sortKey === 'modified') cmp = a.modified.localeCompare(b.modified);
      else if (sortKey === 'type') cmp = (a.extension || '').localeCompare(b.extension || '');
      else if (sortKey === 'size') cmp = a.size - b.size;
      return sortAsc ? cmp : -cmp;
    });

  const getItemIcon = (item: VFSNode) => {
    if (item.type === 'folder') return 'folder';
    const ext = item.extension?.toLowerCase();
    if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext || '')) return 'image';
    if (['mp3', 'wav', 'ogg'].includes(ext || '')) return 'music_note_1';
    if (['mp4', 'mov', 'mkv', 'webm'].includes(ext || '')) return 'video_clip';
    if (['txt', 'md', 'log'].includes(ext || '')) return 'document';
    return 'document_bullet_list';
  };

  const openItem = (item: VFSNode) => {
    if (item.type === 'folder') {
      navigate(item.path);
      return;
    }
    const ext = item.extension?.toLowerCase();
    if (ext === 'txt') openWindow('notepad', `Notepad - ${item.name}`, 'notepad', { filePath: item.path });
    else if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext || '')) openWindow('photos', 'Photos', 'image');
    else if (['mp3', 'wav', 'ogg'].includes(ext || '')) openWindow('mediaplayer', 'Media Player', 'play_circle');
    else openWindow('notepad', 'Notepad', 'notepad', { filePath: item.path });
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc((value) => !value);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const newFolder = () => {
    const name = 'New Folder';
    VirtualFS.createFolder(path, name);
    loadItems();
    setTimeout(() => {
      setRenaming(`${path}\\${name}`);
      setRenameValue(name);
    }, 80);
  };

  const deleteSelected = () => {
    for (const selectedPath of selected) VirtualFS.delete(selectedPath);
    loadItems();
  };

  const copy = () => {
    setClipboardItems(sorted.filter((item) => selected.has(item.path)));
    setClipMode('copy');
  };

  const cut = () => {
    setClipboardItems(sorted.filter((item) => selected.has(item.path)));
    setClipMode('cut');
  };

  const paste = () => {
    for (const item of clipboardItems) {
      if (clipMode === 'cut') VirtualFS.move(item.path, path);
      else VirtualFS.createFile(path, item.name, '');
    }
    setClipboardItems([]);
    loadItems();
  };

  const quickAccess = [
    { name: 'Desktop', path: 'C:\\Users\\User\\Desktop', icon: 'desktop_pc' },
    { name: 'Documents', path: 'C:\\Users\\User\\Documents', icon: 'document' },
    { name: 'Downloads', path: 'C:\\Users\\User\\Downloads', icon: 'arrow_download' },
    { name: 'Pictures', path: 'C:\\Users\\User\\Pictures', icon: 'image' },
    { name: 'Music', path: 'C:\\Users\\User\\Music', icon: 'music_note_1' },
    { name: 'Videos', path: 'C:\\Users\\User\\Videos', icon: 'video_clip' },
  ];

  const systemLocations = [
    { name: 'This PC', path: 'C:', icon: 'hard_drive' },
    { name: 'Network', path: 'C:\\Network', icon: 'network_check', disabled: true },
    { name: 'Recycle Bin', path: 'C:\\Recycle Bin', icon: 'delete' },
  ];

  const breadcrumbs = path.split('\\').filter(Boolean).reduce<{ label: string; path: string }[]>((acc, segment, index, all) => {
    const nextPath = all.slice(0, index + 1).join('\\') || 'C:';
    acc.push({ label: segment, path: nextPath });
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
    {
      label: 'View',
      submenu: VIEW_OPTIONS.map((option) => ({ label: option.label, onClick: () => setView(option.mode) })),
    },
    {
      label: 'Sort by',
      submenu: [
        { label: 'Name', onClick: () => handleSort('name') },
        { label: 'Date modified', onClick: () => handleSort('modified') },
        { label: 'Type', onClick: () => handleSort('type') },
        { label: 'Size', onClick: () => handleSort('size') },
      ],
    },
    { separator: true },
    { label: 'New Folder', onClick: newFolder },
    { separator: true },
    { label: 'Paste', onClick: paste, disabled: clipboardItems.length === 0 },
    { separator: true },
    { label: 'Properties', onClick: () => {} },
  ];

  const fmtSize = (value: number) => {
    if (value === 0) return '';
    if (value < 1024) return `${value} B`;
    if (value < 1048576) return `${(value / 1024).toFixed(1)} KB`;
    return `${(value / 1048576).toFixed(1)} MB`;
  };

  const fmtDate = (value: string) =>
    new Date(value).toLocaleString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#ffffff', color: '#111827' }}>
      <div style={{ borderBottom: '1px solid #d0d6de', background: 'linear-gradient(180deg, #f7f7f7 0%, #f0f0f0 100%)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', padding: '0 12px', minHeight: '31px', borderBottom: '1px solid #dadada' }}>
          {(['File', 'Home', 'Share', 'View'] as RibbonTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setRibbonTab(tab)}
              style={{
                border: 'none',
                background: ribbonTab === tab ? '#ffffff' : 'transparent',
                borderTop: ribbonTab === tab ? '2px solid #0078d7' : '2px solid transparent',
                borderLeft: ribbonTab === tab ? '1px solid #d0d0d0' : '1px solid transparent',
                borderRight: ribbonTab === tab ? '1px solid #d0d0d0' : '1px solid transparent',
                borderBottom: ribbonTab === tab ? '1px solid #ffffff' : '1px solid transparent',
                cursor: 'pointer',
                fontSize: '12px',
                color: '#202020',
                padding: '7px 14px 6px',
                marginBottom: '-1px',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'stretch', gap: '14px', padding: '8px 12px 10px', minHeight: '92px' }}>
          {ribbonTab === 'Home' && (
            <>
              <ExplorerActionGroup label="Clipboard">
                <RibbonButton label="Paste" icon="clipboard_paste" onClick={paste} large disabled={clipboardItems.length === 0} />
                <RibbonButton label="Cut" icon="cut" onClick={cut} />
                <RibbonButton label="Copy" icon="copy" onClick={copy} />
              </ExplorerActionGroup>

              <ExplorerActionGroup label="Organize">
                <RibbonButton label="New folder" icon="folder_add" onClick={newFolder} />
                <RibbonButton
                  label="Rename"
                  icon="rename"
                  onClick={() => {
                    const target = sorted.find((item) => selected.has(item.path));
                    if (target) {
                      setRenaming(target.path);
                      setRenameValue(target.name);
                    }
                  }}
                  disabled={selected.size !== 1}
                />
                <RibbonButton label="Delete" icon="delete" onClick={deleteSelected} disabled={selected.size === 0} />
              </ExplorerActionGroup>

              <ExplorerActionGroup label="Open">
                <RibbonButton
                  label="Open"
                  icon="folder_open"
                  onClick={() => {
                    const target = sorted.find((item) => selected.has(item.path));
                    if (target) openItem(target);
                  }}
                  disabled={selected.size !== 1}
                />
                <RibbonButton label="Properties" icon="info" onClick={() => {}} />
              </ExplorerActionGroup>
            </>
          )}

          {ribbonTab === 'Share' && (
            <>
              <ExplorerActionGroup label="Send">
                <RibbonButton label="E-mail" icon="mail" onClick={() => openWindow('mail', 'Mail', 'mail')} />
                <RibbonButton label="Copy path" icon="copy" onClick={() => navigator.clipboard?.writeText(path)} />
              </ExplorerActionGroup>
              <ExplorerActionGroup label="Archive">
                <RibbonButton label="Zip" icon="folder" onClick={() => {}} />
              </ExplorerActionGroup>
            </>
          )}

          {ribbonTab === 'View' && (
            <>
              <ExplorerActionGroup label="Layout">
                {VIEW_OPTIONS.map((option) => (
                  <RibbonButton key={option.mode} label={option.label} icon={option.icon} onClick={() => setView(option.mode)} active={view === option.mode} />
                ))}
              </ExplorerActionGroup>
              <ExplorerActionGroup label="Sort">
                <RibbonButton label="Name" icon="text_font" onClick={() => handleSort('name')} active={sortKey === 'name'} />
                <RibbonButton label="Date" icon="clock" onClick={() => handleSort('modified')} active={sortKey === 'modified'} />
                <RibbonButton label="Type" icon="document" onClick={() => handleSort('type')} active={sortKey === 'type'} />
              </ExplorerActionGroup>
            </>
          )}

          {ribbonTab === 'File' && (
            <>
              <ExplorerActionGroup label="Window">
                <RibbonButton label="Open new window" icon="folder_open" onClick={() => openWindow('explorer', 'File Explorer', 'folder', { path })} large />
              </ExplorerActionGroup>
              <ExplorerActionGroup label="File">
                <RibbonButton label="Close" icon="close" onClick={() => {}} />
              </ExplorerActionGroup>
            </>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 12px 10px' }}>
          <div style={{ display: 'flex', gap: '1px', alignItems: 'center' }}>
            <button onClick={goBack} disabled={histIdx === 0} title="Back" style={{ ...smallIconButton, opacity: histIdx === 0 ? 0.45 : 1 }}>
              <FluentIcon name="arrow_left" size={15} color="#334155" />
            </button>
            <button onClick={goForward} disabled={histIdx >= history.length - 1} title="Forward" style={{ ...smallIconButton, opacity: histIdx >= history.length - 1 ? 0.45 : 1 }}>
              <FluentIcon name="arrow_right" size={15} color="#334155" />
            </button>
            <button onClick={goUp} title="Up" style={smallIconButton}>
              <FluentIcon name="arrow_up" size={15} color="#334155" />
            </button>
            <button onClick={loadItems} title="Refresh" style={smallIconButton}>
              <FluentIcon name="refresh" size={15} color="#334155" />
            </button>
          </div>

          {addressEdit ? (
            <input
              autoFocus
              value={addressValue}
              onChange={(event) => setAddressValue(event.target.value)}
              onBlur={() => {
                navigate(addressValue);
                setAddressEdit(false);
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  navigate(addressValue);
                  setAddressEdit(false);
                }
                if (event.key === 'Escape') {
                  setAddressEdit(false);
                  setAddressValue(path);
                }
              }}
              style={{ flex: 1, minHeight: '32px', border: '1px solid #5b9dd9', outline: 'none', padding: '0 10px', fontSize: '12px', background: '#ffffff' }}
            />
          ) : (
            <button
              onClick={() => setAddressEdit(true)}
              style={{
                flex: 1,
                minHeight: '32px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '0 8px',
                border: '1px solid #c5cbd3',
                background: '#ffffff',
                cursor: 'text',
                overflow: 'hidden',
              }}
            >
              <FluentIcon name="folder" size={15} color="#f59e0b" />
              <span
                onClick={(event) => {
                  event.stopPropagation();
                  navigate('C:');
                }}
                style={crumbStyle}
              >
                This PC
              </span>
              {breadcrumbs.map((crumb) => (
                <span key={crumb.path} style={{ display: 'flex', alignItems: 'center', gap: '4px', minWidth: 0 }}>
                  <FluentIcon name="chevron_right" size={13} color="#94a3b8" />
                  <span
                    onClick={(event) => {
                      event.stopPropagation();
                      navigate(crumb.path);
                    }}
                    style={crumbStyle}
                  >
                    {crumb.label}
                  </span>
                </span>
              ))}
            </button>
          )}

          <div style={{ width: '250px', minWidth: '180px', display: 'flex', alignItems: 'center', gap: '8px', background: '#ffffff', border: '1px solid #c5cbd3', padding: '0 10px', minHeight: '32px' }}>
            <FluentIcon name="search" size={14} color="#64748b" />
            <input
              placeholder="Search current folder"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: '12px' }}
            />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <div style={{ width: '230px', borderRight: '1px solid #d6dbe3', background: '#f5f6f8', overflowY: 'auto', flexShrink: 0, padding: '10px 0 14px' }}>
          <SidebarSection title="Quick access">
            {quickAccess.map((entry) => (
              <SidebarItem key={entry.path} label={entry.name} icon={entry.icon} active={path === entry.path} onClick={() => navigate(entry.path)} />
            ))}
          </SidebarSection>
          <SidebarSection title="Devices and drives">
            {systemLocations.map((entry) => (
              <SidebarItem key={entry.path} label={entry.name} icon={entry.icon} active={path === entry.path} disabled={entry.disabled} onClick={() => !entry.disabled && navigate(entry.path)} />
            ))}
          </SidebarSection>
        </div>

        <div
          style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: '#ffffff' }}
          onClick={() => setSelected(new Set())}
          onContextMenu={(event) => {
            event.preventDefault();
            setCtxMenu({ x: event.clientX, y: event.clientY });
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px 10px', borderBottom: '1px solid #e5e7eb', background: '#ffffff', flexShrink: 0 }}>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 300, color: '#111827' }}>{breadcrumbs[breadcrumbs.length - 1]?.label || 'This PC'}</div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '3px' }}>{sorted.length} item{sorted.length === 1 ? '' : 's'}</div>
            </div>
            {selected.size > 0 && (
              <div style={{ fontSize: '12px', color: '#1d4ed8', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '5px 10px' }}>
                {selected.size} selected
              </div>
            )}
          </div>

          <div style={{ flex: 1, overflow: 'auto', background: '#ffffff' }}>
            {view === 'details' ? (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ background: '#f5f7fa', position: 'sticky', top: 0, zIndex: 1 }}>
                    {([
                      { key: 'name', label: 'Name', width: '48%' },
                      { key: 'modified', label: 'Date modified', width: '24%' },
                      { key: 'type', label: 'Type', width: '18%' },
                      { key: 'size', label: 'Size', width: '10%' },
                    ] as { key: SortKey; label: string; width: string }[]).map((column) => (
                      <th
                        key={column.key}
                        onClick={() => handleSort(column.key)}
                        style={{ padding: '7px 12px', textAlign: 'left', cursor: 'pointer', fontWeight: 400, borderBottom: '1px solid #dde3ea', color: '#475569', width: column.width }}
                      >
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          {column.label}
                          {sortKey === column.key && <FluentIcon name={sortAsc ? 'chevron_up' : 'chevron_down'} size={13} color="#2563eb" />}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((item) => {
                    const isSelected = selected.has(item.path);

                    return (
                      <tr
                        key={item.path}
                        style={{ background: isSelected ? '#cce8ff' : 'transparent', cursor: 'default' }}
                        onMouseEnter={(event) => {
                          if (!isSelected) event.currentTarget.style.background = '#f3f9ff';
                        }}
                        onMouseLeave={(event) => {
                          event.currentTarget.style.background = isSelected ? '#cce8ff' : 'transparent';
                        }}
                        onClick={(event) => {
                          event.stopPropagation();
                          if (event.ctrlKey) {
                            const next = new Set(selected);
                            if (next.has(item.path)) next.delete(item.path);
                            else next.add(item.path);
                            setSelected(next);
                          } else {
                            setSelected(new Set([item.path]));
                          }
                        }}
                        onDoubleClick={() => openItem(item)}
                        onContextMenu={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          setSelected(new Set([item.path]));
                          setCtxMenu({ x: event.clientX, y: event.clientY, item });
                        }}
                      >
                        <td style={{ padding: '7px 12px', borderBottom: '1px solid #f1f3f6' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                            <FluentIcon name={getItemIcon(item)} size={18} color={item.type === 'folder' ? '#eab308' : '#2563eb'} />
                            {renaming === item.path ? (
                              <input
                                autoFocus
                                value={renameValue}
                                onChange={(event) => setRenameValue(event.target.value)}
                                onBlur={() => {
                                  if (renameValue.trim() && renameValue.trim() !== item.name) VirtualFS.rename(item.path, renameValue.trim());
                                  loadItems();
                                  setRenaming(null);
                                }}
                                onKeyDown={(event) => {
                                  if (event.key === 'Enter') {
                                    if (renameValue.trim()) VirtualFS.rename(item.path, renameValue.trim());
                                    loadItems();
                                    setRenaming(null);
                                  }
                                  if (event.key === 'Escape') setRenaming(null);
                                  event.stopPropagation();
                                }}
                                onClick={(event) => event.stopPropagation()}
                                style={{ border: '1px solid #5b9dd9', outline: 'none', padding: '2px 6px', fontSize: '12px', width: '220px' }}
                              />
                            ) : (
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '7px 12px', color: '#475569', borderBottom: '1px solid #f1f3f6' }}>{fmtDate(item.modified)}</td>
                        <td style={{ padding: '7px 12px', color: '#475569', borderBottom: '1px solid #f1f3f6' }}>{item.type === 'folder' ? 'File folder' : `${item.extension?.toUpperCase() || ''} File`}</td>
                        <td style={{ padding: '7px 12px', color: '#475569', borderBottom: '1px solid #f1f3f6' }}>{fmtSize(item.size)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', padding: '14px' }}>
                {sorted.map((item) => {
                  const iconSize = view === 'large-icons' ? 40 : 28;
                  const isSelected = selected.has(item.path);
                  const cardWidth = view === 'large-icons' ? 122 : view === 'list' ? 240 : 104;

                  return (
                    <div
                      key={item.path}
                      onClick={(event) => {
                        event.stopPropagation();
                        setSelected(new Set([item.path]));
                      }}
                      onDoubleClick={() => openItem(item)}
                      onContextMenu={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        setSelected(new Set([item.path]));
                        setCtxMenu({ x: event.clientX, y: event.clientY, item });
                      }}
                      style={{
                        width: cardWidth,
                        minHeight: view === 'list' ? '46px' : '98px',
                        display: 'flex',
                        flexDirection: view === 'list' ? 'row' : 'column',
                        alignItems: 'center',
                        justifyContent: view === 'list' ? 'flex-start' : 'center',
                        gap: '8px',
                        padding: '10px',
                        cursor: 'default',
                        textAlign: view === 'list' ? 'left' : 'center',
                        background: isSelected ? '#cce8ff' : 'transparent',
                        outline: isSelected ? '1px solid #7bb7f0' : '1px solid transparent',
                      }}
                    >
                      <FluentIcon name={getItemIcon(item)} size={iconSize} color={item.type === 'folder' ? '#d97706' : '#2563eb'} />
                      <span style={{ fontSize: '12px', color: '#0f172a', wordBreak: 'break-word', display: '-webkit-box', WebkitLineClamp: view === 'list' ? 1 : 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {item.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {sorted.length === 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '12px', color: '#94a3b8', minHeight: '220px' }}>
                <FluentIcon name="folder_open" size={44} color="#94a3b8" />
                <div style={{ fontSize: '15px', fontWeight: 600, color: '#64748b' }}>This folder is empty</div>
                <div style={{ fontSize: '13px' }}>Create a folder or drop files here later.</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ height: '24px', background: '#f3f3f3', borderTop: '1px solid #d0d6de', display: 'flex', alignItems: 'center', padding: '0 12px', gap: '14px', fontSize: '11px', color: '#475569', flexShrink: 0 }}>
        <span>{sorted.length} item{sorted.length === 1 ? '' : 's'}</span>
        {selected.size > 0 && <span>{selected.size} selected</span>}
        <span style={{ marginLeft: 'auto' }}>{path}</span>
      </div>

      {ctxMenu && (
        <ContextMenu
          x={ctxMenu.x}
          y={ctxMenu.y}
          items={ctxMenu.item ? itemContextItems(ctxMenu.item) : bgContextItems}
          onClose={() => setCtxMenu(null)}
        />
      )}
    </div>
  );
}

function ExplorerActionGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'stretch', gap: '8px', paddingRight: '14px', borderRight: '1px solid #d9dde2' }}>
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>{children}</div>
      <div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', fontSize: '11px', color: '#6b7280', letterSpacing: '0.03em' }}>{label}</div>
    </div>
  );
}

function RibbonButton({ label, icon, onClick, disabled, active, large }: { label: string; icon: string; onClick: () => void; disabled?: boolean; active?: boolean; large?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        minWidth: large ? '76px' : '62px',
        minHeight: large ? '68px' : '54px',
        border: `1px solid ${active ? '#7bb7f0' : '#d6dbe3'}`,
        background: disabled ? '#fafafa' : active ? '#eaf4ff' : '#ffffff',
        color: disabled ? '#9ca3af' : '#1e293b',
        cursor: disabled ? 'default' : 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        fontSize: '11px',
        padding: '6px 8px',
      }}
    >
      <FluentIcon name={icon} size={large ? 22 : 18} color={disabled ? '#9ca3af' : active ? '#1d4ed8' : '#2563eb'} />
      <span>{label}</span>
    </button>
  );
}

function SidebarSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ padding: '6px 14px', fontSize: '11px', fontWeight: 600, color: '#6b7280' }}>{title}</div>
      {children}
    </div>
  );
}

function SidebarItem({ label, icon, active, onClick, disabled }: { label: string; icon: string; active?: boolean; onClick: () => void; disabled?: boolean }) {
  const [hover, setHover] = useState(false);

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '7px 14px',
        border: 'none',
        borderLeft: active ? '3px solid #0078d7' : '3px solid transparent',
        background: active ? '#dbeefe' : hover && !disabled ? '#ebf3fb' : 'transparent',
        color: disabled ? '#94a3b8' : '#1e293b',
        cursor: disabled ? 'default' : 'pointer',
        fontSize: '12px',
        textAlign: 'left',
      }}
    >
      <FluentIcon name={icon} size={16} color={active ? '#2563eb' : disabled ? '#94a3b8' : '#475569'} />
      <span>{label}</span>
    </button>
  );
}

const crumbStyle: React.CSSProperties = {
  whiteSpace: 'nowrap',
  color: '#111827',
  fontSize: '12px',
  padding: '2px 4px',
  border: '1px solid transparent',
};

const smallIconButton: React.CSSProperties = {
  width: '32px',
  height: '32px',
  border: '1px solid #c5cbd3',
  background: '#ffffff',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};
