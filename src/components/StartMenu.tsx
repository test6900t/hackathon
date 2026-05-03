import { useOS } from '../os/OSContext';
import { useState, useEffect, useRef } from 'react';
import { FluentIcon } from './Window';
import { AppIcon } from './AppIcon';

const ALL_APPS = [
  { appId: 'about', name: 'About Error64', icon: 'info' },
  { appId: 'browser', name: 'Error64 Browser', icon: 'globe' },
  { appId: 'calendar', name: 'Calendar', icon: 'calendar_ltr' },
  { appId: 'camera', name: 'Camera', icon: 'camera' },
  { appId: 'calculator', name: 'Calculator', icon: 'calculator' },
  { appId: 'charmap', name: 'Character Map', icon: 'text_font' },
  { appId: 'cmd', name: 'Command Prompt', icon: 'prompt' },
  { appId: 'controlpanel', name: 'Control Panel', icon: 'apps_list' },
  { appId: 'diskcleanup', name: 'Disk Cleanup', icon: 'hard_drive' },
  { appId: 'eventviewer', name: 'Event Viewer', icon: 'history' },
  { appId: 'explorer', name: 'File Explorer', icon: 'folder' },
  { appId: 'feedback', name: 'Feedback Hub', icon: 'chat_help' },
  { appId: 'mail', name: 'Mail', icon: 'mail' },
  { appId: 'magnifier', name: 'Magnifier', icon: 'zoom_in' },
  { appId: 'mediaplayer', name: 'Media Player', icon: 'play_circle' },
  { appId: 'minecraft', name: 'Minecraft Classic', icon: 'cube' },
  { appId: 'msstore', name: 'Microsoft Store', icon: 'store_microsoft' },
  { appId: 'notepad', name: 'Notepad', icon: 'notepad' },
  { appId: 'osk', name: 'On-Screen Keyboard', icon: 'keyboard' },
  { appId: 'paint', name: 'Paint', icon: 'paint_bucket' },
  { appId: 'paint3d', name: 'Paint 3D', icon: 'cube' },
  { appId: 'photos', name: 'Photos', icon: 'image' },
  { appId: 'phone-link', name: 'Phone Link', icon: 'phone_laptop' },
  { appId: 'quick-assist', name: 'Quick Assist', icon: 'person_support' },
  { appId: 'settings', name: 'Settings', icon: 'settings' },
  { appId: 'snipping', name: 'Snipping Tool', icon: 'screenshot' },
  { appId: 'sticky', name: 'Sticky Notes', icon: 'note' },
  { appId: 'sysinfo', name: 'System Information', icon: 'desktop_computer' },
  { appId: 'taskmanager', name: 'Task Manager', icon: 'task_list_square_ltr' },
  { appId: 'win-security', name: 'Windows Security', icon: 'shield_checkmark' },
  { appId: 'wordpad', name: 'WordPad', icon: 'document' },
  { appId: 'wsl', name: 'Windows Subsystem for Linux', icon: 'terminal' },
];

const TILES = [
  { appId: 'mail', name: 'Mail', icon: 'mail', color: '#0078D4', size: 'medium' },
  { appId: 'calendar', name: 'Calendar', icon: 'calendar_ltr', color: '#0F4C81', size: 'medium' },
  { appId: 'photos', name: 'Photos', icon: 'image', color: '#8B4513', size: 'medium' },
  { appId: 'settings', name: 'Settings', icon: 'settings', color: '#5A5A5A', size: 'medium' },
  { appId: 'explorer', name: 'File Explorer', icon: 'folder', color: '#FF8C00', size: 'medium' },
  { appId: 'browser', name: 'Error64 Browser', icon: 'globe', color: '#2B7CD3', size: 'medium' },
  { appId: 'minecraft', name: 'Minecraft', icon: 'cube', color: '#5B9B43', size: 'medium' },
  { appId: 'notepad', name: 'Notepad', icon: 'notepad', color: '#3C8CBA', size: 'small' },
  { appId: 'calculator', name: 'Calc', icon: 'calculator', color: '#4C4C4C', size: 'small' },
  { appId: 'mediaplayer', name: 'Media Player', icon: 'play_circle', color: '#1D8348', size: 'small' },
  { appId: 'msstore', name: 'Store', icon: 'store_microsoft', color: '#0078D4', size: 'small' },
];

