import { useState } from 'react';
import { FluentIcon } from '../components/Window';

interface App {
  id: string;
  name: string;
  developer: string;
  category: string;
  rating: number;
  reviews: number;
  price: string;
  description: string;
  installed: boolean;
  installing?: boolean;
  progress?: number;
  color: string;
  icon: string;
}

const APPS: App[] = [
  { id: '1', name: 'Visual Studio Code', developer: 'Microsoft Corporation', category: 'Developer Tools', rating: 4.9, reviews: 28456, price: 'Free', description: 'Code editing. Redefined. Free. Built on open source. Runs everywhere.', installed: false, color: '#007ACC', icon: '⌨' },
  { id: '2', name: 'Spotify', developer: 'Spotify AB', category: 'Music', rating: 4.6, reviews: 198234, price: 'Free', description: 'With Spotify, you have access to a world of music and podcasts.', installed: false, color: '#1DB954', icon: '🎵' },
  { id: '3', name: 'Discord', developer: 'Discord Inc.', category: 'Social', rating: 4.3, reviews: 87654, price: 'Free', description: 'Your place to talk. Discord is where you hang out with friends and communities.', installed: false, color: '#5865F2', icon: '💬' },
  { id: '4', name: 'Netflix', developer: 'Netflix', category: 'Entertainment', rating: 4.1, reviews: 345678, price: 'Free', description: 'Watch your favorite movies and TV shows on Netflix.', installed: true, color: '#E50914', icon: '📺' },
  { id: '5', name: 'Zoom', developer: 'Zoom Video Communications', category: 'Productivity', rating: 4.2, reviews: 56789, price: 'Free', description: 'Zoom is the leader in modern enterprise video communications.', installed: false, color: '#2D8CFF', icon: '📹' },
  { id: '6', name: 'Adobe Photoshop', developer: 'Adobe', category: 'Photo & Video', rating: 4.8, reviews: 23456, price: '$20.99/mo', description: 'The world\'s best imaging and graphic design software.', installed: false, color: '#31A8FF', icon: '🎨' },
  { id: '7', name: 'Slack', developer: 'Slack Technologies', category: 'Productivity', rating: 4.4, reviews: 34567, price: 'Free', description: 'Slack is where work happens. Connect with your team, anytime, anywhere.', installed: false, color: '#4A154B', icon: '💼' },
  { id: '8', name: 'Notion', developer: 'Notion Labs', category: 'Productivity', rating: 4.7, reviews: 45678, price: 'Free', description: 'One tool for your whole team. Write, plan, and get organized.', installed: false, color: '#000000', icon: '📓' },
  { id: '9', name: 'Figma', developer: 'Figma Inc.', category: 'Design', rating: 4.9, reviews: 12345, price: 'Free', description: 'Figma is the leading collaborative design tool.', installed: false, color: '#F24E1E', icon: '✏️' },
  { id: '10', name: 'Steam', developer: 'Valve Corporation', category: 'Gaming', rating: 4.5, reviews: 456789, price: 'Free', description: 'The Ultimate Online Game Platform.', installed: false, color: '#1b2838', icon: '🎮' },
  { id: '11', name: 'Skype', developer: 'Microsoft Corporation', category: 'Communication', rating: 3.9, reviews: 234567, price: 'Free', description: 'Stay connected with free video and voice calls.', installed: true, color: '#00AFF0', icon: '📞' },
  { id: '12', name: 'Microsoft Office', developer: 'Microsoft Corporation', category: 'Productivity', rating: 4.7, reviews: 567890, price: '$6.99/mo', description: 'Create, share, and collaborate with Microsoft 365.', installed: false, color: '#D83B01', icon: '📄' },
];

const CATEGORIES = ['All', 'Productivity', 'Entertainment', 'Developer Tools', 'Music', 'Social', 'Photo & Video', 'Gaming', 'Design'];

