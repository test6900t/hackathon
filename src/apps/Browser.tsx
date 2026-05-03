import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { AppIcon } from '../components/AppIcon';
import { FluentIcon } from '../components/Window';

interface BrowserProps {
  initialUrl?: string;
}

type BrowserMode = 'live' | 'reader';

interface BrowserProfile {
  displayUrl: string;
  resolvedUrl: string;
  externalUrl: string;
  title: string;
  compatibilityNote?: string;
  label?: string;
  readerUrl?: string;
  preferredMode?: BrowserMode;
}

interface Tab extends BrowserProfile {
  id: string;
  mode: BrowserMode;
  loading: boolean;
  readerLoading: boolean;
  readerContent: string;
  readerError: string;
  history: string[];
  historyIndex: number;
}

const READER_PREFIX = 'https://r.jina.ai/';
const RICKROLL_VIDEO_ID = 'dQw4w9WgXcQ';

const BOOKMARKS = [
  { label: 'Wikipedia', url: 'https://en.wikipedia.org', icon: 'book' },
  { label: 'YouTube', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', icon: 'play_circle' },
];

const SPEED_DIAL = [
  { label: 'Wikipedia', url: 'https://en.wikipedia.org', color: '#636466', icon: 'book' },
  { label: 'YouTube', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', color: '#ff0000', icon: 'play_circle' },
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

function getReaderUrl(url: string) {
  return `${READER_PREFIX}${url}`;
}

function resolveBrowserProfile(raw: string): BrowserProfile {
  const normalized = normalizeInput(raw);

  if (!normalized) {
    return {
      displayUrl: '',
      resolvedUrl: '',
      externalUrl: '',
      title: 'New Tab',
      preferredMode: 'live',
    };
  }

  const isWikipedia = normalized.startsWith('https://en.wikipedia.org');
  if (isWikipedia) {
    return {
      displayUrl: normalized,
      resolvedUrl: normalized,
      externalUrl: normalized,
      title: 'Wikipedia',
      label: 'Wikipedia',
      preferredMode: 'live',
      readerUrl: getReaderUrl(normalized),
      compatibilityNote: 'Wiki mode allows reading wikipedia content.',
    };
  }

  const youtubeMatch = normalized.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^?&/]+)/i);
  if (youtubeMatch?.[1] || normalized.includes('youtube')) {
    return {
      displayUrl: normalized,
      resolvedUrl: `https://www.youtube-nocookie.com/embed/${RICKROLL_VIDEO_ID}?autoplay=1`,
      externalUrl: `https://www.youtube.com/watch?v=${RICKROLL_VIDEO_ID}`,
      title: 'Never Gonna Give You Up',
      label: 'YouTube',
      preferredMode: 'live',
      readerUrl: getReaderUrl(`https://www.youtube.com/watch?v=${RICKROLL_VIDEO_ID}`),
      compatibilityNote: 'Never gonna let you down.',
    };
  }

  return {
    displayUrl: normalized,
    resolvedUrl: normalized,
    externalUrl: normalized,
    title: getDomainLabel(normalized),
    label: 'Live',
    preferredMode: 'live',
    readerUrl: getReaderUrl(normalized),
    compatibilityNote: 'Loading...',
  };
}

