import { useOS } from '../os/OSContext';
import { useState, useRef, useCallback, useEffect } from 'react';
import { ContextMenu } from './ContextMenu';
import { AppIcon } from './AppIcon';
import { VirtualFS } from '../os/VirtualFS';

interface DesktopIcon {
  id: string;
  name: string;
  appId: string;
  icon: string;
  x: number;
  y: number;
}

interface DragState {
  startX: number;
  startY: number;
  offsetX: number;
  offsetY: number;
  draggedIds: Set<string>;
}

const DESKTOP_ICONS_KEY = 'error64_desktop_icons';
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
  { id: 'minecraft', name: 'Minecraft', appId: 'minecraft', icon: 'cube', x: 3, y: 0 },
];

function getUniqueDesktopName(parent: string, base: string, ext: string) {
  let index = 1;
  let name = `${base}${ext}`;
  while (VirtualFS.getNode(`${parent}\\${name}`)) {
    index += 1;
    name = `${base} (${index})${ext}`;
  }
  return name;
}

export function Desktop() {
  const { openWindow, settings, startMenuOpen, setStartMenuOpen, searchOpen, setSearchOpen, clipboard, setClipboard, updateSettings } = useOS();

  const loadDesktopIcons = () => {
    try {
      const s = localStorage.getItem(DESKTOP_ICONS_KEY);
      return s ? JSON.parse(s) : INITIAL_ICONS;
    } catch {
      return INITIAL_ICONS;
    }
  };

  const [icons, setIcons] = useState<DesktopIcon[]>(loadDesktopIcons);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [rubber, setRubber] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; iconId?: string } | null>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [deletingIcons, setDeletingIcons] = useState<Set<string>>(new Set());
  const [wallpaperInput, setWallpaperInput] = useState<HTMLInputElement | null>(null);
  const [iconSize, setIconSize] = useState<'large' | 'medium' | 'small'>('medium');
  const rubberStart = useRef<{ x: number; y: number } | null>(null);
  const desktopRef = useRef<HTMLDivElement>(null);

  const GRID_SIZE = iconSize === 'large' ? 110 : iconSize === 'medium' ? 90 : 70;
  const ICON_IMG_SIZE = iconSize === 'large' ? 56 : iconSize === 'medium' ? 48 : 36;
  const GRID_W = GRID_SIZE;
  const GRID_H = GRID_SIZE;

  const isCustomWallpaper = (wp: string) => wp?.startsWith('data:') || wp?.includes('/wallpapers/') || wp?.startsWith('./wallpapers/');
  
  const wallStyle = isCustomWallpaper(settings.wallpaper || '')
    ? { backgroundImage: `url(${settings.wallpaper})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: '#1a1a2e' };

  const saveIcons = useCallback((newIcons: DesktopIcon[]) => {
    setIcons(newIcons);
    localStorage.setItem('error64_desktop_icons', JSON.stringify(newIcons));
  }, []);

  const handleDblClick = useCallback((icon: DesktopIcon) => {
    if (icon.appId === 'sticky') {
      openWindow('sticky', 'Sticky Notes', 'note');
    } else {
      openWindow(icon.appId, icon.name, icon.icon);
    }
  }, [openWindow]);

  const deleteIcons = useCallback((idsToDelete: Set<string>) => {
    setDeletingIcons(idsToDelete);
    setTimeout(() => {
      const deleted = icons.filter(i => idsToDelete.has(i.id));
      try {
        const recycleBin = JSON.parse(localStorage.getItem('error64_recycle_bin') || '[]');
        localStorage.setItem('error64_recycle_bin', JSON.stringify([...recycleBin, ...deleted]));
      } catch { }
      saveIcons(icons.filter(i => !idsToDelete.has(i.id)));
      setDeletingIcons(new Set());
      setSelected(new Set());
    }, 200);
  }, [icons, saveIcons]);

  const restoreFromRecycleBin = useCallback(() => {
    try {
      const recycleBin = JSON.parse(localStorage.getItem('error64_recycle_bin') || '[]');
      if (recycleBin.length > 0) {
        const maxX = Math.max(...icons.map(i => i.x), 0);
        const restored = recycleBin.map((icon: DesktopIcon, idx: number) => ({ ...icon, id: `${icon.id}-restored-${Date.now()}-${idx}`, x: maxX + idx + 1, y: 0 }));
        saveIcons([...icons, ...restored]);
        localStorage.setItem('error64_recycle_bin', '[]');
      }
    } catch { }
  }, [icons, saveIcons]);

  const emptyRecycleBin = useCallback(() => {
    localStorage.setItem('error64_recycle_bin', '[]');
  }, []);

  const handleIconMouseDown = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (e.button === 2) return;
    if (e.ctrlKey) {
      setSelected(prev => { const s = new Set(prev); if (s.has(id)) s.delete(id); else s.add(id); return s; });
    } else {
      if (!selected.has(id)) setSelected(new Set([id]));
    }
    
    // Start drag
    if (e.button === 0) {
      const draggedIds = selected.has(id) ? selected : new Set([id]);
      setDragState({
        startX: e.clientX,
        startY: e.clientY,
        offsetX: 0,
        offsetY: 0,
        draggedIds
      });
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
      // Handle drag
      if (dragState) {
        const offsetX = e.clientX - dragState.startX;
        const offsetY = e.clientY - dragState.startY;
        setDragState(prev => prev ? { ...prev, offsetX, offsetY } : null);
        return;
      }

      // Handle rubber band
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

    const mu = (e: MouseEvent) => {
      // Handle drop
      if (dragState) {
        const offsetX = e.clientX - dragState.startX;
        const offsetY = e.clientY - dragState.startY;
        
        // Only snap to grid if moved more than 5px
        if (Math.abs(offsetX) > 5 || Math.abs(offsetY) > 5) {
          const newIcons = icons.map(icon => {
            if (dragState.draggedIds.has(icon.id)) {
              const newX = Math.max(0, Math.floor((icon.x * GRID_W + offsetX + 40) / GRID_W));
              const newY = Math.max(0, Math.floor((icon.y * GRID_H + offsetY + 45) / GRID_H));
              return { ...icon, x: newX, y: newY };
            }
            return icon;
          });
          saveIcons(newIcons);
        }
        setDragState(null);
        return;
      }

      // Handle rubber band selection
      if (rubber && rubber.w > 5 && rubber.h > 5 && desktopRef.current) {
        const rect = desktopRef.current.getBoundingClientRect();
        const newSelected = new Set<string>();
        icons.forEach(icon => {
          const iconX = icon.x * GRID_W + 8;
          const iconY = icon.y * GRID_H + 8;
          const iconW = GRID_W - 8;
          const iconH = GRID_H - 8;

          if (
            rubber.x < iconX + iconW &&
            rubber.x + rubber.w > iconX &&
            rubber.y < iconY + iconH &&
            rubber.y + rubber.h > iconY
          ) {
            newSelected.add(icon.id);
          }
        });
        setSelected(newSelected);
      }

      rubberStart.current = null;
      setRubber(null);
    };

    window.addEventListener('mousemove', mm);
    window.addEventListener('mouseup', mu);
    return () => { window.removeEventListener('mousemove', mm); window.removeEventListener('mouseup', mu); };
  }, [dragState, icons, saveIcons, rubber]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'F2' && selected.size === 1) {
        const id = [...selected][0];
        const icon = icons.find(i => i.id === id);
        if (icon) { setRenaming(id); setRenameValue(icon.name); }
      }
      if (e.key === 'Delete' && selected.size > 0) {
        deleteIcons(selected);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selected, deleteIcons]);

  const handleContextMenu = (e: React.MouseEvent, iconId?: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, iconId });
  };

  const desktopContextItems: { label?: string; separator?: boolean; onClick?: () => void; submenu?: { label: string; onClick: () => void }[] }[] = [
    {
      label: 'View', submenu: [
        { label: 'Large Icons', onClick: () => setIconSize('large') },
        { label: 'Medium Icons', onClick: () => setIconSize('medium') },
        { label: 'Small Icons', onClick: () => setIconSize('small') },
      ]
    },
    { label: 'Refresh', onClick: () => window.location.reload() },
    { separator: true },
    { label: 'New Folder', onClick: () => {
        const name = getUniqueDesktopName('C:\\Users\\User\\Desktop', 'New Folder', '');
        VirtualFS.createFolder('C:\\Users\\User\\Desktop', name);
        saveIcons([...icons, { id: `folder-${Date.now()}`, name, appId: 'explorer', icon: 'folder', x: 3, y: 0 }]);
      } },
    { label: 'New Text Document', onClick: () => {
        const name = getUniqueDesktopName('C:\\Users\\User\\Desktop', 'New Text Document', '.txt');
        VirtualFS.createFile('C:\\Users\\User\\Desktop', name, '');
        saveIcons([...icons, { id: `txt-${Date.now()}`, name, appId: 'notepad', icon: 'notepad', x: 3, y: 1 }]);
      } },
    { 
      label: 'Add App', 
      submenu: [
        { label: 'Browser', onClick: () => saveIcons([...icons, { id: `shortcut-${Date.now()}`, name: 'Error64 Browser', appId: 'browser', icon: 'globe', x: 3, y: 2 }]) },
        { label: 'Calculator', onClick: () => saveIcons([...icons, { id: `shortcut-${Date.now()}`, name: 'Calculator', appId: 'calculator', icon: 'calculator', x: 3, y: 3 }]) },
        { label: 'Notepad', onClick: () => saveIcons([...icons, { id: `shortcut-${Date.now()}`, name: 'Notepad', appId: 'notepad', icon: 'notepad', x: 3, y: 4 }]) },
        { label: 'Settings', onClick: () => saveIcons([...icons, { id: `shortcut-${Date.now()}`, name: 'Settings', appId: 'settings', icon: 'settings', x: 3, y: 5 }]) },
        { label: 'File Explorer', onClick: () => saveIcons([...icons, { id: `shortcut-${Date.now()}`, name: 'File Explorer', appId: 'explorer', icon: 'folder', x: 4, y: 0 }]) },
        { label: 'Paint', onClick: () => saveIcons([...icons, { id: `shortcut-${Date.now()}`, name: 'Paint', appId: 'paint', icon: 'paint_bucket', x: 4, y: 1 }]) },
        { label: 'Command Prompt', onClick: () => saveIcons([...icons, { id: `shortcut-${Date.now()}`, name: 'Command Prompt', appId: 'cmd', icon: 'prompt', x: 4, y: 2 }]) },
        { label: 'Media Player', onClick: () => saveIcons([...icons, { id: `shortcut-${Date.now()}`, name: 'Media Player', appId: 'mediaplayer', icon: 'play_circle', x: 4, y: 3 }]) },
        { label: 'Calendar', onClick: () => saveIcons([...icons, { id: `shortcut-${Date.now()}`, name: 'Calendar', appId: 'calendar', icon: 'calendar_ltr', x: 4, y: 4 }]) },
        { label: 'Camera', onClick: () => saveIcons([...icons, { id: `shortcut-${Date.now()}`, name: 'Camera', appId: 'camera', icon: 'camera', x: 4, y: 5 }]) },
      ]
    },
    { separator: true },
    { label: 'Paste', onClick: () => {
      if (clipboard && clipboard.type === 'file') {
        try {
          const data = JSON.parse(clipboard.content);
          if (data.icon) {
            const maxX = Math.max(...icons.map(i => i.x), 0);
            const newIcon = { ...data.icon, id: `${data.icon.id}-${Date.now()}`, x: maxX + 1, y: 0 };
            if (data.action === 'cut') {
              const originalIcon = icons.find(i => i.id === data.icon.id);
              if (originalIcon) saveIcons(icons.filter(i => i.id !== data.icon.id));
            }
            saveIcons([...icons, newIcon]);
          }
        } catch { setClipboard(null); }
      }
    }, disabled: !clipboard },
  ];
  if (selected.size > 0) {
    desktopContextItems.push(
      { separator: true as boolean },
      { label: 'Cut', onClick: () => {
        const selectedIcons = icons.filter(i => selected.has(i.id));
        if (selectedIcons.length > 0) setClipboard({ type: 'file', content: JSON.stringify({ action: 'cut', icons: selectedIcons }) });
      }},
      { label: 'Copy', onClick: () => {
        const selectedIcons = icons.filter(i => selected.has(i.id));
        if (selectedIcons.length > 0) setClipboard({ type: 'file', content: JSON.stringify({ action: 'copy', icons: selectedIcons }) });
      }},
      { label: 'Delete', onClick: () => deleteIcons(selected) }
    );
  }

  desktopContextItems.push(
    { separator: true as boolean },
    { label: 'Display settings', onClick: () => openWindow('settings', 'Settings', 'settings', { section: 'display' }) }
  );

  const iconContextItems = (iconId: string) => {
    const icon = icons.find(i => i.id === iconId);
    const isRecycleBin = iconId === 'recycle';
    
    if (isRecycleBin) {
      const recycleBinCount = (() => { try { return JSON.parse(localStorage.getItem('error64_recycle_bin') || '[]').length; } catch { return 0; } })();
      return [
        { label: 'Open', onClick: () => {} },
        { separator: true },
        { label: 'Restore all files', onClick: restoreFromRecycleBin, disabled: recycleBinCount === 0 },
        { label: 'Empty Recycle Bin', onClick: emptyRecycleBin, disabled: recycleBinCount === 0 },
        { separator: true },
        { label: 'Properties', onClick: () => {} },
      ];
    }

    const handleCut = () => {
      if (icon) setClipboard({ type: 'file', content: JSON.stringify({ action: 'cut', icon }) });
    };
    const handleCopy = () => {
      if (icon) setClipboard({ type: 'file', content: JSON.stringify({ action: 'copy', icon }) });
    };
    const handlePaste = () => {
      if (clipboard && clipboard.type === 'file') {
        try {
          const data = JSON.parse(clipboard.content);
          if (data.icon) {
            const newIcon = { ...data.icon, id: `${data.icon.id}-${Date.now()}`, x: icon ? icon.x + 1 : 0, y: icon ? icon.y : 0 };
            if (data.action === 'cut') {
              saveIcons(icons.filter(i => i.id !== iconId));
            }
            saveIcons([...icons, newIcon]);
          }
        } catch { setClipboard(null); }
      }
    };
    
    return [
      { label: 'Open', onClick: () => { const icon = icons.find(i => i.id === iconId); if (icon) handleDblClick(icon); } },
      { separator: true },
      { label: 'Cut', onClick: handleCut },
      { label: 'Copy', onClick: handleCopy },
      { label: 'Paste', onClick: handlePaste, disabled: !clipboard },
      { separator: true },
      { label: 'Create shortcut', onClick: () => { const icon = icons.find(i => i.id === iconId); if (icon) saveIcons([...icons, { ...icon, id: `shortcut-${Date.now()}`, name: `${icon.name} (Shortcut)` }]); } },
      { label: 'Delete', onClick: () => { deleteIcons(new Set([iconId])); } },
      { label: 'Rename', onClick: () => { const icon = icons.find(i => i.id === iconId); if (icon) { setRenaming(iconId); setRenameValue(icon.name); } } },
      { separator: true },
      { label: 'Properties', onClick: () => {} },
    ];
  };

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
        const isDeleting = deletingIcons.has(icon.id);
        const isDragging = dragState?.draggedIds.has(icon.id);

        let displayX = posX;
        let displayY = posY;
        if (isDragging && dragState) {
          displayX = posX + dragState.offsetX;
          displayY = posY + dragState.offsetY;
        }

        return (
          <div
            key={icon.id}
            className="desktop-icon"
            style={{
              position: 'absolute', left: displayX, top: displayY,
              width: GRID_W - 8, height: GRID_H - 8,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'flex-start',
              paddingTop: '8px', gap: '4px',
              background: isSelected ? 'rgba(0,120,212,0.25)' : 'transparent',
              borderRadius: '4px',
              cursor: 'default', userSelect: 'none',
              transition: isDragging ? 'none' : 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
              transform: isDeleting ? 'scale(0.5) rotate(15deg)' : isDragging ? 'scale(1.08)' : 'scale(1)',
              opacity: isDeleting ? 0 : 1,
              zIndex: isDragging ? 1000 : isSelected ? 10 : 1,
              boxShadow: isSelected ? '0 0 0 1px rgba(0,120,212,0.6), 0 2px 8px rgba(0,0,0,0.15)' : 'none',
            }}
            onMouseDown={(e) => handleIconMouseDown(e, icon.id)}
            onDoubleClick={() => handleDblClick(icon)}
            onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); setSelected(new Set([icon.id])); handleContextMenu(e, icon.id); }}
          >
            <div style={{ width: ICON_IMG_SIZE, height: ICON_IMG_SIZE, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AppIcon iconName={icon.icon} size={ICON_IMG_SIZE} />
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
                fontSize: iconSize === 'large' ? '12px' : iconSize === 'medium' ? '11px' : '10px', color: '#fff', textAlign: 'center', lineHeight: '1.2',
                textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                wordBreak: 'break-word', maxWidth: iconSize === 'large' ? 96 : iconSize === 'medium' ? 82 : 64,
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

      {/* Hidden file input for custom wallpaper */}
      <input
        ref={setWallpaperInput}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = () => {
              updateSettings({ wallpaper: reader.result as string });
            };
            reader.readAsDataURL(file);
          }
        }}
      />
    </div>
  );
}
