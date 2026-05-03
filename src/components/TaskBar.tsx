import { useOS } from '../os/OSContext';
import { useState, useEffect, useRef } from 'react';
import { FluentIcon } from './Window';
import { AppIcon } from './AppIcon';
import { ContextMenu } from './ContextMenu';

const PINNED_APPS = [
  { appId: 'explorer', title: 'File Explorer', icon: 'folder' },
  { appId: 'browser', title: 'Error64 Browser', icon: 'globe' },
  { appId: 'minecraft', title: 'Minecraft Classic', icon: 'cube' },
  { appId: 'mail', title: 'Mail', icon: 'mail' },
  { appId: 'settings', title: 'Settings', icon: 'settings' },
  { appId: 'msstore', title: 'Microsoft Store', icon: 'store_microsoft' },
];

export function TaskBar() {
  const {
    windows, openWindow, minimizeWindow, restoreWindow, bringToFront,
    startMenuOpen, setStartMenuOpen,
    setSearchOpen, setTaskViewOpen, setNotifOpen,
    settings, updateSettings,
    notifications, activeWindowId, closeWindow,
  } = useOS();
  const [time, setTime] = useState(new Date());
  const [volOpen, setVolOpen] = useState(false);
  const [taskbarCtx, setTaskbarCtx] = useState<{ x: number; y: number; winId: string } | null>(null);
  const [hoveredApp, setHoveredApp] = useState<string | null>(null);
  const volRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (volRef.current && !volRef.current.contains(e.target as Node)) setVolOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const fmt = (d: Date) => {
    if (settings.clockFormat === '24h')
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };
  const fmtDate = (d: Date) => d.toLocaleDateString([], { month: 'numeric', day: 'numeric', year: 'numeric' });

  const unreadCount = notifications.filter(n => !n.read).length;

  const getVolumeIcon = () => {
    if (settings.muted || settings.volume === 0) return 'speaker_off';
    if (settings.volume < 33) return 'speaker_1';
    if (settings.volume < 66) return 'speaker_2';
    return 'speaker_2';
  };

  const taskbarStyle: React.CSSProperties = {
    position: 'fixed', bottom: 0, left: 0, right: 0,
    height: '48px', zIndex: 9999,
    background: settings.transparency ? 'rgba(32,32,32,0.85)' : 'rgba(32,32,32,1)',
    backdropFilter: settings.transparency ? 'blur(20px) saturate(180%)' : 'none',
    display: 'flex', alignItems: 'center',
    borderTop: '1px solid rgba(255,255,255,0.08)',
    color: '#fff',
  };

  const handleAppClick = (appId: string, title: string, icon: string) => {
    const openWin = windows.find(w => w.appId === appId && !w.isMinimized);
    if (openWin) {
      if (openWin.id === activeWindowId) minimizeWindow(openWin.id);
      else bringToFront(openWin.id);
    } else {
      const minWin = windows.find(w => w.appId === appId && w.isMinimized);
      if (minWin) restoreWindow(minWin.id);
      else openWindow(appId, title, icon);
    }
  };

  const runningApps = windows.filter(w => !PINNED_APPS.some(p => p.appId === w.appId));

  return (
    <>
      <div style={taskbarStyle}>
        {/* Start button */}
        <TaskbarBtn
          title="Start"
          active={startMenuOpen}
          onClick={() => setStartMenuOpen(!startMenuOpen)}
          width={48}
        >
          <svg width="18" height="18" viewBox="0 0 21 21">
            <path d="M0 0h10v10H0z" fill="#f35325"/>
            <path d="M11 0h10v10H11z" fill="#81bc06"/>
            <path d="M0 11h10v10H0z" fill="#05a6f0"/>
            <path d="M11 11h10v10H11z" fill="#ffba08"/>
          </svg>
        </TaskbarBtn>

        {/* Search */}
        <div
          onClick={() => setSearchOpen(true)}
          style={{
            height: '32px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px',
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '0 12px', cursor: 'text', marginLeft: '4px',
            width: '220px', fontSize: '13px', color: 'rgba(255,255,255,0.75)',
          }}
        >
          <FluentIcon name="search" size={16} white />
          <span>Search</span>
        </div>

        {/* Task View */}
        <TaskbarBtn title="Task View" onClick={() => setTaskViewOpen(v => !v)} width={44}>
          <FluentIcon name="task_list_square_ltr" size={20} white />
        </TaskbarBtn>

        {/* Separator */}
        <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.15)', margin: '0 4px' }} />

        {/* Pinned apps */}
        {PINNED_APPS.map(app => {
          const isRunning = windows.some(w => w.appId === app.appId);
          const isActive = windows.some(w => w.appId === app.appId && w.id === activeWindowId);
          return (
            <TaskbarAppBtn
              key={app.appId}
              appId={app.appId}
              title={app.title}
              isRunning={isRunning}
              isActive={isActive}
              onClick={() => handleAppClick(app.appId, app.title, app.icon)}
              onContextMenu={(e) => { e.preventDefault(); /* taskbar context */ }}
            />
          );
        })}

        {/* Running apps (not pinned) */}
        {runningApps.map(win => {
          const isActive = win.id === activeWindowId;
          return (
            <TaskbarAppBtn
              key={win.id}
              icon={win.icon}
              title={win.title}
              isRunning={true}
              isActive={isActive}
              onClick={() => {
                if (win.isMinimized) restoreWindow(win.id);
                else if (isActive) minimizeWindow(win.id);
                else bringToFront(win.id);
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                setTaskbarCtx({ x: e.clientX, y: e.clientY, winId: win.id });
              }}
            />
          );
        })}

        {/* System tray */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', height: '100%' }}>
          {/* Notification bell */}
          <TaskbarBtn title="Notifications" onClick={() => setNotifOpen(v => !v)} width={40}>
            <div style={{ position: 'relative' }}>
              <FluentIcon name="alert" size={18} white />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute', top: '-6px', right: '-6px',
                  background: '#0078D4', borderRadius: '50%',
                  width: '14px', height: '14px', fontSize: '9px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700,
                }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>
          </TaskbarBtn>

          {/* Volume */}
          <div ref={volRef} style={{ position: 'relative' }}>
            <TaskbarBtn title="Volume" onClick={() => setVolOpen(v => !v)} width={40}>
              <FluentIcon name={getVolumeIcon()} size={18} white />
            </TaskbarBtn>
            {volOpen && (
              <div style={{
                position: 'absolute', bottom: '52px', right: 0,
                background: 'rgba(32,32,32,0.95)', backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '16px', width: '200px',
                boxShadow: '0 -4px 20px rgba(0,0,0,0.3)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    onClick={() => updateSettings({ muted: !settings.muted })}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', padding: '4px' }}
                  >
                    <FluentIcon name={settings.muted ? 'speaker_off' : 'speaker_2'} size={20} white />
                  </button>
                  <input
                    type="range" min={0} max={100} value={settings.volume}
                    onChange={e => updateSettings({ volume: Number(e.target.value), muted: false })}
                    style={{ flex: 1, accentColor: '#0078D4' }}
                  />
                  <span style={{ fontSize: '12px', minWidth: '28px' }}>{settings.volume}</span>
                </div>
              </div>
            )}
          </div>

          {/* Network */}
          <TaskbarBtn title="Network: Connected" onClick={() => openWindow('settings', 'Settings', 'settings', { section: 'network' })} width={40}>
            <FluentIcon name="wifi_1" size={18} white />
          </TaskbarBtn>

          {/* Battery */}
          <TaskbarBtn title="Battery: 100%" width={36}>
            <FluentIcon name="battery_10" size={18} white />
          </TaskbarBtn>

          {/* Clock */}
          <button
            onClick={() => setNotifOpen(v => !v)}
            style={{
              background: 'none', border: 'none', color: '#fff', cursor: 'pointer',
              padding: '0 8px', height: '100%', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', lineHeight: 1.2,
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 400 }}>{fmt(time)}</div>
            <div style={{ fontSize: '11px', opacity: 0.85 }}>{fmtDate(time)}</div>
          </button>

          {/* Show desktop */}
          <div
            title="Show desktop"
            style={{
              width: '6px', height: '100%', borderLeft: '1px solid rgba(255,255,255,0.2)',
              cursor: 'pointer',
            }}
          />
        </div>
      </div>

      {/* Taskbar context menu */}
      {taskbarCtx && (
        <ContextMenu
          x={taskbarCtx.x}
          y={taskbarCtx.y - 90}
          dark={true}
          items={[
            { label: 'Restore', onClick: () => restoreWindow(taskbarCtx.winId) },
            { label: 'Minimize', onClick: () => minimizeWindow(taskbarCtx.winId) },
            { separator: true },
            { label: 'Close window', onClick: () => closeWindow(taskbarCtx.winId) },
          ]}
          onClose={() => setTaskbarCtx(null)}
        />
      )}
    </>
  );
}