function createTab(raw = ''): Tab {
  const profile = resolveBrowserProfile(raw);
  const mode = profile.preferredMode || 'live';

  return {
    id: `tab-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    ...profile,
    mode,
    loading: mode === 'live' && Boolean(profile.resolvedUrl),
    readerLoading: mode === 'reader' && Boolean(profile.readerUrl),
    readerContent: '',
    readerError: '',
    history: profile.displayUrl ? [profile.displayUrl] : [],
    historyIndex: profile.displayUrl ? 0 : -1,
  };
}

function stripReaderMetadata(content: string) {
  const lines = content.split('\n');
  let startIndex = 0;

  while (startIndex < lines.length && /^(Title|URL|Markdown Content):/i.test(lines[startIndex])) {
    startIndex += 1;
  }

  while (startIndex < lines.length && !lines[startIndex].trim()) {
    startIndex += 1;
  }

  return lines.slice(startIndex).join('\n').trim() || content.trim();
}

export function Browser({ initialUrl = '' }: BrowserProps) {
  const initialTab = useMemo(() => createTab(initialUrl), [initialUrl]);
  const [tabs, setTabs] = useState<Tab[]>([initialTab]);
  const [activeTab, setActiveTab] = useState(initialTab.id);
  const [address, setAddress] = useState(initialUrl);
  const [editingAddress, setEditingAddress] = useState(!initialUrl);
  const [showBookmarks, setShowBookmarks] = useState(false);

  const currentTab = tabs.find((tab) => tab.id === activeTab) || tabs[0];
  const showNewTabPage = !currentTab?.resolvedUrl;

  useEffect(() => {
    if (!currentTab) return;
    setAddress(currentTab.displayUrl);
  }, [currentTab]);

  useEffect(() => {
    if (!currentTab || currentTab.mode !== 'reader' || !currentTab.readerUrl || currentTab.readerContent) return;

    const controller = new AbortController();
    const tabId = currentTab.id;

    setTabs((prev) => prev.map((tab) => (
      tab.id === tabId ? { ...tab, readerLoading: true, readerError: '' } : tab
    )));

    fetch(currentTab.readerUrl, { signal: controller.signal, cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Reader mode failed with status ${response.status}.`);
        const text = await response.text();
        setTabs((prev) => prev.map((tab) => (
          tab.id === tabId
            ? { ...tab, readerLoading: false, readerContent: stripReaderMetadata(text), readerError: '' }
            : tab
        )));
      })
      .catch((error: Error) => {
        if (controller.signal.aborted) return;
        setTabs((prev) => prev.map((tab) => (
          tab.id === tabId
            ? { ...tab, readerLoading: false, readerError: error.message || 'Reader mode could not load this page.' }
            : tab
        )));
      });

    return () => controller.abort();
  }, [currentTab]);

  const updateTab = (tabId: string, updater: (tab: Tab) => Tab) => {
    setTabs((prev) => prev.map((tab) => (tab.id === tabId ? updater(tab) : tab)));
  };

  const setActiveTabState = (id: string) => {
    const tab = tabs.find((item) => item.id === id);
    setActiveTab(id);
    setEditingAddress(!tab?.displayUrl);
    if (tab) setAddress(tab.displayUrl);
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

      const nextMode = profile.preferredMode || tab.mode;

      return {
        ...tab,
        ...profile,
        mode: nextMode,
        loading: nextMode === 'live',
        readerLoading: nextMode === 'reader',
        readerContent: '',
        readerError: '',
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

  const closeTab = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();

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
      mode: profile.preferredMode || tab.mode,
      loading: (profile.preferredMode || tab.mode) === 'live',
      readerLoading: (profile.preferredMode || tab.mode) === 'reader',
      readerContent: '',
      readerError: '',
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
      mode: profile.preferredMode || tab.mode,
      loading: (profile.preferredMode || tab.mode) === 'live',
      readerLoading: (profile.preferredMode || tab.mode) === 'reader',
      readerContent: '',
      readerError: '',
      historyIndex: nextIndex,
    }));
  };

  const refresh = () => {
    if (!currentTab?.displayUrl) return;
    updateTab(activeTab, (tab) => ({
      ...tab,
      loading: tab.mode === 'live',
      readerLoading: tab.mode === 'reader',
      readerContent: tab.mode === 'reader' ? '' : tab.readerContent,
      readerError: '',
    }));
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

  const setMode = (mode: BrowserMode) => {
    if (!currentTab || mode === currentTab.mode) return;
    updateTab(activeTab, (tab) => ({
      ...tab,
      mode,
      loading: mode === 'live',
      readerLoading: mode === 'reader' && !tab.readerContent,
      readerError: '',
      readerContent: mode === 'reader' ? tab.readerContent : tab.readerContent,
    }));
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') navigate(address);
    if (event.key === 'Escape') {
      setAddress(currentTab?.displayUrl || '');
      setEditingAddress(false);
    }
  };

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
              <FluentIcon name={tab.mode === 'reader' ? 'book' : 'globe'} size={14} color={active ? '#2563eb' : '#475569'} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{tab.title}</span>
              <button onClick={(event) => closeTab(tab.id, event)} style={iconButtonStyle} title="Close tab">
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
              onChange={(event) => setAddress(event.target.value)}
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

        {!showNewTabPage && (
          <div style={{ display: 'flex', alignItems: 'center', background: '#ffffff', border: '1px solid #dbe3ee', borderRadius: '999px', padding: '2px', gap: '2px' }}>
            <ModeButton label="Live" icon="globe" active={currentTab?.mode === 'live'} onClick={() => setMode('live')} />
            <ModeButton label="Reader" icon="book" active={currentTab?.mode === 'reader'} onClick={() => setMode('reader')} />
          </div>
        )}

        <button onClick={() => setShowBookmarks((value) => !value)} title="Bookmarks" style={{ ...navBtn, background: showBookmarks ? '#dbeafe' : '#ffffff' }}>
          <FluentIcon name="bookmark" size={16} color={showBookmarks ? '#2563eb' : '#334155'} />
        </button>
        <button title="Downloads" style={navBtn}>
          <FluentIcon name="download" size={16} color="#334155" />
        </button>
        <button
          title="Open source page"
          style={navBtn}
          onClick={() => currentTab?.externalUrl && window.open(currentTab.externalUrl, '_blank', 'noopener,noreferrer')}
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '8px 12px', background: currentTab.mode === 'reader' ? '#eff6ff' : '#fff7ed', borderBottom: `1px solid ${currentTab.mode === 'reader' ? '#bfdbfe' : '#fed7aa'}`, fontSize: '12px', color: currentTab.mode === 'reader' ? '#1d4ed8' : '#9a3412', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
            <FluentIcon name={currentTab.mode === 'reader' ? 'book' : 'info'} size={14} color={currentTab.mode === 'reader' ? '#2563eb' : '#c2410c'} />
            <span style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{currentTab.mode === 'reader' ? 'Reader Mode' : currentTab.label || 'Compatibility'}</span>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {currentTab.mode === 'reader'
                ? 'Reader mode mirrors the page content through Jina AI Reader so blocked sites still open inside Error64 Browser.'
                : currentTab.compatibilityNote}
            </span>
          </div>
          <button
            onClick={() => currentTab.mode === 'reader' ? setMode('live') : setMode('reader')}
            style={{
              padding: '6px 10px',
              borderRadius: '8px',
              border: `1px solid ${currentTab.mode === 'reader' ? '#93c5fd' : '#fdba74'}`,
              background: '#ffffff',
              color: currentTab.mode === 'reader' ? '#1d4ed8' : '#9a3412',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {currentTab.mode === 'reader' ? 'Try Live Mode' : 'Open in Reader'}
          </button>
        </div>
      )}

      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#e5eef9' }}>
        {showNewTabPage ? (
          <NewTabPage onNavigate={navigate} />
        ) : currentTab?.mode === 'reader' ? (
          <ReaderPane
            tab={currentTab}
            onOpenSource={() => currentTab.externalUrl && window.open(currentTab.externalUrl, '_blank', 'noopener,noreferrer')}
            onRetry={() => updateTab(currentTab.id, (tab) => ({ ...tab, readerLoading: true, readerContent: '', readerError: '' }))}
          />
        ) : (
          <>
            {currentTab?.loading && (
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #2563eb, #22c55e, #2563eb)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s linear infinite', zIndex: 10 }} />
            )}
            <iframe
              key={`${currentTab.id}-${currentTab.mode}-${currentTab.resolvedUrl}`}
              src={currentTab?.resolvedUrl}
              title={currentTab?.title || 'Browser content'}
              allow="accelerometer; autoplay; clipboard-read; clipboard-write; encrypted-media; fullscreen; gamepad; geolocation; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
              style={{ width: '100%', height: '100%', border: 'none', background: '#ffffff' }}
              onLoad={() => {
                setTabs((prev) => prev.map((tab) => (
                  tab.id === activeTab ? { ...tab, loading: false } : tab
                )));
              }}
            />
          </>
        )}
      </div>

      <style>{`@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
    </div>
  );
}

function ModeButton({ label, icon, active, onClick }: { label: string; icon: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        border: 'none',
        background: active ? '#dbeafe' : 'transparent',
        color: active ? '#1d4ed8' : '#475569',
        cursor: 'pointer',
        borderRadius: '999px',
        padding: '6px 10px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '12px',
      }}
    >
      <FluentIcon name={icon} size={14} color={active ? '#1d4ed8' : '#475569'} />
      {label}
    </button>
  );
}

function ReaderPane({ tab, onOpenSource, onRetry }: { tab: Tab; onOpenSource: () => void; onRetry: () => void }) {
  if (tab.readerLoading && !tab.readerContent) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fbff', color: '#334155' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <FluentIcon name="book" size={28} color="#2563eb" />
          <div style={{ fontSize: '14px', fontWeight: 600 }}>Loading Reader mode</div>
          <div style={{ fontSize: '12px', color: '#64748b' }}>{tab.displayUrl}</div>
        </div>
      </div>
    );
  }

  if (tab.readerError) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fbff', color: '#334155', padding: '32px' }}>
        <div style={{ maxWidth: '540px', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', width: '56px', height: '56px', borderRadius: '16px', alignItems: 'center', justifyContent: 'center', background: '#dbeafe', marginBottom: '16px' }}>
            <FluentIcon name="warning" size={24} color="#2563eb" />
          </div>
          <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>Reader mode could not load this page</div>
          <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '18px' }}>{tab.readerError}</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
            <button onClick={onRetry} style={readerActionPrimary}>Try again</button>
            <button onClick={onOpenSource} style={readerActionSecondary}>Open source page</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', overflow: 'auto', background: '#f8fbff' }}>
      <div style={{ maxWidth: '980px', margin: '0 auto', padding: '28px 32px 40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '22px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <FluentIcon name="book" size={18} color="#2563eb" />
              <span style={{ fontSize: '12px', color: '#2563eb', fontWeight: 700, letterSpacing: '0.04em' }}>READER MODE</span>
            </div>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 300, color: '#0f172a' }}>{tab.title}</h1>
            <div style={{ marginTop: '8px', fontSize: '13px', color: '#64748b' }}>{tab.displayUrl}</div>
          </div>
          <button onClick={onOpenSource} style={readerActionSecondary}>
            <FluentIcon name="globe" size={14} color="#2563eb" />
            Open source page
          </button>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #dbe3ee', borderRadius: '18px', boxShadow: '0 16px 40px rgba(148,163,184,0.12)', padding: '24px 26px' }}>
          <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.65, color: '#1e293b', fontSize: '14px', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
            {tab.readerContent || 'No readable content was returned for this page.'}
          </div>
        </div>
      </div>
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
          Live pages, embedded helpers, and Reader mode for sites that block iframes.
        </p>
      </div>

      <div style={{ display: 'flex', width: 'min(680px, 100%)', background: '#ffffff', marginBottom: '20px', borderRadius: '999px', overflow: 'hidden', boxShadow: '0 10px 32px rgba(15,23,42,0.08)', border: '1px solid #dbeafe' }}>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => { if (event.key === 'Enter') onNavigate(query); }}
          placeholder="Search the web or open a URL"
          style={{ flex: 1, padding: '14px 22px', border: 'none', outline: 'none', fontSize: '14px', background: 'transparent', color: '#0f172a' }}
        />
        <button onClick={() => onNavigate(query)} style={{ padding: '0 22px', background: '#2563eb', border: 'none', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center' }}>
          <FluentIcon name="search" size={18} color="#ffffff" />
        </button>
      </div>

<div style={{ fontSize: '12px', color: '#64748b', marginBottom: '36px' }}>
        Sites that block embedding can still open in Reader mode inside the browser window.
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
              background: site.color,
              boxShadow: '0 10px 28px rgba(148,163,184,0.12)',
            }}
          >
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.1)' }}>
              <FluentIcon name={site.icon} size={24} color={site.color} />
            </div>
            <span style={{ fontSize: '12px', color: '#fff', fontWeight: 600, textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>{site.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

const navBtn: CSSProperties = {
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

const iconButtonStyle: CSSProperties = {
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

const readerActionPrimary: CSSProperties = {
  border: 'none',
  background: '#2563eb',
  color: '#ffffff',
  borderRadius: '10px',
  padding: '10px 14px',
  cursor: 'pointer',
  fontSize: '13px',
};

const readerActionSecondary: CSSProperties = {
  border: '1px solid #bfdbfe',
  background: '#ffffff',
  color: '#2563eb',
  borderRadius: '10px',
  padding: '10px 14px',
  cursor: 'pointer',
  fontSize: '13px',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
};
