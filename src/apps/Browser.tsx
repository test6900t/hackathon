import { useEffect, useRef, useState } from 'react';
import { AppIcon } from '../components/AppIcon';
import { FluentIcon } from '../components/Window';

interface BrowserProps {
  initialUrl?: string;
}

interface BrowserProfile {
  displayUrl: string;
  resolvedUrl: string;
  title: string;
  compatibilityNote?: string;
  label?: string;
}

interface Tab extends BrowserProfile {
  id: string;
  loading: boolean;
  history: string[];
  historyIndex: number;
}

const MINECRAFT_EMBED_URL = 'https://www.gameflare.com/embed/minecraft-classic/';

const BOOKMARKS = [
  { label: 'Google', url: 'https://www.google.com', icon: 'search' },
  { label: 'YouTube', url: 'https://www.youtube.com', icon: 'play_circle' },
  { label: 'Wikipedia', url: 'https://en.wikipedia.org', icon: 'book' },
  { label: 'GitHub', url: 'https://github.com', icon: 'terminal' },
  { label: 'Reddit', url: 'https://www.reddit.com', icon: 'chat_help' },
  { label: 'Minecraft Classic', url: 'error64://minecraft', icon: 'cube' },
];

const SPEED_DIAL = [
  { label: 'Google', url: 'https://www.google.com', color: '#4285f4', icon: 'search' },
  { label: 'YouTube', url: 'https://www.youtube.com', color: '#ff0000', icon: 'play_circle' },
  { label: 'Wikipedia', url: 'https://en.wikipedia.org', color: '#636466', icon: 'book' },
  { label: 'GitHub', url: 'https://github.com', color: '#24292f', icon: 'terminal' },
  { label: 'Reddit', url: 'https://www.reddit.com', color: '#ff4500', icon: 'chat_help' },
  { label: 'Minecraft', url: 'error64://minecraft', color: '#5b9b43', icon: 'cube', appIcon: 'minecraft' },
  { label: 'MDN', url: 'https://developer.mozilla.org', color: '#1976d2', icon: 'book' },
  { label: 'Stack Overflow', url: 'https://stackoverflow.com', color: '#f58025', icon: 'clipboard_paste' },
];

function getDomainLabel(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function normalizeInput(raw: string): string {
  const value = raw.trim();
  if (!value) return '';
  if (value.startsWith('error64://')) return value.toLowerCase();
  if (value.startsWith('http://') || value.startsWith('https://')) return value;
  if (value.includes('.') && !value.includes(' ')) return `https://${value}`;
  return `https://duckduckgo.com/?q=${encodeURIComponent(value)}`;
}

function resolveBrowserProfile(raw: string): BrowserProfile {
  const normalized = normalizeInput(raw);

  if (!normalized) {
    return {
      displayUrl: '',
      resolvedUrl: '',
      title: 'New Tab',
    };
  }

  if (normalized === 'error64://minecraft' || normalized.toLowerCase() === 'minecraft') {
    return {
      displayUrl: 'error64://minecraft',
      resolvedUrl: MINECRAFT_EMBED_URL,
      title: 'Minecraft Classic',
      label: 'Embedded Game',
      compatibilityNote: 'Minecraft is loaded from a public embed page that is designed to run inside an iframe.',
    };
  }

  const youtubeMatch = normalized.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^?&/]+)/i);
  if (youtubeMatch?.[1]) {
    const videoId = youtubeMatch[1];
    return {
      displayUrl: normalized,
      resolvedUrl: `https://www.youtube.com/embed/${videoId}`,
      title: 'YouTube Video',
      label: 'Compatibility Embed',
      compatibilityNote: 'Watch URLs are converted to the YouTube embed player so they work inside the browser window.',
    };
  }

  const isSearch = normalized.startsWith('https://duckduckgo.com/?q=');
  return {
    displayUrl: normalized,
    resolvedUrl: normalized,
    title: isSearch ? 'Search Results' : getDomainLabel(normalized),
    label: isSearch ? 'Embedded Search' : 'Frame Access Enabled',
    compatibilityNote: isSearch
      ? 'Queries are routed to DuckDuckGo because it is typically more iframe-friendly than Google.'
      : 'This browser no longer sandboxes iframes, but some sites still block embedding with CSP or X-Frame-Options. If the page stays blank, open it in a separate tab.',
  };
}