export function StartMenu() {
  const { startMenuOpen, setStartMenuOpen, openWindow, settings, setPhase, restart, shutdown } = useOS();
  const [query, setQuery] = useState('');
  const [showPower, setShowPower] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (startMenuOpen) { setQuery(''); setTimeout(() => inputRef.current?.focus(), 100); }
  }, [startMenuOpen]);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setStartMenuOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [setStartMenuOpen]);

  if (!startMenuOpen) return null;

  const filtered = query
    ? ALL_APPS.filter(a => a.name.toLowerCase().includes(query.toLowerCase()))
    : ALL_APPS;

  // Group alphabetically
  const groups: Record<string, typeof ALL_APPS> = {};
  filtered.forEach(app => {
    const letter = app.name[0].toUpperCase();
    if (!groups[letter]) groups[letter] = [];
    groups[letter].push(app);
  });

  const launch = (appId: string, name: string, icon: string) => {
    openWindow(appId, name, icon);
    setStartMenuOpen(false);
  };

  const today = new Date();

  return (
    <div
      ref={ref}
      style={{
        position: 'fixed', bottom: '48px', left: 0,
        width: '660px', height: '520px',
        background: settings.transparency ? 'rgba(25,25,25,0.92)' : 'rgba(25,25,25,1)',
        backdropFilter: settings.transparency ? 'blur(30px) saturate(180%)' : 'none',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 -4px 32px rgba(0,0,0,0.6)',
        display: 'flex', zIndex: 9998, color: '#fff',
        animation: 'startMenuOpen 120ms ease',
      }}
    >
      <style>{`@keyframes startMenuOpen { from{transform:translateY(8px);opacity:0} to{transform:translateY(0);opacity:1} }`}</style>

      {/* Left panel — slim */}
      <div style={{
        width: '52px', background: 'rgba(0,0,0,0.2)',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        paddingTop: '8px', paddingBottom: '8px', gap: '2px',
      }}>
        {/* User avatar */}
        <div style={{
          width: '36px', height: '36px', borderRadius: '50%',
          background: '#0078D4', display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '8px', cursor: 'pointer',
        }}
          title={settings.username}
          onClick={() => launch('settings', 'Settings', 'settings')}
        >
          <svg viewBox="0 0 24 24" fill="#fff" width="22" height="22"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
        </div>

        <SideBtn icon="folder_open" label="Documents" onClick={() => launch('explorer', 'File Explorer', 'folder')} white />
        <SideBtn icon="image" label="Pictures" onClick={() => launch('explorer', 'File Explorer', 'folder')} white />
        <SideBtn icon="settings" label="Settings" onClick={() => launch('settings', 'Settings', 'settings')} white />

        <div style={{ flex: 1 }} />

        {/* Power button */}
        <div style={{ position: 'relative' }}>
          <SideBtn icon="power" label="Power" onClick={() => setShowPower(v => !v)} white />
          {showPower && (
            <div style={{
              position: 'absolute', left: '52px', bottom: 0,
              background: 'rgba(30,30,30,0.98)', border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.4)', width: '140px', zIndex: 1,
            }}>
              {[
                { label: 'Sleep', icon: 'sleep' },
                { label: 'Restart', icon: 'arrow_clockwise', action: () => { setStartMenuOpen(false); restart(); } },
                { label: 'Shut down', icon: 'power', action: () => { setStartMenuOpen(false); shutdown(); } },
              ].map(item => (
                <div
                  key={item.label}
                  onClick={item.action}
                  style={{
                    padding: '10px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px',
                    fontSize: '13px',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <FluentIcon name={item.icon} size={16} white />
                  {item.label}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Middle panel — All Apps */}
      <div style={{ width: '280px', display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
        {/* Search */}
        <div style={{ padding: '12px 12px 8px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'rgba(255,255,255,0.1)', padding: '6px 10px', borderRadius: '2px',
          }}>
            <FluentIcon name="search" size={16} white />
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search apps..."
              style={{ background: 'transparent', border: 'none', outline: 'none', color: '#fff', flex: 1, fontSize: '13px' }}
            />
          </div>
        </div>

        <div style={{ fontSize: '11px', opacity: 0.6, padding: '4px 16px' }}>ALL APPS</div>

        {/* App list */}
        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '8px' }}>
          {query ? (
            filtered.map(app => (
              <AppListItem key={app.appId} app={app} onClick={() => launch(app.appId, app.name, app.icon)} />
            ))
          ) : (
            Object.entries(groups).sort(([a], [b]) => a.localeCompare(b)).map(([letter, apps]) => (
              <div key={letter}>
                <div style={{
                  padding: '4px 16px', fontSize: '13px', fontWeight: 600, color: '#0078D4',
                  background: 'rgba(0,0,0,0.2)',
                }}>
                  {letter}
                </div>
                {apps.map(app => (
                  <AppListItem key={app.appId} app={app} onClick={() => launch(app.appId, app.name, app.icon)} />
                ))}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right panel — Live Tiles */}
      <div style={{ flex: 1, padding: '12px', overflowY: 'auto' }}>
        <div style={{ fontSize: '11px', opacity: 0.6, marginBottom: '8px' }}>PINNED</div>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px',
          gridAutoRows: '68px',
        }}>
          {TILES.map(tile => {
            const isSmall = tile.size === 'small';
            const isCalendar = tile.appId === 'calendar';
            return (
              <div
                key={tile.appId}
                onClick={() => launch(tile.appId, tile.name, tile.icon)}
                style={{
                  background: tile.color, cursor: 'pointer',
                  display: 'flex', flexDirection: 'column',
                  padding: '8px',
                  gridColumn: isSmall ? 'span 1' : 'span 2',
                  gridRow: isSmall ? 'span 1' : 'span 1',
                  transition: 'filter 100ms',
                  position: 'relative', overflow: 'hidden',
                }}
                onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.1)')}
                onMouseLeave={e => (e.currentTarget.style.filter = 'brightness(1)')}
              >
                {isCalendar ? (
                  <>
                    <div style={{ fontSize: '28px', fontWeight: 100, lineHeight: 1 }}>
                      {today.getDate()}
                    </div>
                    <div style={{ fontSize: '11px', opacity: 0.85 }}>
                      {today.toLocaleDateString([], { weekday: 'short', month: 'short' })}
                    </div>
                  </>
                ) : (
                  <AppIcon iconName={tile.appId} size={isSmall ? 24 : 32} />
                )}
                <div style={{ marginTop: 'auto', fontSize: '11px', opacity: 0.9, fontWeight: 400 }}>
                  {tile.name}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ fontSize: '11px', opacity: 0.6, margin: '12px 0 8px' }}>USER</div>
        <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>{settings.username}</div>
        <div style={{ fontSize: '11px', opacity: 0.6 }}>Local Account</div>
      </div>
    </div>
  );
}

function SideBtn({ icon, label, onClick, white }: { icon: string; label: string; onClick: () => void; white?: boolean }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      title={label}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: '40px', height: '40px', border: 'none', cursor: 'pointer',
        background: hover ? 'rgba(255,255,255,0.1)' : 'transparent',
        color: '#fff', borderRadius: '4px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 100ms',
      }}
    >
      <FluentIcon name={icon} size={18} white={white} />
    </button>
  );
}

function AppListItem({ app, onClick }: { app: { appId: string; name: string; icon: string }; onClick: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: '8px 16px', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: '12px',
        background: hover ? 'rgba(255,255,255,0.1)' : 'transparent',
        fontSize: '13px',
      }}
    >
      <AppIcon iconName={app.appId} size={20} />
      <span>{app.name}</span>
    </div>
  );
}