function TaskbarBtn({ children, title, onClick, active, width = 44 }: {
  children: React.ReactNode; title: string; onClick?: () => void; active?: boolean; width?: number;
}) {
  const [hover, setHover] = useState(false);
  return (
    <button
      title={title}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width, height: '100%', border: 'none', cursor: 'pointer', color: '#fff',
        background: (hover || active) ? 'rgba(255,255,255,0.1)' : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 100ms', flexShrink: 0,
      }}
    >
      {children}
    </button>
  );
}

function TaskbarAppBtn({ appId, title, isRunning, isActive, onClick, onContextMenu }: {
  appId: string; title: string; isRunning: boolean; isActive: boolean;
  onClick: () => void; onContextMenu: (e: React.MouseEvent) => void;
}) {
  const [hover, setHover] = useState(false);
  return (
    <div
      title={title}
      onClick={onClick}
      onContextMenu={onContextMenu}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: '48px', height: '100%', cursor: 'pointer',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        background: hover || isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
        position: 'relative',
        transition: 'background 100ms',
      }}
    >
      <AppIcon iconName={appId} size={20} />
      {/* Active/running indicator */}
      {isRunning && (
        <div style={{
          position: 'absolute', bottom: '2px',
          width: isActive ? '16px' : '6px', height: '3px',
          background: '#0078D4', borderRadius: '2px',
          transition: 'width 150ms ease',
        }} />
      )}
    </div>
  );
}