function createTab(raw = ''): Tab {
  const profile = resolveBrowserProfile(raw);
  return {
    id: `tab-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    ...profile,
    loading: Boolean(profile.resolvedUrl),
    history: profile.displayUrl ? [profile.displayUrl] : [],
    historyIndex: profile.displayUrl ? 0 : -1,
  };
}

export function Browser({ initialUrl = '' }: BrowserProps) {
  const initialTab = createTab(initialUrl);
  const [tabs, setTabs] = useState<Tab[]>([initialTab]);
  const [activeTab, setActiveTab] = useState(initialTab.id);
  const [address, setAddress] = useState(initialUrl);
  const [editingAddress, setEditingAddress] = useState(!initialUrl);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const currentTab = tabs.find((tab) => tab.id === activeTab) || tabs[0];

  useEffect(() => {
    if (!currentTab) return;
    setAddress(currentTab.displayUrl);
  }, [currentTab]);

  const setActiveTabState = (id: string) => {
    const tab = tabs.find((item) => item.id === id);
    setActiveTab(id);
    setEditingAddress(!tab?.displayUrl);
    if (tab) setAddress(tab.displayUrl);
  };

  const updateTab = (tabId: string, updater: (tab: Tab) => Tab) => {
    setTabs((prev) => prev.map((tab) => (tab.id === tabId ? updater(tab) : tab)));
  };

  const navigate = (rawUrl: string, options?: { historyMode?: 'push' | 'replace' | 'none' }) => {
    const profile = resolveBrowserProfile(rawUrl);
    if (!profile.resolvedUrl) return;

    updateTab(activeTab, (tab) => {
      let history = tab.history;
      let historyIndex = tab.historyIndex;

      if (options?.historyMode === 'push' || (!options?.historyMode && profile.displayUrl)) {
        history = [...tab.history.slice(0, tab.historyIndex + 1), profile.displayUrl];
        historyIndex = history.length - 1;
      } else if (options?.historyMode === 'replace' && historyIndex >= 0) {
        history = tab.history.map((item, index) => (index === historyIndex ? profile.displayUrl : item));
      }

      return {
        ...tab,
        ...profile,
        loading: true,
        history,
        historyIndex,
      };
    });

    setAddress(profile.displayUrl);
    setEditingAddress(false);
  };

  const addTab = () => {
    const newTab = createTab();
    setTabs((prev) => [...prev, newTab]);
    setActiveTab(newTab.id);
    setAddress('');
    setEditingAddress(true);
  };

  const closeTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tabs.length === 1) {
      const replacement = createTab();
      setTabs([replacement]);
      setActiveTab(replacement.id);
      setAddress('');
      setEditingAddress(true);
      return;
    }

    const remaining = tabs.filter((tab) => tab.id !== id);
    setTabs(remaining);
    if (activeTab === id) {
      setActiveTabState(remaining[remaining.length - 1].id);
    }
  };

  const goBack = () => {
    if (!currentTab || currentTab.historyIndex <= 0) return;
    const nextIndex = currentTab.historyIndex - 1;
    const target = currentTab.history[nextIndex];
    const profile = resolveBrowserProfile(target);
    updateTab(activeTab, (tab) => ({
      ...tab,
      ...profile,
      loading: true,
      historyIndex: nextIndex,
    }));
  };

  const goForward = () => {
    if (!currentTab || currentTab.historyIndex >= currentTab.history.length - 1) return;
    const nextIndex = currentTab.historyIndex + 1;
    const target = currentTab.history[nextIndex];
    const profile = resolveBrowserProfile(target);
    updateTab(activeTab, (tab) => ({
      ...tab,
      ...profile,
      loading: true,
      historyIndex: nextIndex,
    }));
  };

  const refresh = () => {
    if (!currentTab?.displayUrl) return;
    navigate(currentTab.displayUrl, { historyMode: 'replace' });
  };

  const goHome = () => {
    updateTab(activeTab, (tab) => ({
      ...tab,
      ...createTab(),
      id: tab.id,
      history: tab.history,
      historyIndex: tab.historyIndex,
    }));
    setAddress('');
    setEditingAddress(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') navigate(address);
    if (e.key === 'Escape') {
      setAddress(currentTab?.displayUrl || '');
      setEditingAddress(false);
    }
  };

  const showNewTabPage = !currentTab?.resolvedUrl;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#f5f7fb', color: '#111827' }}>
      <div style={{ display: 'flex', background: '#dde3ed', alignItems: 'flex-end', padding: '6px 6px 0', minHeight: '42px', flexShrink: 0, gap: '4px' }}>
        {tabs.map((tab) => {
          const active = tab.id === activeTab;
          return (
            <div
              key={tab.id}
              onClick={() => setActiveTabState(tab.id)}
              style={{
                maxWidth: '220px',
                minWidth: '96px',
                height: '34px',
                display: 'flex',
                alignItems: 'center',
                padding: '0 10px',
                gap: '8px',
                cursor: 'pointer',
                fontSize: '12px',
                background: active ? '#f8fbff' : 'rgba(255,255,255,0.45)',
                borderRadius: '10px 10px 0 0',
                border: active ? '1px solid rgba(15,23,42,0.08)' : '1px solid transparent',
                borderBottomColor: active ? '#f8fbff' : 'transparent',
                flex: '1 1 auto',
                overflow: 'hidden',
              }}
            >
              <FluentIcon name="globe" size={14} color={active ? '#2563eb' : '#475569'} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{tab.title}</span>
              <button
                onClick={(e) => closeTab(tab.id, e)}
                style={iconButtonStyle}
                title="Close tab"
              >
                <FluentIcon name="close" size={12} color="#64748b" />
              </button>
            </div>
          );
        })}
        <button onClick={addTab} style={{ ...iconButtonStyle, width: '34px', height: '34px', marginBottom: '2px' }} title="New tab">
          <FluentIcon name="plus" size={16} color="#334155" />
        </button>
      </div>

      <div style={{ display: 'flex', gap: '6px', padding: '8px 10px', background: '#f8fbff', borderBottom: '1px solid #dbe3ee', alignItems: 'center', flexShrink: 0 }}>
        <button onClick={goBack} disabled={!currentTab || currentTab.historyIndex <= 0} style={{ ...navBtn, opacity: !currentTab || currentTab.historyIndex <= 0 ? 0.35 : 1 }}>
          <FluentIcon name="arrow_left" size={16} color="#334155" />
        </button>
        <button onClick={goForward} disabled={!currentTab || currentTab.historyIndex >= currentTab.history.length - 1} style={{ ...navBtn, opacity: !currentTab || currentTab.historyIndex >= currentTab.history.length - 1 ? 0.35 : 1 }}>
          <FluentIcon name="arrow_right" size={16} color="#334155" />
        </button>
        <button onClick={refresh} style={navBtn} title="Refresh">
          <FluentIcon name="refresh" size={16} color="#334155" />
        </button>
        <button onClick={goHome} style={navBtn} title="Home">
          <FluentIcon name="home" size={16} color="#334155" />
        </button>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: '#ffffff', border: '1px solid #bfd2ef', boxShadow: 'inset 0 0 0 1px rgba(37,99,235,0.08)', padding: '0 10px', gap: '8px', borderRadius: '999px', minHeight: '38px' }}>
          <FluentIcon name={currentTab?.resolvedUrl ? 'lock' : 'search'} size={15} color={currentTab?.resolvedUrl ? '#16a34a' : '#64748b'} />
          {editingAddress ? (
            <input
              autoFocus
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={() => setEditingAddress(false)}
              style={{ flex: 1, border: 'none', outline: 'none', fontSize: '13px', background: 'transparent', color: '#0f172a' }}
            />
          ) : (
            <div onClick={() => setEditingAddress(true)} style={{ flex: 1, fontSize: '13px', cursor: 'text', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: currentTab?.displayUrl ? '#0f172a' : '#64748b' }}>
              {currentTab?.displayUrl || 'Search or enter a web address'}
            </div>
          )}
          {address && (
            <button onClick={() => { setAddress(''); setEditingAddress(true); }} style={iconButtonStyle} title="Clear">
              <FluentIcon name="close" size={12} color="#64748b" />
            </button>
          )}
        </div>

        <button onClick={() => setShowBookmarks((value) => !value)} title="Bookmarks" style={{ ...navBtn, background: showBookmarks ? '#dbeafe' : '#ffffff' }}>
          <FluentIcon name="bookmark" size={16} color={showBookmarks ? '#2563eb' : '#334155'} />
        </button>
        <button title="Downloads" style={navBtn}>
          <FluentIcon name="download" size={16} color="#334155" />
        </button>
        <button
          title="Open in new tab"
          style={navBtn}
          onClick={() => currentTab?.resolvedUrl && window.open(currentTab.resolvedUrl, '_blank', 'noopener,noreferrer')}
        >
          <FluentIcon name="globe" size={16} color="#334155" />
        </button>
      </div>

      {showBookmarks && (
        <div style={{ display: 'flex', gap: '6px', padding: '6px 10px', background: '#eef4fb', borderBottom: '1px solid #dbe3ee', flexShrink: 0, overflowX: 'auto' }}>
          {BOOKMARKS.map((bookmark) => (
            <button
              key={bookmark.url}
              onClick={() => navigate(bookmark.url)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 10px',
                background: '#ffffff',
                border: '1px solid #dbe3ee',
                borderRadius: '999px',
                cursor: 'pointer',
                fontSize: '12px',
                whiteSpace: 'nowrap',
              }}
            >
              <FluentIcon name={bookmark.icon} size={14} color="#2563eb" />
              {bookmark.label}
            </button>
          ))}
        </div>
      )}

      {!showNewTabPage && currentTab?.compatibilityNote && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '8px 12px', background: '#fff7ed', borderBottom: '1px solid #fed7aa', fontSize: '12px', color: '#9a3412', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
            <FluentIcon name="info" size={14} color="#c2410c" />
            <span style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{currentTab.label || 'Compatibility'}</span>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentTab.compatibilityNote}</span>
          </div>
          <button
            onClick={() => window.open(currentTab.resolvedUrl, '_blank', 'noopener,noreferrer')}
            style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #fdba74', background: '#ffffff', color: '#9a3412', cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            Open Source Page
          </button>
        </div>
      )}

      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#e5eef9' }}>
        {showNewTabPage ? (
          <NewTabPage onNavigate={navigate} />
        ) : (
          <>
            {currentTab?.loading && (
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #2563eb, #22c55e, #2563eb)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s linear infinite', zIndex: 10 }} />
            )}
            <iframe
              ref={iframeRef}
              src={currentTab?.resolvedUrl}
              title={currentTab?.title || 'Browser content'}
              allow="accelerometer; autoplay; clipboard-read; clipboard-write; encrypted-media; fullscreen; gamepad; geolocation; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
              style={{ width: '100%', height: '100%', border: 'none', background: '#ffffff' }}
              onLoad={() => {
                setTabs((prev) => prev.map((tab) => {
                  if (tab.id !== activeTab) return tab;
                  let nextTitle = tab.title;
                  try {
                    nextTitle = iframeRef.current?.contentDocument?.title || tab.title || getDomainLabel(tab.resolvedUrl);
                  } catch {
                    nextTitle = tab.title || getDomainLabel(tab.resolvedUrl);
                  }
                  return { ...tab, loading: false, title: nextTitle };
                }));
              }}
            />
          </>
        )}
      </div>

      <style>{`@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
    </div>
  );
}

