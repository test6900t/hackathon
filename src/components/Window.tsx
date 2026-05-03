import { useRef, useState, useEffect, ReactNode } from 'react';
import { AppWindow } from '../os/OSContext';
import { AppIcon } from './AppIcon';
import { resolveSystemIcon } from '../lib/systemIcons';

interface WindowProps {
  win: AppWindow;
  isActive: boolean;
  children: ReactNode;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onRestore: () => void;
  onFocus: () => void;
  onUpdate: (u: Partial<AppWindow>) => void;
}

const TASKBAR_HEIGHT = 48;
const SNAP_THRESHOLD = 8;
const MIN_WIDTH = 280;
const MIN_HEIGHT = 200;

export function Window({ win, isActive, children, onClose, onMinimize, onMaximize, onRestore, onFocus, onUpdate }: WindowProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<string | null>(null);
  const [snapPreview, setSnapPreview] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const dragStart = useRef({ mx: 0, my: 0, wx: 0, wy: 0, ww: 0, wh: 0 });
  const winRef = useRef<HTMLDivElement>(null);
  const [closing, setClosing] = useState(false);
  const [opening, setOpening] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setOpening(false), 150);
    return () => clearTimeout(t);
  }, []);

  const handleClose = () => {
    setClosing(true);
    setTimeout(onClose, 100);
  };

  const handleTitleMouseDown = (e: React.MouseEvent) => {
    if (win.isMaximized || win.isFullscreen) return;
    if ((e.target as HTMLElement).closest('button')) return;
    e.preventDefault();
    onFocus();
    setIsDragging(true);
    dragStart.current = { mx: e.clientX, my: e.clientY, wx: win.x, wy: win.y, ww: win.width, wh: win.height };
  };

  const handleResizeMouseDown = (e: React.MouseEvent, direction: string) => {
    if (win.isMaximized || win.isFullscreen) return;
    e.preventDefault();
    e.stopPropagation();
    onFocus();
    setIsResizing(direction);
    dragStart.current = { mx: e.clientX, my: e.clientY, wx: win.x, wy: win.y, ww: win.width, wh: win.height };
  };

  useEffect(() => {
    if (!isDragging && !isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - dragStart.current.mx;
      const dy = e.clientY - dragStart.current.my;

      if (isDragging) {
        const newX = dragStart.current.wx + dx;
        const newY = dragStart.current.wy + dy;

        const desktopHeight = window.innerHeight - TASKBAR_HEIGHT;
        if (e.clientX <= SNAP_THRESHOLD) {
          setSnapPreview({ x: 0, y: 0, w: window.innerWidth / 2, h: desktopHeight });
        } else if (e.clientX >= window.innerWidth - SNAP_THRESHOLD) {
          setSnapPreview({ x: window.innerWidth / 2, y: 0, w: window.innerWidth / 2, h: desktopHeight });
        } else if (e.clientY <= SNAP_THRESHOLD) {
          setSnapPreview({ x: 0, y: 0, w: window.innerWidth, h: desktopHeight });
        } else {
          setSnapPreview(null);
        }

        onUpdate({
          x: Math.max(-win.width + 100, newX),
          y: Math.max(0, Math.min(newY, window.innerHeight - TASKBAR_HEIGHT - 30)),
        });
        return;
      }

      if (isResizing) {
        const { wx, wy, ww, wh } = dragStart.current;
        let x = wx;
        let y = wy;
        let width = ww;
        let height = wh;

        if (isResizing.includes('e')) width = Math.max(MIN_WIDTH, ww + dx);
        if (isResizing.includes('s')) height = Math.max(MIN_HEIGHT, wh + dy);
        if (isResizing.includes('w')) {
          width = Math.max(MIN_WIDTH, ww - dx);
          x = wx + ww - width;
        }
        if (isResizing.includes('n')) {
          height = Math.max(MIN_HEIGHT, wh - dy);
          y = wy + wh - height;
        }

        onUpdate({ x, y, width, height });
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (isDragging && snapPreview) {
        onUpdate({ x: snapPreview.x, y: snapPreview.y, width: snapPreview.w, height: snapPreview.h });
        setSnapPreview(null);
      } else if (isDragging) {
        const desktopHeight = window.innerHeight - TASKBAR_HEIGHT;
        if (e.clientX <= SNAP_THRESHOLD) {
          onUpdate({ x: 0, y: 0, width: window.innerWidth / 2, height: desktopHeight });
        } else if (e.clientX >= window.innerWidth - SNAP_THRESHOLD) {
          onUpdate({ x: window.innerWidth / 2, y: 0, width: window.innerWidth / 2, height: desktopHeight });
        } else if (e.clientY <= SNAP_THRESHOLD) {
          onMaximize();
        }
        setSnapPreview(null);
      }

      setIsDragging(false);
      setIsResizing(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, snapPreview, win, onMaximize, onUpdate]);

  const handleTitleDblClick = () => {
    if (win.isMaximized) onRestore();
    else onMaximize();
  };

  if (win.isMinimized) return null;

  const isMaximized = win.isMaximized || win.isFullscreen;
  const titleBarColor = '#1a1a1a';

  const style: React.CSSProperties = {
    position: 'fixed',
    left: isMaximized ? 0 : win.x,
    top: isMaximized ? 0 : win.y,
    width: isMaximized ? '100vw' : win.width,
    height: isMaximized ? `calc(100vh - ${TASKBAR_HEIGHT}px)` : win.height,
    zIndex: win.zIndex,
    display: 'flex',
    flexDirection: 'column',
    boxShadow: isActive ? '0 8px 32px rgba(0,0,0,0.55), 0 2px 8px rgba(0,0,0,0.3)' : '0 4px 16px rgba(0,0,0,0.3)',
    border: isActive ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(0,0,0,0.2)',
    overflow: 'hidden',
    transform: closing ? 'scale(0.95)' : opening ? 'scale(0.97)' : 'scale(1)',
    opacity: closing ? 0 : opening ? 0 : 1,
    transition: closing
      ? 'transform 100ms ease-in, opacity 100ms ease-in'
      : opening
        ? 'transform 150ms ease-out, opacity 150ms ease-out'
        : 'none',
    userSelect: isDragging || isResizing ? 'none' : 'auto',
    background: '#fff',
  };

  return (
    <>
      {snapPreview && (
        <div
          style={{
            position: 'fixed',
            left: snapPreview.x,
            top: snapPreview.y,
            width: snapPreview.w,
            height: snapPreview.h,
            background: 'rgba(0,120,212,0.2)',
            border: '2px solid rgba(0,120,212,0.5)',
            zIndex: 99990,
            pointerEvents: 'none',
            transition: 'all 100ms ease',
          }}
        />
      )}

      <div ref={winRef} style={style} onMouseDown={onFocus}>
        <div
          style={{
            height: '32px',
            background: isActive ? '#f3f3f3' : '#eeeeee',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
            cursor: isDragging ? 'grabbing' : 'default',
            borderBottom: '1px solid rgba(0,0,0,0.08)',
          }}
          onMouseDown={handleTitleMouseDown}
          onDoubleClick={handleTitleDblClick}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingLeft: '8px', flex: 1, minWidth: 0 }}>
            <AppIcon iconName={win.appId} size={16} />
            <span style={{ fontSize: '12px', color: titleBarColor, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {win.title}
            </span>
          </div>
          <div style={{ display: 'flex', height: '100%', flexShrink: 0 }}>
            <WinBtn onClick={onMinimize} title="Minimize" hoverColor="rgba(0,0,0,0.1)">
              <svg width="10" height="1" viewBox="0 0 10 1">
                <rect width="10" height="1" fill={titleBarColor} />
              </svg>
            </WinBtn>
            <WinBtn onClick={win.isMaximized ? onRestore : onMaximize} title={win.isMaximized ? 'Restore' : 'Maximize'} hoverColor="rgba(0,0,0,0.1)">
              {win.isMaximized ? (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke={titleBarColor} strokeWidth="1">
                  <rect x="2" y="0" width="8" height="8" />
                  <rect x="0" y="2" width="8" height="8" fill="#f3f3f3" />
                  <rect x="0" y="2" width="8" height="8" />
                </svg>
              ) : (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke={titleBarColor} strokeWidth="1">
                  <rect x="0" y="0" width="10" height="10" />
                </svg>
              )}
            </WinBtn>
            <WinBtn onClick={handleClose} title="Close" hoverColor="#E81123" hoverTextColor="#fff">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke={titleBarColor} strokeWidth="1.2">
                <line x1="0" y1="0" x2="10" y2="10" />
                <line x1="10" y1="0" x2="0" y2="10" />
              </svg>
            </WinBtn>
          </div>
        </div>

        <div style={{ flex: 1, overflow: 'hidden', position: 'relative', background: '#fff' }}>
          {children}
        </div>

        {!isMaximized && (
          <>
            <ResizeHandle dir="n" onMouseDown={handleResizeMouseDown} />
            <ResizeHandle dir="s" onMouseDown={handleResizeMouseDown} />
            <ResizeHandle dir="e" onMouseDown={handleResizeMouseDown} />
            <ResizeHandle dir="w" onMouseDown={handleResizeMouseDown} />
            <ResizeHandle dir="nw" onMouseDown={handleResizeMouseDown} />
            <ResizeHandle dir="ne" onMouseDown={handleResizeMouseDown} />
            <ResizeHandle dir="sw" onMouseDown={handleResizeMouseDown} />
            <ResizeHandle dir="se" onMouseDown={handleResizeMouseDown} />
          </>
        )}
      </div>
    </>
  );
}

function WinBtn({ onClick, children, title, hoverColor, hoverTextColor }: {
  onClick: () => void;
  children: ReactNode;
  title: string;
  hoverColor: string;
  hoverTextColor?: string;
}) {
  const [hover, setHover] = useState(false);
  return (
    <button
      title={title}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: '46px',
        height: '100%',
        border: 'none',
        cursor: 'pointer',
        background: hover ? hoverColor : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background 100ms',
      }}
    >
      {hoverTextColor && hover ? <span style={{ color: hoverTextColor }}>{children}</span> : children}
    </button>
  );
}