export function MSStore() {
  const [apps, setApps] = useState(APPS);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<App | null>(null);
  const [tab, setTab] = useState<'home' | 'apps' | 'games' | 'library' | 'search'>('home');

  const filtered = apps.filter(a =>
    (category === 'All' || a.category === category) &&
    (!search || a.name.toLowerCase().includes(search.toLowerCase()) || a.category.toLowerCase().includes(search.toLowerCase()))
  );

  const install = (id: string) => {
    setApps(prev => prev.map(a => a.id === id ? { ...a, installing: true, progress: 0 } : a));
    const interval = setInterval(() => {
      setApps(prev => {
        const updated = prev.map(a => {
          if (a.id !== id || !a.installing) return a;
          const newProgress = (a.progress || 0) + 8;
          if (newProgress >= 100) { clearInterval(interval); return { ...a, installing: false, installed: true, progress: 100 }; }
          return { ...a, progress: newProgress };
        });
        return updated;
      });
    }, 150);
  };

  const uninstall = (id: string) => {
    setApps(prev => prev.map(a => a.id === id ? { ...a, installed: false, progress: 0 } : a));
  };

  const stars = (rating: number) => '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontFamily: "'Segoe UI', sans-serif", background: '#fff' }}>
      {/* Header */}
      <div style={{ background: '#0078D4', padding: '0', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 16px' }}>
          <span style={{ fontSize: '18px', color: '#fff' }}>🛒</span>
          <span style={{ color: '#fff', fontWeight: 600, fontSize: '16px' }}>Microsoft Store</span>
          <div style={{ flex: 1, display: 'flex', background: 'rgba(255,255,255,0.2)', padding: '6px 12px', gap: '8px', alignItems: 'center', marginLeft: '16px', maxWidth: '400px' }}>
            <FluentIcon name="search" size={16} />
            <input
              placeholder="Search apps, games, movies and more"
              value={search}
              onChange={e => { setSearch(e.target.value); setTab('search'); }}
              style={{ background: 'transparent', border: 'none', outline: 'none', color: '#fff', flex: 1, fontSize: '13px' }}
            />
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
            <button style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', cursor: 'pointer', padding: '6px 12px', fontSize: '12px' }}>↻ Updates</button>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>U</div>
          </div>
        </div>
        {/* Nav tabs */}
        <div style={{ display: 'flex', paddingLeft: '16px' }}>
          {([['home','Home'],['apps','Apps'],['games','Games'],['library','Library']] as const).map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              style={{ padding: '8px 20px', background: 'none', border: 'none', color: tab === id ? '#fff' : 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: '13px', borderBottom: tab === id ? '3px solid #fff' : '3px solid transparent', fontWeight: tab === id ? 600 : 400 }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {selected ? (
        /* App detail */
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px' }}>
          <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: '#0078D4', cursor: 'pointer', fontSize: '13px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            ← Back
          </button>
          <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
            <div style={{ width: '100px', height: '100px', background: selected.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px', flexShrink: 0 }}>{selected.icon}</div>
            <div>
              <h1 style={{ margin: '0 0 4px', fontSize: '24px', fontWeight: 400 }}>{selected.name}</h1>
              <div style={{ color: '#666', fontSize: '14px', marginBottom: '8px' }}>{selected.developer} · {selected.category}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span style={{ color: '#ffa500', fontSize: '16px' }}>{stars(selected.rating)}</span>
                <span style={{ fontSize: '13px', color: '#666' }}>{selected.rating} ({selected.reviews.toLocaleString()} ratings)</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {selected.installed ? (
                  <>
                    <button style={{ padding: '8px 24px', background: '#f3f3f3', border: '1px solid #ccc', cursor: 'pointer', fontSize: '13px' }}>Open</button>
                    <button onClick={() => { uninstall(selected.id); setSelected(null); }} style={{ padding: '8px 24px', background: '#fff', border: '1px solid #ccc', cursor: 'pointer', fontSize: '13px', color: '#D13438' }}>Uninstall</button>
                  </>
                ) : selected.installing ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '200px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                      <span>Installing...</span><span>{selected.progress}%</span>
                    </div>
                    <div style={{ height: '4px', background: '#ddd' }}>
                      <div style={{ width: `${selected.progress}%`, height: '100%', background: '#0078D4', transition: 'width 200ms' }} />
                    </div>
                  </div>
                ) : (
                  <button onClick={() => install(selected.id)}
                    style={{ padding: '8px 32px', background: '#0078D4', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '13px' }}>
                    {selected.price === 'Free' ? 'Get' : `Buy – ${selected.price}`}
                  </button>
                )}
              </div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid #eee', paddingTop: '20px' }}>
            <h3 style={{ margin: '0 0 8px', fontWeight: 500 }}>Description</h3>
            <p style={{ fontSize: '14px', lineHeight: 1.6, color: '#444' }}>{selected.description}</p>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Sidebar categories */}
          <div style={{ width: '180px', borderRight: '1px solid #eee', overflowY: 'auto', flexShrink: 0, padding: '8px 0' }}>
            {CATEGORIES.map(c => (
              <div key={c} onClick={() => setCategory(c)}
                style={{ padding: '8px 16px', cursor: 'pointer', fontSize: '13px', background: category === c ? '#e8f0fe' : 'transparent', fontWeight: category === c ? 600 : 400, color: category === c ? '#0078D4' : '#333' }}
                onMouseEnter={e => { if (category !== c) e.currentTarget.style.background = '#f5f5f5'; }}
                onMouseLeave={e => { if (category !== c) e.currentTarget.style.background = ''; }}>
                {c}
              </div>
            ))}
          </div>

          {/* App grid */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
            {tab === 'home' && !search && (
              <div style={{ marginBottom: '24px', padding: '24px', background: 'linear-gradient(135deg, #0078D4, #00b4d8)', color: '#fff', borderRadius: '4px' }}>
                <h2 style={{ margin: '0 0 4px', fontWeight: 300, fontSize: '24px' }}>Get the apps you love</h2>
                <p style={{ margin: 0, opacity: 0.9 }}>Discover thousands of apps and games for your Error64 PC</p>
              </div>
            )}
            <h3 style={{ margin: '0 0 12px', fontWeight: 500, fontSize: '16px' }}>
              {category === 'All' ? (tab === 'library' ? 'Installed Apps' : 'Popular Apps') : category}
              <span style={{ fontWeight: 400, color: '#888', fontSize: '13px', marginLeft: '8px' }}>({(tab === 'library' ? filtered.filter(a => a.installed) : filtered).length})</span>
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
              {(tab === 'library' ? filtered.filter(a => a.installed) : filtered).map(app => (
                <div key={app.id} onClick={() => setSelected(app)}
                  style={{ border: '1px solid #eee', cursor: 'pointer', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', transition: 'box-shadow 150ms' }}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)')}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = '')}>
                  <div style={{ width: '52px', height: '52px', background: app.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>{app.icon}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{app.name}</div>
                    <div style={{ fontSize: '12px', color: '#888' }}>{app.developer}</div>
                    <div style={{ fontSize: '11px', color: '#ffa500', marginTop: '2px' }}>{stars(app.rating)}</div>
                  </div>
                  <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: app.installed ? 600 : 400, color: app.installed ? '#107C10' : '#0078D4' }}>
                      {app.installed ? '✓ Installed' : app.price}
                    </span>
                    {!app.installed && !app.installing && (
                      <button onClick={e => { e.stopPropagation(); install(app.id); }}
                        style={{ padding: '4px 12px', background: '#0078D4', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '12px' }}>
                        Get
                      </button>
                    )}
                    {app.installing && (
                      <div style={{ fontSize: '11px', color: '#0078D4' }}>{app.progress}%</div>
                    )}
                  </div>
                  {app.installing && (
                    <div style={{ height: '2px', background: '#ddd' }}>
                      <div style={{ width: `${app.progress}%`, height: '100%', background: '#0078D4', transition: 'width 200ms' }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
