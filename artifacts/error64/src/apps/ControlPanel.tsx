import { useOS } from '../os/OSContext';
import { FluentIcon } from '../components/Window';
import { useState } from 'react';

const CATEGORIES = [
  {
    name: 'System and Security',
    icon: 'shield_checkmark',
    color: '#0078D4',
    items: ['Action Center', 'Windows Firewall', 'System', 'BitLocker Drive Encryption', 'Backup and Restore'],
    section: 'update',
  },
  {
    name: 'User Accounts',
    icon: 'person',
    color: '#8764B8',
    items: ['Change account type', 'Change your account name', 'Manage another account'],
    section: 'accounts',
  },
  {
    name: 'Appearance and Personalization',
    icon: 'paint_bucket',
    color: '#CA5010',
    items: ['Change the theme', 'Adjust screen resolution', 'Taskbar and Start Menu'],
    section: 'personalization',
  },
  {
    name: 'Network and Internet',
    icon: 'wifi_1',
    color: '#107C10',
    items: ['View network status', 'Set up a new connection', 'Choose homegroup settings'],
    section: 'network',
  },
  {
    name: 'Hardware and Sound',
    icon: 'speaker_2',
    color: '#C239B3',
    items: ['View devices and printers', 'Add a device', 'Adjust system volume'],
    section: 'devices',
  },
  {
    name: 'Programs',
    icon: 'apps_list',
    color: '#038387',
    items: ['Uninstall a program', 'Turn Windows features on or off'],
    section: 'apps',
  },
  {
    name: 'Clock and Region',
    icon: 'clock',
    color: '#CA5010',
    items: ['Change date, time, or number formats', 'Set the time and date'],
    section: 'time',
  },
  {
    name: 'Ease of Access',
    icon: 'accessibility',
    color: '#0078D4',
    items: ['Let Windows suggest settings', 'Optimize visual display'],
    section: 'ease',
  },
];

export function ControlPanel() {
  const { openWindow } = useOS();
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'category' | 'large' | 'small'>('category');

  const filtered = CATEGORIES.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.items.some(i => i.toLowerCase().includes(search.toLowerCase()))
  );

  const openSettings = (section: string) => {
    openWindow('settings', 'Settings', 'settings', { section });
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', fontFamily: "'Segoe UI', sans-serif" }}>
      {/* Header bar */}
      <div style={{ background: '#f3f3f3', borderBottom: '1px solid #ddd', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', border: '1px solid #ccc', padding: '4px 10px' }}>
          <FluentIcon name="search" size={16} />
          <input
            placeholder="Search Control Panel"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ border: 'none', outline: 'none', fontSize: '13px', flex: 1 }}
          />
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          {([['category','⊞ Category'],['large','⊟ Large icons'],['small','≡ Small icons']] as const).map(([v, l]) => (
            <button key={v} onClick={() => setViewMode(v as typeof viewMode)}
              style={{ padding: '4px 8px', border: `1px solid ${viewMode === v ? '#0078D4' : '#ccc'}`, background: viewMode === v ? '#0078D4' : '#fff', color: viewMode === v ? '#fff' : '#333', cursor: 'pointer', fontSize: '12px' }}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Breadcrumb */}
      <div style={{ padding: '6px 16px', background: '#f9f9f9', borderBottom: '1px solid #eee', fontSize: '12px', color: '#666' }}>
        Control Panel
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {viewMode === 'category' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {filtered.map(cat => (
              <div key={cat.name} style={{ display: 'flex', gap: '12px', padding: '12px', border: '1px solid #e0e0e0', background: '#fff', cursor: 'pointer' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#f5f5f5')}
                onMouseLeave={e => (e.currentTarget.style.background = '#fff')}>
                <div style={{ width: '48px', height: '48px', background: cat.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FluentIcon name={cat.icon} size={32} />
                </div>
                <div style={{ flex: 1 }}>
                  <div onClick={() => openSettings(cat.section)}
                    style={{ fontWeight: 600, color: '#0078D4', cursor: 'pointer', marginBottom: '6px', fontSize: '14px' }}>
                    {cat.name}
                  </div>
                  {cat.items.map(item => (
                    <div key={item} onClick={() => openSettings(cat.section)}
                      style={{ fontSize: '12px', color: '#0078D4', cursor: 'pointer', marginBottom: '2px' }}
                      onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
                      onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: viewMode === 'large' ? 'repeat(auto-fill, minmax(120px, 1fr))' : 'repeat(auto-fill, minmax(180px, 1fr))', gap: '8px' }}>
            {filtered.flatMap(cat =>
              viewMode === 'large' ? [
                <div key={cat.name} onClick={() => openSettings(cat.section)}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', padding: '12px', cursor: 'pointer' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#e8f0fe')}
                  onMouseLeave={e => (e.currentTarget.style.background = '')}>
                  <FluentIcon name={cat.icon} size={48} />
                  <span style={{ fontSize: '12px', textAlign: 'center' }}>{cat.name}</span>
                </div>
              ] : [
                <div key={cat.name} onClick={() => openSettings(cat.section)}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', cursor: 'pointer' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#e8f0fe')}
                  onMouseLeave={e => (e.currentTarget.style.background = '')}>
                  <FluentIcon name={cat.icon} size={24} />
                  <span style={{ fontSize: '12px' }}>{cat.name}</span>
                </div>
              ]
            )}
          </div>
        )}
      </div>
    </div>
  );
}
