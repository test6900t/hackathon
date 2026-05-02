import { useState, useRef, useCallback } from 'react';
import { FluentIcon } from '../components/Window';

interface BrowserProps { initialUrl?: string; }

const BOOKMARKS = [
  { label: 'Google', url: 'https://www.google.com', icon: '🔍' },
  { label: 'YouTube', url: 'https://www.youtube.com', icon: '▶️' },
  { label: 'Wikipedia', url: 'https://en.wikipedia.org', icon: '📖' },
  { label: 'GitHub', url: 'https://github.com', icon: '🐙' },
  { label: 'Reddit', url: 'https://www.reddit.com', icon: '🤖' },
  { label: 'MDN Docs', url: 'https://developer.mozilla.org', icon: '📚' },
];

const SPEED_DIAL = [
  { label: 'Google', url: 'https://www.google.com', color: '#4285f4' },
  { label: 'YouTube', url: 'https://www.youtube.com', color: '#ff0000' },
  { label: 'Wikipedia', url: 'https://en.wikipedia.org', color: '#636466' },
  { label: 'GitHub', url: 'https://github.com', color: '#24292f' },
  { label: 'Reddit', url: 'https://www.reddit.com', color: '#ff4500' },
  { label: 'MDN', url: 'https://developer.mozilla.org', color: '#1976d2' },
  { label: 'Hacker News', url: 'https://news.ycombinator.com', color: '#ff6600' },
  { label: 'Stack Overflow', url: 'https://stackoverflow.com', color: '#f58025' },
];

interface Tab {
  id: string;
  url: string;
  title: string;
  loading: boolean;
}