function ResizeHandle({ dir, onMouseDown }: {
  dir: string;
  onMouseDown: (e: React.MouseEvent, dir: string) => void;
}) {
  const cursors: Record<string, string> = {
    n: 'n-resize',
    s: 's-resize',
    e: 'e-resize',
    w: 'w-resize',
    nw: 'nw-resize',
    ne: 'ne-resize',
    sw: 'sw-resize',
    se: 'se-resize',
  };
  const size = 6;
  const styles: Record<string, React.CSSProperties> = {
    n: { top: 0, left: size, right: size, height: size },
    s: { bottom: 0, left: size, right: size, height: size },
    e: { top: size, right: 0, bottom: size, width: size },
    w: { top: size, left: 0, bottom: size, width: size },
    nw: { top: 0, left: 0, width: size, height: size },
    ne: { top: 0, right: 0, width: size, height: size },
    sw: { bottom: 0, left: 0, width: size, height: size },
    se: { bottom: 0, right: 0, width: size, height: size },
  };

  return (
    <div
      style={{
        position: 'absolute',
        ...styles[dir],
        cursor: cursors[dir],
        zIndex: 10,
      }}
      onMouseDown={(e) => onMouseDown(e, dir)}
    />
  );
}

export function FluentIcon({ name, size = 16, color, white }: { name: string; size?: number; color?: string; white?: boolean }) {
  const Icon = resolveSystemIcon(name);
  return (
    <Icon
      size={size}
      color={white ? '#ffffff' : color || 'currentColor'}
      strokeWidth={1.85}
      style={{ flexShrink: 0 }}
    />
  );
}
