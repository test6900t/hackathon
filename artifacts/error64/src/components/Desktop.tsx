import { useOS } from '../os/OSContext';
import { useState, useRef, useCallback, useEffect } from 'react';
import { ContextMenu } from './ContextMenu';
import { FluentIcon } from './Window';

interface DesktopIcon {
  id: string;
  name: string;
  appId: string;
  icon: string;
  x: number;
  y: number;
}

const GRID_W = 80;
const GRID_H = 90;
const INITIAL_ICONS: DesktopIcon[] = [
  { id: 'this-pc', name: 'This PC', appId: 'explorer', icon: 'desktop_pc', x: 0, y: 0 },
  { id: 'recycle', name: 'Recycle Bin', appId: 'explorer', icon: 'delete', x: 0, y: 1 },
  { id: 'explorer', name: 'File Explorer', appId: 'explorer', icon: 'folder', x: 0, y: 2 },
  { id: 'browser', name: 'Error64 Browser', appId: 'browser', icon: 'globe', x: 0, y: 3 },
  { id: 'notepad', name: 'Notepad', appId: 'notepad', icon: 'notepad', x: 0, y: 4 },
  { id: 'paint', name: 'Paint', appId: 'paint', icon: 'paint_bucket', x: 0, y: 5 },
  { id: 'calculator', name: 'Calculator', appId: 'calculator', icon: 'calculator', x: 1, y: 0 },
  { id: 'camera', name: 'Camera', appId: 'camera', icon: 'camera', x: 1, y: 1 },
  { id: 'photos', name: 'Photos', appId: 'photos', icon: 'image', x: 1, y: 2 },
  { id: 'calendar', name: 'Calendar', appId: 'calendar', icon: 'calendar_ltr', x: 1, y: 3 },
  { id: 'mail', name: 'Mail', appId: 'mail', icon: 'mail', x: 1, y: 4 },
  { id: 'media', name: 'Media Player', appId: 'mediaplayer', icon: 'play_circle', x: 1, y: 5 },
  { id: 'settings', name: 'Settings', appId: 'settings', icon: 'settings', x: 2, y: 0 },
  { id: 'taskmanager', name: 'Task Manager', appId: 'taskmanager', icon: 'task_list_square_ltr', x: 2, y: 1 },
  { id: 'controlpanel', name: 'Control Panel', appId: 'controlpanel', icon: 'apps_list', x: 2, y: 2 },
  { id: 'cmd', name: 'Command Prompt', appId: 'cmd', icon: 'prompt', x: 2, y: 3 },
  { id: 'snipping', name: 'Snipping Tool', appId: 'snipping', icon: 'screenshot', x: 2, y: 4 },
  { id: 'sticky', name: 'Sticky Notes', appId: 'sticky', icon: 'note', x: 2, y: 5 },
];

