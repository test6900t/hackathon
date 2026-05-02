import { useOS } from '../os/OSContext';
import { useState, useEffect, useRef } from 'react';
import { VirtualFS } from '../os/VirtualFS';
import { FluentIcon } from './Window';

const ALL_APPS = [
  { appId: 'explorer', name: 'File Explorer', icon: 'folder' },
  { appId: 'notepad', name: 'Notepad', icon: 'notepad' },
  { appId: 'calculator', name: 'Calculator', icon: 'calculator' },
  { appId: 'cmd', name: 'Command Prompt', icon: 'prompt' },
  { appId: 'paint', name: 'Paint', icon: 'paint_bucket' },
  { appId: 'settings', name: 'Settings', icon: 'settings' },
  { appId: 'browser', name: 'Error64 Browser', icon: 'globe' },
  { appId: 'calendar', name: 'Calendar', icon: 'calendar_ltr' },
  { appId: 'mail', name: 'Mail', icon: 'mail' },
  { appId: 'taskmanager', name: 'Task Manager', icon: 'task_list_square_ltr' },
  { appId: 'controlpanel', name: 'Control Panel', icon: 'apps_list' },
  { appId: 'photos', name: 'Photos', icon: 'image' },
  { appId: 'camera', name: 'Camera', icon: 'camera' },
  { appId: 'mediaplayer', name: 'Media Player', icon: 'play_circle' },
  { appId: 'wordpad', name: 'WordPad', icon: 'document' },
  { appId: 'snipping', name: 'Snipping Tool', icon: 'screenshot' },
  { appId: 'charmap', name: 'Character Map', icon: 'text_font' },
  { appId: 'sysinfo', name: 'System Information', icon: 'desktop_computer' },
  { appId: 'diskcleanup', name: 'Disk Cleanup', icon: 'hard_drive' },
  { appId: 'osk', name: 'On-Screen Keyboard', icon: 'keyboard' },
  { appId: 'about', name: 'About Error64', icon: 'info' },
  { appId: 'msstore', name: 'Microsoft Store', icon: 'store_microsoft' },
];

const SETTINGS_SECTIONS = [
  { label: 'Display Settings', section: 'display' },
  { label: 'Sound Settings', section: 'sound' },
  { label: 'Network Settings', section: 'network' },
  { label: 'Personalization', section: 'personalization' },
  { label: 'Privacy', section: 'privacy' },
  { label: 'Update & Security', section: 'update' },
];

export function SearchOverlay() {
  const { searchOpen, setSearchOpen, openWindow } = useOS();
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('error64_searches') || '[]'); } catch { return []; }
  });
  const [fileResults, setFileResults] = useState<ReturnType<typeof VirtualFS.search>>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) { setQuery(''); setTimeout(() => inputRef.current?.focus(), 100); }
  }, [searchOpen]);

  useEffect(() => {
    if (query.length > 1) setFileResults(VirtualFS.search(query).slice(0, 5));
    else setFileResults([]);
  }, [query]);

  if (!searchOpen) return null;

  const appResults = query ? ALL_APPS.filter(a => a.name.toLowerCase().includes(query.toLowerCase())).slice(0, 5) : [];
  const settingResults = query ? SETTINGS_SECTIONS.filter(s => s.label.toLowerCase().includes(query.toLowerCase())).slice(0, 3) : [];

  const launch = (appId: string, name: string, icon: string, props?: Record<string, unknown>) => {
    const searches = [query, ...recentSearches.filter(s => s !== query)].slice(0, 10);
    setRecentSearches(searches);
    localStorage.setItem('error64_searches', JSON.stringify(searches));
    openWindow(appId, name, icon, props);
    setSearchOpen(false);
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, bottom: '48px', zIndex: 9997,
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(20px)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        paddingTop: '80px',
        animation: 'fadeIn 150ms ease',
      }}
      onClick={() => setSearchOpen(false)}
    >
      <div
        style={{ width: '580px', maxHeight: 'calc(100% - 120px)', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Search input */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
          padding: '12px 16px', marginBottom: '16px', backdropFilter: 'blur(10px)',
        }}>
          <FluentIcon name="search" size={20} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Type here to search"
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: '18px' }}
            onKeyDown={e => {
              if (e.key === 'Escape') setSearchOpen(false);
              if (e.key === 'Enter' && query) {
                launch('browser', 'Error64 Browser', 'globe', { url: `https://www.google.com/search?q=${encodeURIComponent(query)}` });
              }
            }}
          />
          {query && (
            <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', opacity: 0.7 }}>✕</button>
          )}
        </div>

        {/* No query: recent searches */}
        {!query && recentSearches.length > 0 && (
          <Section title="RECENT">
            {recentSearches.map(s => (
              <ResultItem key={s} icon="history" label={s} onClick={() => setQuery(s)} />
            ))}
          </Section>
        )}

        {/* No query: top apps */}
        {!query && (
          <Section title="TOP APPS">
            {ALL_APPS.slice(0, 6).map(app => (
              <ResultItem key={app.appId} icon={app.icon} label={app.name} onClick={() => launch(app.appId, app.name, app.icon)} />
            ))}
          </Section>
        )}

        {/* App results */}
        {appResults.length > 0 && (
          <Section title="APPS">
            {appResults.map(app => (
              <ResultItem key={app.appId} icon={app.icon} label={app.name} onClick={() => launch(app.appId, app.name, app.icon)} />
            ))}
          </Section>
        )}

        {/* File results */}
        {fileResults.length > 0 && (
          <Section title="FILES">
            {fileResults.map(f => (
              <ResultItem key={f.path} icon={f.type === 'folder' ? 'folder' : 'document'} label={f.name} subtitle={f.path} onClick={() => launch('explorer', 'File Explorer', 'folder', { path: f.parentPath })} />
            ))}
          </Section>
        )}

        {/* Settings results */}
        {settingResults.length > 0 && (
          <Section title="SETTINGS">
            {settingResults.map(s => (
              <ResultItem key={s.section} icon="settings" label={s.label} onClick={() => launch('settings', 'Settings', 'settings', { section: s.section })} />
            ))}
          </Section>
        )}

        {/* Web search */}
        {query && (
          <Section title="WEB">
            <ResultItem
              icon="globe"
              label={`Search the web for "${query}"`}
              onClick={() => launch('browser', 'Error64 Browser', 'globe', { url: `https://www.google.com/search?q=${encodeURIComponent(query)}` })}
            />
          </Section>
        )}
      </div>
      <style>{`@keyframes fadeIn { from{opacity:0} to{opacity:1} }`}</style>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', padding: '0 4px 6px', fontWeight: 600 }}>{title}</div>
      {children}
    </div>
  );
}

function ResultItem({ icon, label, subtitle, onClick }: { icon: string; label: string; subtitle?: string; onClick: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '8px 12px', cursor: 'pointer',
        background: hover ? 'rgba(255,255,255,0.1)' : 'transparent',
        color: '#fff', borderRadius: '2px',
      }}
    >
      <FluentIcon name={icon} size={20} />
      <div>
        <div style={{ fontSize: '13px' }}>{label}</div>
        {subtitle && <div style={{ fontSize: '11px', opacity: 0.6 }}>{subtitle}</div>}
      </div>
    </div>
  );
}