export function Browser({ initialUrl = '' }: BrowserProps) {
  const [tabs, setTabs] = useState<Tab[]>([
    { id: 'tab-1', url: initialUrl, title: initialUrl ? 'Loading...' : 'New Tab', loading: !!initialUrl },
  ]);
  const [activeTab, setActiveTab] = useState('tab-1');
  const [address, setAddress] = useState(initialUrl);
  const [editingAddress, setEditingAddress] = useState(!initialUrl);
  const [history, setHistory] = useState<string[]>(initialUrl ? [initialUrl] : []);
  const [histIdx, setHistIdx] = useState(0);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const currentTab = tabs.find(t => t.id === activeTab)!;

  const normalizeUrl = (raw: string): string => {
    const s = raw.trim();
    if (!s) return '';
    if (s.startsWith('http://') || s.startsWith('https://')) return s;
    if (s.includes('.') && !s.includes(' ')) return 'https://' + s;
    return `https://www.google.com/search?q=${encodeURIComponent(s)}`;
  };

  const navigate = useCallback((rawUrl: string) => {
    const url = normalizeUrl(rawUrl);
    if (!url) return;
    setTabs(ts => ts.map(t => t.id === activeTab ? { ...t, url, loading: true, title: 'Loading...' } : t));
    setAddress(url);
    setHistory(h => [...h.slice(0, histIdx + 1), url]);
    setHistIdx(i => i + 1);
    setEditingAddress(false);
  }, [activeTab, histIdx]);

  const addTab = () => {
    const id = `tab-${Date.now()}`;
    setTabs(ts => [...ts, { id, url: '', title: 'New Tab', loading: false }]);
    setActiveTab(id);
    setAddress('');
    setEditingAddress(true);
  };

  const closeTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tabs.length === 1) { setTabs([{ id: 'tab-new', url: '', title: 'New Tab', loading: false }]); setActiveTab('tab-new'); return; }
    const newTabs = tabs.filter(t => t.id !== id);
    setTabs(newTabs);
    if (activeTab === id) { setActiveTab(newTabs[newTabs.length - 1].id); }
  };

  const goBack = () => {
    if (histIdx > 0) { const url = history[histIdx - 1]; setHistIdx(i => i - 1); navigate(url); }
  };
  const goForward = () => {
    if (histIdx < history.length - 1) { const url = history[histIdx + 1]; setHistIdx(i => i + 1); navigate(url); }
  };
  const refresh = () => { if (currentTab.url) navigate(currentTab.url); };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') navigate(address);
    if (e.key === 'Escape') { setAddress(currentTab.url); setEditingAddress(false); }
  };

  const showNewTabPage = !currentTab?.url;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff', userSelect: 'none' }}>
      {/* Tab bar */}
      <div style={{ display: 'flex', background: '#dee1e6', alignItems: 'flex-end', paddingLeft: '4px', minHeight: '36px', flexShrink: 0 }}>
        {tabs.map(tab => (
          <div
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setAddress(tab.url); }}
            style={{
              maxWidth: '200px', minWidth: '80px', height: '32px', display: 'flex', alignItems: 'center',
              padding: '0 8px', gap: '6px', cursor: 'pointer', fontSize: '12px',
              background: tab.id === activeTab ? '#fff' : 'transparent',
              borderRadius: '8px 8px 0 0',
              borderTop: tab.id === activeTab ? '1px solid #ccc' : 'none',
              borderLeft: tab.id === activeTab ? '1px solid #ccc' : 'none',
              borderRight: tab.id === activeTab ? '1px solid #ccc' : 'none',
              flex: '1 1 auto', overflow: 'hidden',
            }}
          >
            <span style={{ fontSize: '14px', flexShrink: 0 }}>🌐</span>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{tab.title}</span>
            <button
              onClick={e => closeTab(tab.id, e)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.6, fontSize: '12px', flexShrink: 0, lineHeight: 1, padding: '2px' }}
            >✕</button>
          </div>
        ))}
        <button onClick={addTab} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 12px', fontSize: '18px', opacity: 0.7, flexShrink: 0 }}>+</button>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: '4px', padding: '4px 8px', background: '#f9f9fa', borderBottom: '1px solid #ddd', alignItems: 'center', flexShrink: 0 }}>
        <button onClick={goBack} disabled={histIdx === 0} style={{ ...navBtn, opacity: histIdx > 0 ? 1 : 0.4 }}>←</button>
        <button onClick={goForward} disabled={histIdx >= history.length - 1} style={{ ...navBtn, opacity: histIdx < history.length - 1 ? 1 : 0.4 }}>→</button>
        <button onClick={refresh} style={navBtn}>↻</button>
        <button title="Home" onClick={() => { setAddress(''); setTabs(ts => ts.map(t => t.id === activeTab ? { ...t, url: '', title: 'New Tab', loading: false } : t)); }} style={navBtn}>🏠</button>

        {/* Address bar */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: '#fff', border: '2px solid #0078D4', padding: '4px 10px', gap: '6px' }}>
          <span style={{ fontSize: '14px' }}>🔒</span>
          {editingAddress ? (
            <input
              autoFocus
              value={address}
              onChange={e => setAddress(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={() => setEditingAddress(false)}
              style={{ flex: 1, border: 'none', outline: 'none', fontSize: '13px' }}
            />
          ) : (
            <div onClick={() => setEditingAddress(true)} style={{ flex: 1, fontSize: '13px', cursor: 'text', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {currentTab?.url || 'Search or enter web address'}
            </div>
          )}
          {address && <button onClick={() => { setAddress(''); setEditingAddress(true); }} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5, fontSize: '12px' }}>✕</button>}
        </div>

        <button onClick={() => setShowBookmarks(v => !v)} title="Bookmarks" style={{ ...navBtn, background: showBookmarks ? '#e0e0e0' : 'transparent' }}>☆</button>
        <button title="Downloads" style={navBtn}>⬇</button>
        <button title="Settings" style={navBtn}>⋯</button>
      </div>

      {/* Bookmarks bar */}
      {showBookmarks && (
        <div style={{ display: 'flex', gap: '4px', padding: '4px 8px', background: '#f0f0f0', borderBottom: '1px solid #ddd', flexShrink: 0, overflowX: 'auto' }}>
          {BOOKMARKS.map(b => (
            <button key={b.url} onClick={() => navigate(b.url)}
              style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 8px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', whiteSpace: 'nowrap' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#e0e0e0')}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
              {b.icon} {b.label}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {showNewTabPage ? (
          <NewTabPage onNavigate={navigate} />
        ) : (
          <>
            {currentTab?.loading && (
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #0078D4, #00b4d8, #0078D4)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', zIndex: 10 }} />
            )}
            <iframe
              ref={iframeRef}
              src={currentTab?.url}
              style={{ width: '100%', height: '100%', border: 'none' }}
              onLoad={() => {
                setTabs(ts => ts.map(t => {
                  if (t.id !== activeTab) return t;
                  try {
                    const title = iframeRef.current?.contentDocument?.title || t.url.replace(/^https?:\/\//, '').split('/')[0];
                    return { ...t, loading: false, title };
                  } catch { return { ...t, loading: false }; }
                }));
              }}
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation"
              title="Browser content"
            />
          </>
        )}
      </div>
      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
    </div>
  );
}

function NewTabPage({ onNavigate }: { onNavigate: (url: string) => void }) {
  const [query, setQuery] = useState('');
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', color: '#fff' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{ fontSize: '32px', marginBottom: '8px' }}>🌐</div>
        <h1 style={{ fontWeight: 100, fontSize: '28px', margin: 0 }}>Error64 Browser</h1>
      </div>

      {/* Search */}
      <div style={{ display: 'flex', width: '500px', background: 'rgba(255,255,255,0.95)', marginBottom: '40px', borderRadius: '24px', overflow: 'hidden' }}>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') onNavigate(query); }}
          placeholder="Search the web or enter a URL"
          style={{ flex: 1, padding: '12px 20px', border: 'none', outline: 'none', fontSize: '14px', background: 'transparent', color: '#333' }}
        />
        <button onClick={() => onNavigate(query)} style={{ padding: '12px 20px', background: '#0078D4', border: 'none', cursor: 'pointer', color: '#fff', fontSize: '16px' }}>🔍</button>
      </div>

      {/* Speed dial */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
        {SPEED_DIAL.map(s => (
          <div key={s.url} onClick={() => onNavigate(s.url)}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '12px 20px' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
            onMouseLeave={e => (e.currentTarget.style.background = '')}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: '#fff' }}>
              {s.label[0]}
            </div>
            <span style={{ fontSize: '12px', opacity: 0.85 }}>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const navBtn: React.CSSProperties = {
  background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', padding: '4px 8px', borderRadius: '4px', lineHeight: 1,
};