export function Desktop() {
  const { openWindow, settings, startMenuOpen, setStartMenuOpen, searchOpen, setSearchOpen } = useOS();
  const [icons, setIcons] = useState<DesktopIcon[]>(() => {
    try {
      const s = localStorage.getItem('error64_desktop_icons');
      return s ? JSON.parse(s) : INITIAL_ICONS;
    } catch { return INITIAL_ICONS; }
  });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; iconId?: string } | null>(null);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [rubber, setRubber] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const rubberStart = useRef<{ x: number; y: number } | null>(null);
  const desktopRef = useRef<HTMLDivElement>(null);

  const wallpapers: Record<string, string> = {
    gradient1: 'linear-gradient(135deg, #0d1b2a 0%, #1b2838 30%, #16213e 60%, #0f3460 100%)',
    gradient2: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    gradient3: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
    gradient4: 'linear-gradient(135deg, #200122 0%, #6f0000 100%)',
    gradient5: 'linear-gradient(135deg, #093028 0%, #237a57 100%)',
    gradient6: 'linear-gradient(135deg, #232526 0%, #414345 100%)',
  };

  const wallStyle = settings.wallpaper?.startsWith('data:')
    ? { backgroundImage: `url(${settings.wallpaper})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: wallpapers[settings.wallpaper] || wallpapers.gradient1 };

  const saveIcons = useCallback((newIcons: DesktopIcon[]) => {
    setIcons(newIcons);
    localStorage.setItem('error64_desktop_icons', JSON.stringify(newIcons));
  }, []);

  const handleDblClick = useCallback((icon: DesktopIcon) => {
    if (icon.appId === 'sticky') {
      // Toggle sticky notes
      openWindow('sticky', 'Sticky Notes', 'note');
    } else {
      openWindow(icon.appId, icon.name, icon.icon);
    }
  }, [openWindow]);

  const handleIconMouseDown = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (e.button === 2) return;
    if (e.ctrlKey) {
      setSelected(prev => { const s = new Set(prev); if (s.has(id)) s.delete(id); else s.add(id); return s; });
    } else {
      if (!selected.has(id)) setSelected(new Set([id]));
    }
  }, [selected]);

  const handleDesktopMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setSelected(new Set());
    setContextMenu(null);
    setStartMenuOpen(false);
    // Start rubber band
    const rect = desktopRef.current?.getBoundingClientRect();
    if (!rect) return;
    rubberStart.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  useEffect(() => {
    const mm = (e: MouseEvent) => {
      if (!rubberStart.current || !desktopRef.current) return;
      const rect = desktopRef.current.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      const rx = Math.min(rubberStart.current.x, cx);
      const ry = Math.min(rubberStart.current.y, cy);
      const rw = Math.abs(cx - rubberStart.current.x);
      const rh = Math.abs(cy - rubberStart.current.y);
      setRubber({ x: rx, y: ry, w: rw, h: rh });
    };
    const mu = () => {
      rubberStart.current = null;
      setRubber(null);
    };
    window.addEventListener('mousemove', mm);
    window.addEventListener('mouseup', mu);
    return () => { window.removeEventListener('mousemove', mm); window.removeEventListener('mouseup', mu); };
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'F2' && selected.size === 1) {
        const id = [...selected][0];
        const icon = icons.find(i => i.id === id);
        if (icon) { setRenaming(id); setRenameValue(icon.name); }
      }
      if (e.key === 'Delete' && selected.size > 0) {
        saveIcons(icons.filter(i => !selected.has(i.id)));
        setSelected(new Set());
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selected, icons, saveIcons]);

  const handleContextMenu = (e: React.MouseEvent, iconId?: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, iconId });
  };

  const desktopContextItems = [
    {
      label: 'View', submenu: [
        { label: 'Large Icons', onClick: () => {} },
        { label: 'Medium Icons', onClick: () => {} },
        { label: 'Small Icons', onClick: () => {} },
      ]
    },
    {
      label: 'Sort by', submenu: [
        { label: 'Name', onClick: () => saveIcons([...icons].sort((a, b) => a.name.localeCompare(b.name))) },
        { label: 'Date modified', onClick: () => {} },
        { label: 'Type', onClick: () => {} },
        { label: 'Size', onClick: () => {} },
      ]
    },
    { label: 'Refresh', onClick: () => window.location.reload() },
    { separator: true },
    { label: 'New Folder', onClick: () => { const name = 'New Folder'; saveIcons([...icons, { id: `folder-${Date.now()}`, name, appId: 'explorer', icon: 'folder', x: 3, y: 0 }]); } },
    { label: 'New Text Document', onClick: () => { saveIcons([...icons, { id: `txt-${Date.now()}`, name: 'New Text Document.txt', appId: 'notepad', icon: 'document', x: 3, y: 1 }]); } },
    { separator: true },
    { label: 'Display settings', onClick: () => openWindow('settings', 'Settings', 'settings', { section: 'personalization' }) },
    { label: 'Personalize', onClick: () => openWindow('settings', 'Settings', 'settings', { section: 'personalization' }) },
  ];

  const iconContextItems = (iconId: string) => [
    { label: 'Open', onClick: () => { const icon = icons.find(i => i.id === iconId); if (icon) handleDblClick(icon); } },
    { separator: true },
    { label: 'Cut', onClick: () => {} },
    { label: 'Copy', onClick: () => {} },
    { label: 'Create shortcut', onClick: () => {} },
    { label: 'Delete', onClick: () => { saveIcons(icons.filter(i => i.id !== iconId)); } },
    { label: 'Rename', onClick: () => { const icon = icons.find(i => i.id === iconId); if (icon) { setRenaming(iconId); setRenameValue(icon.name); } } },
    { separator: true },
    { label: 'Properties', onClick: () => {} },
  ];

  return (
    <div
      ref={desktopRef}
      style={{
        position: 'fixed', inset: 0, bottom: '48px', ...wallStyle,
        cursor: 'default', overflow: 'hidden',
      }}
      onMouseDown={handleDesktopMouseDown}
      onContextMenu={(e) => handleContextMenu(e)}
    >
      {/* Desktop icons */}
      {icons.map(icon => {
        const posX = icon.x * GRID_W + 8;
        const posY = icon.y * GRID_H + 8;
        const isSelected = selected.has(icon.id);

        return (
          <div
            key={icon.id}
            style={{
              position: 'absolute', left: posX, top: posY,
              width: GRID_W - 8, height: GRID_H - 8,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'flex-start',
              paddingTop: '8px', gap: '4px',
              background: isSelected ? 'rgba(0,120,212,0.3)' : 'transparent',
              border: isSelected ? '1px solid rgba(0,120,212,0.5)' : '1px solid transparent',
              cursor: 'default', userSelect: 'none',
            }}
            onMouseDown={(e) => handleIconMouseDown(e, icon.id)}
            onDoubleClick={() => handleDblClick(icon)}
            onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); setSelected(new Set([icon.id])); handleContextMenu(e, icon.id); }}
          >
            <div style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FluentIcon name={icon.icon} size={48} white />
            </div>
            {renaming === icon.id ? (
              <input
                autoFocus
                value={renameValue}
                onChange={e => setRenameValue(e.target.value)}
                onBlur={() => {
                  if (renameValue.trim()) saveIcons(icons.map(i => i.id === icon.id ? { ...i, name: renameValue.trim() } : i));
                  setRenaming(null);
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter') { saveIcons(icons.map(i => i.id === icon.id ? { ...i, name: renameValue.trim() } : i)); setRenaming(null); }
                  if (e.key === 'Escape') setRenaming(null);
                  e.stopPropagation();
                }}
                style={{ width: '70px', textAlign: 'center', fontSize: '11px', background: '#316ac5', color: '#fff', border: '1px solid #316ac5', outline: 'none', padding: '1px 2px' }}
                onClick={e => e.stopPropagation()}
              />
            ) : (
              <span style={{
                fontSize: '11px', color: '#fff', textAlign: 'center', lineHeight: '1.2',
                textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                wordBreak: 'break-word', maxWidth: '72px',
                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
              }}>
                {icon.name}
              </span>
            )}
          </div>
        );
      })}

      {/* Rubber band selection */}
      {rubber && rubber.w > 5 && rubber.h > 5 && (
        <div style={{
          position: 'absolute', left: rubber.x, top: rubber.y, width: rubber.w, height: rubber.h,
          border: '1px solid rgba(0,120,212,0.8)', background: 'rgba(0,120,212,0.1)',
          pointerEvents: 'none',
        }} />
      )}

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={contextMenu.iconId ? iconContextItems(contextMenu.iconId) : desktopContextItems}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}