function NewTabPage({ onNavigate }: { onNavigate: (url: string) => void }) {
  const [query, setQuery] = useState('');

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at top, #dbeafe 0%, #f8fbff 38%, #eff6ff 100%)',
        color: '#0f172a',
        padding: '32px',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '72px', height: '72px', borderRadius: '22px', background: '#ffffff', boxShadow: '0 16px 40px rgba(37,99,235,0.18)', marginBottom: '16px' }}>
          <FluentIcon name="globe" size={30} color="#2563eb" />
        </div>
        <h1 style={{ fontWeight: 300, fontSize: '30px', margin: 0 }}>Error64 Browser</h1>
        <p style={{ margin: '8px 0 0', color: '#475569', fontSize: '14px' }}>
          Embedded browsing with compatibility helpers for framed sites.
        </p>
      </div>

      <div style={{ display: 'flex', width: 'min(680px, 100%)', background: '#ffffff', marginBottom: '36px', borderRadius: '999px', overflow: 'hidden', boxShadow: '0 10px 32px rgba(15,23,42,0.08)', border: '1px solid #dbeafe' }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') onNavigate(query); }}
          placeholder="Search the web or open a URL"
          style={{ flex: 1, padding: '14px 22px', border: 'none', outline: 'none', fontSize: '14px', background: 'transparent', color: '#0f172a' }}
        />
        <button onClick={() => onNavigate(query)} style={{ padding: '0 22px', background: '#2563eb', border: 'none', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center' }}>
          <FluentIcon name="search" size={18} color="#ffffff" />
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(136px, 1fr))', gap: '14px', width: 'min(760px, 100%)' }}>
        {SPEED_DIAL.map((site) => (
          <button
            key={site.url}
            onClick={() => onNavigate(site.url)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              padding: '16px 14px',
              borderRadius: '20px',
              border: '1px solid rgba(148,163,184,0.18)',
              background: 'rgba(255,255,255,0.78)',
              boxShadow: '0 10px 28px rgba(148,163,184,0.12)',
            }}
          >
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: site.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.12)' }}>
              {site.appIcon ? <AppIcon iconName={site.appIcon} size={28} /> : <FluentIcon name={site.icon} size={24} color="#ffffff" />}
            </div>
            <span style={{ fontSize: '12px', color: '#334155' }}>{site.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

const navBtn: React.CSSProperties = {
  background: '#ffffff',
  border: '1px solid #dbe3ee',
  cursor: 'pointer',
  width: '36px',
  height: '36px',
  borderRadius: '10px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const iconButtonStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  padding: '4px',
  borderRadius: '999px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};
