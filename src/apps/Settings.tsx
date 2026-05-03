import { useState } from 'react';
import { useOS } from '../os/OSContext';
import { FluentIcon } from '../components/Window';

interface SettingsProps { initialSection?: string; }

const WALLPAPERS = [
  { id: 'wallpaper1', name: 'Wallpaper 1', src: '/wallpapers/1.jpg' },
  { id: 'wallpaper2', name: 'Wallpaper 2', src: '/wallpapers/2.jpg' },
  { id: 'wallpaper3', name: 'Wallpaper 3', src: '/wallpapers/3.png' },
  { id: 'wallpaper4', name: 'Wallpaper 4', src: '/wallpapers/4.png' },
  { id: 'wallpaper5', name: 'Wallpaper 5', src: '/wallpapers/5.png' },
  { id: 'wallpaper6', name: 'Wallpaper 6', src: '/wallpapers/6.png' },
  { id: 'wallpaper7', name: 'Wallpaper 7', src: '/wallpapers/7.jpg' },
  ];

const ACCENT_COLORS = ['#0078D4','#107C10','#D13438','#8764B8','#008575','#C239B3','#00B7C3','#486860','#E74856','#E3008C','#4C4A48','#7A7574'];

const SECTIONS = [
  { id: 'system', label: 'System', icon: 'laptop' },
  { id: 'devices', label: 'Devices', icon: 'bluetooth' },
  { id: 'network', label: 'Network & Internet', icon: 'wifi_1' },
  { id: 'personalization', label: 'Personalization', icon: 'paint_bucket' },
  { id: 'apps', label: 'Apps', icon: 'apps_list' },
  { id: 'accounts', label: 'Accounts', icon: 'person' },
  { id: 'time', label: 'Time & Language', icon: 'clock' },
  { id: 'gaming', label: 'Gaming', icon: 'xbox_controller' },
  { id: 'ease', label: 'Ease of Access', icon: 'accessibility' },
  { id: 'privacy', label: 'Privacy', icon: 'shield_lock' },
  { id: 'update', label: 'Update & Security', icon: 'shield_checkmark' },
];

export function Settings({ initialSection = 'system' }: SettingsProps) {
  const { settings, updateSettings, openWindow } = useOS();
  const [section, setSection] = useState(initialSection);
  const [updateState, setUpdateState] = useState<'idle'|'checking'|'done'>('idle');
  const [updateProgress, setUpdateProgress] = useState(0);

  const runUpdate = () => {
    setUpdateState('checking');
    setUpdateProgress(0);
    const interval = setInterval(() => {
      setUpdateProgress(p => {
        if (p >= 100) { clearInterval(interval); setUpdateState('done'); return 100; }
        return p + 5;
      });
    }, 150);
  };

  const renderContent = () => {
    switch (section) {
      case 'system': return (
        <div>
          <h2 style={h2Style}>System</h2>
          <div style={subsections}>
            <Subsection title="Display">
              <SettingRow label="Night Light" sub="Reduce blue light for better sleep">
                <Toggle value={settings.nightLight} onChange={v => updateSettings({ nightLight: v })} />
              </SettingRow>
              <SettingRow label="Wallpaper" sub="See Personalization for more options">
                <button onClick={() => setSection('personalization')} style={linkBtn}>Change</button>
              </SettingRow>
            </Subsection>
            <Subsection title="Sound">
              <SettingRow label="Master Volume" sub={`${settings.volume}%`}>
                <input type="range" min={0} max={100} value={settings.volume}
                  onChange={e => updateSettings({ volume: Number(e.target.value) })}
                  style={{ width: '160px', accentColor: settings.accentColor }} />
              </SettingRow>
              <SettingRow label="Mute" sub="Silence all system sounds">
                <Toggle value={settings.muted} onChange={v => updateSettings({ muted: v })} />
              </SettingRow>
            </Subsection>
            <Subsection title="Storage">
              <SettingRow label="C: Drive" sub="System drive">
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                  <div style={{ width: '160px', height: '8px', background: '#ddd', borderRadius: '4px' }}>
                    <div style={{ width: '35%', height: '100%', background: settings.accentColor, borderRadius: '4px' }} />
                  </div>
                  <span style={{ fontSize: '12px', color: '#666' }}>35 GB used of 100 GB</span>
                </div>
              </SettingRow>
            </Subsection>
            <Subsection title="About">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px' }}>
                {[
                  ['Device name', 'Error64-PC'],
                  ['Processor', 'Intel Core i5-10400'],
                  ['RAM', '8.00 GB'],
                  ['Device ID', '2024-ERR64-XXXX'],
                  ['Product ID', '00330-80000-00000-AA664'],
                  ['System type', '64-bit OS, x64-based processor'],
                  ['Edition', 'Error64 Pro'],
                  ['Version', '21H2'],
                  ['OS build', '19044.1288'],
                ].map(([k,v]) => (
                  <><div key={k} style={{ color: '#666' }}>{k}</div><div key={k+'v'} style={{ fontWeight: 500 }}>{v}</div></>
                ))}
              </div>
            </Subsection>
          </div>
        </div>
      );

      case 'personalization': return (
        <div>
          <h2 style={h2Style}>Personalization</h2>
          <div style={subsections}>
            <Subsection title="Background">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '12px' }}>
                {WALLPAPERS.map(w => (
                  <div key={w.id} onClick={() => updateSettings({ wallpaper: w.src })}
                    style={{
                      height: '70px', background: `url(${w.src}) center/cover`, cursor: 'pointer',
                      border: `3px solid ${settings.wallpaper === w.src ? settings.accentColor : '#ddd'}`,
                      display: 'flex', alignItems: 'flex-end', padding: '4px',
                    }}>
                    <span style={{ fontSize: '10px', color: '#fff', textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>{w.name}</span>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>Right-click on desktop to set custom wallpaper from image file</div>
            </Subsection>

            <Subsection title="Colors">
              <SettingRow label="Dark Mode" sub="Use dark color theme">
                <Toggle value={settings.darkMode} onChange={v => updateSettings({ darkMode: v })} />
              </SettingRow>
              <SettingRow label="Transparency Effects" sub="Window transparency and blur">
                <Toggle value={settings.transparency} onChange={v => updateSettings({ transparency: v })} />
              </SettingRow>
              <div style={{ marginBottom: '8px' }}>
                <div style={{ fontWeight: 600, marginBottom: '8px' }}>Accent Color</div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {ACCENT_COLORS.map(c => (
                    <div key={c} onClick={() => updateSettings({ accentColor: c })}
                      style={{
                        width: '32px', height: '32px', background: c, cursor: 'pointer', borderRadius: '2px',
                        border: `3px solid ${settings.accentColor === c ? '#fff' : 'transparent'}`,
                        outline: settings.accentColor === c ? `2px solid ${c}` : 'none',
                      }} />
                  ))}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="color" value={settings.accentColor} onChange={e => updateSettings({ accentColor: e.target.value })}
                      style={{ width: '32px', height: '32px', border: 'none', cursor: 'pointer', padding: '2px' }} />
                    <span style={{ fontSize: '12px', color: '#666' }}>Custom</span>
                  </div>
                </div>
              </div>
            </Subsection>

            <Subsection title="Start">
              <SettingRow label="Show recently added apps" sub="">
                <Toggle value={true} onChange={() => {}} />
              </SettingRow>
              <SettingRow label="Show most used apps" sub="">
                <Toggle value={true} onChange={() => {}} />
              </SettingRow>
            </Subsection>

            <Subsection title="Taskbar">
              <SettingRow label="Auto-hide taskbar" sub="Hide taskbar when not in use">
                <Toggle value={settings.taskbarAutoHide} onChange={v => updateSettings({ taskbarAutoHide: v })} />
              </SettingRow>
              <SettingRow label="Show desktop icons" sub="">
                <Toggle value={settings.showDesktopIcons} onChange={v => updateSettings({ showDesktopIcons: v })} />
              </SettingRow>
            </Subsection>
          </div>
        </div>
      );

      case 'network': return (
        <div>
          <h2 style={h2Style}>Network & Internet</h2>
          <div style={subsections}>
            <Subsection title="Status">
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#107C10', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FluentIcon name="wifi_1" size={28} />
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>Connected</div>
                  <div style={{ fontSize: '13px', color: '#666' }}>You're connected to the internet</div>
                </div>
              </div>
            </Subsection>
            <Subsection title="Wi-Fi">
              <SettingRow label="Wi-Fi" sub="Connected to Error64-Network">
                <Toggle value={true} onChange={() => {}} />
              </SettingRow>
              {['Error64-Network','Neighbor_5G','XFINITY_AUTO','DIRECT-TV_2G'].map(n => (
                <div key={n} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee', fontSize: '13px' }}>
                  <span>{n}</span>
                  <span style={{ color: '#666' }}>{n === 'Error64-Network' ? '🔒 Connected' : '🔒'}</span>
                </div>
              ))}
            </Subsection>
            <Subsection title="Advanced">
              <SettingRow label="Airplane Mode" sub="Turn off all wireless communication">
                <Toggle value={false} onChange={() => {}} />
              </SettingRow>
              <SettingRow label="VPN" sub="Not connected">
                <button style={linkBtn}>Add VPN</button>
              </SettingRow>
            </Subsection>
          </div>
        </div>
      );

      case 'accounts': return (
        <div>
          <h2 style={h2Style}>Accounts</h2>
          <div style={subsections}>
            <Subsection title="Your Info">
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: settings.accentColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg viewBox="0 0 24 24" fill="#fff" width="48" height="48"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                </div>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 600 }}>{settings.username}</div>
                  <div style={{ fontSize: '13px', color: '#666' }}>Local Account</div>
                  <div style={{ fontSize: '13px', color: '#666' }}>Administrator</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
                <label style={{ fontSize: '13px' }}>Username:</label>
                <input value={settings.username} onChange={e => updateSettings({ username: e.target.value })}
                  style={{ border: '1px solid #ddd', padding: '4px 8px', fontSize: '13px', outline: 'none' }} />
              </div>
            </Subsection>
            <Subsection title="Sign-in Options">
              <SettingRow label="Password" sub="Change your account password">
                <button style={linkBtn}>Change</button>
              </SettingRow>
              <SettingRow label="PIN" sub="Use a PIN instead of a password">
                <button style={linkBtn}>Set up</button>
              </SettingRow>
            </Subsection>
          </div>
        </div>
      );

      case 'time': return (
        <div>
          <h2 style={h2Style}>Time & Language</h2>
          <div style={subsections}>
            <Subsection title="Date & Time">
              <div style={{ fontSize: '48px', fontWeight: 100, marginBottom: '12px' }}>
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div style={{ fontSize: '18px', marginBottom: '20px', color: '#444' }}>{new Date().toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</div>
              <SettingRow label="Clock Format" sub="12-hour or 24-hour">
                <select value={settings.clockFormat} onChange={e => updateSettings({ clockFormat: e.target.value as '12h'|'24h' })}
                  style={{ border: '1px solid #ddd', padding: '4px 8px', fontSize: '13px' }}>
                  <option value="12h">12-hour</option>
                  <option value="24h">24-hour</option>
                </select>
              </SettingRow>
            </Subsection>
            <Subsection title="Region">
              <SettingRow label="Country or Region" sub="">
                <select style={{ border: '1px solid #ddd', padding: '4px 8px', fontSize: '13px' }}>
                  <option>United States</option>
                  <option>United Kingdom</option>
                  <option>Canada</option>
                  <option>Australia</option>
                </select>
              </SettingRow>
            </Subsection>
          </div>
        </div>
      );

      case 'ease': return (
        <div>
          <h2 style={h2Style}>Ease of Access</h2>
          <div style={subsections}>
            <Subsection title="Display">
              <SettingRow label="Text Size" sub="Make text larger">
                <input type="range" min={8} max={24} defaultValue={13} style={{ width: '160px', accentColor: settings.accentColor }} />
              </SettingRow>
            </Subsection>
            <Subsection title="Magnifier">
              <SettingRow label="Turn on Magnifier" sub="Windows++ to zoom in, Windows+Esc to close">
                <Toggle value={false} onChange={() => {}} />
              </SettingRow>
            </Subsection>
            <Subsection title="Keyboard">
              <SettingRow label="On-Screen Keyboard" sub="Use keyboard on screen">
                <button onClick={() => openWindow('osk', 'On-Screen Keyboard', 'keyboard')} style={linkBtn}>Open</button>
              </SettingRow>
            </Subsection>
          </div>
        </div>
      );

      case 'update': return (
        <div>
          <h2 style={h2Style}>Update & Security</h2>
          <div style={subsections}>
            <Subsection title="Error64 Update">
              {updateState === 'idle' && (
                <>
                  <div style={{ fontSize: '13px', marginBottom: '12px', color: '#444' }}>Your device is up to date. Last checked: Today at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  <button onClick={runUpdate} style={{ padding: '8px 24px', background: settings.accentColor, color: '#fff', border: 'none', cursor: 'pointer', fontSize: '13px' }}>Check for updates</button>
                </>
              )}
              {updateState === 'checking' && (
                <div>
                  <div style={{ fontSize: '13px', marginBottom: '8px' }}>Checking for updates... ({updateProgress}%)</div>
                  <div style={{ width: '100%', height: '4px', background: '#ddd', borderRadius: '2px' }}>
                    <div style={{ width: `${updateProgress}%`, height: '100%', background: settings.accentColor, transition: 'width 200ms', borderRadius: '2px' }} />
                  </div>
                </div>
              )}
              {updateState === 'done' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#107C10' }}>
                  <span style={{ fontSize: '24px' }}>✓</span>
                  <div>
                    <div style={{ fontWeight: 600 }}>You're up to date</div>
                    <div style={{ fontSize: '13px' }}>Error64 21H2 (Build 19044.1288)</div>
                  </div>
                </div>
              )}
            </Subsection>
            <Subsection title="Recovery">
              <SettingRow label="Reset this PC" sub="Reinstall Error64 while optionally keeping your files">
                <button style={linkBtn}>Get started</button>
              </SettingRow>
            </Subsection>
            <Subsection title="Activation">
              <SettingRow label="Activation Status" sub="Error64 is activated">
                <span style={{ color: '#107C10', fontWeight: 600 }}>✓ Activated</span>
              </SettingRow>
            </Subsection>
          </div>
        </div>
      );

      default: return (
        <div>
          <h2 style={h2Style}>{SECTIONS.find(s => s.id === section)?.label}</h2>
          <div style={subsections}>
            <Subsection title="Coming Soon">
              <div style={{ fontSize: '13px', color: '#666' }}>This settings section is under construction.</div>
            </Subsection>
          </div>
        </div>
      );
    }
  };

  return (
    <div style={{ display: 'flex', height: '100%', fontFamily: "'Segoe UI', sans-serif" }}>
      {/* Sidebar */}
      <div style={{ width: '220px', background: '#f3f3f3', borderRight: '1px solid #ddd', overflowY: 'auto', flexShrink: 0 }}>
        {/* Search */}
        <div style={{ padding: '12px' }}>
          <input placeholder="Find a setting" style={{ width: '100%', padding: '6px 10px', border: '1px solid #ddd', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
        </div>
        {SECTIONS.map(s => (
          <div key={s.id} onClick={() => setSection(s.id)}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', cursor: 'pointer', background: section === s.id ? '#e0e0e0' : 'transparent', fontWeight: section === s.id ? 600 : 400, fontSize: '13px', borderLeft: section === s.id ? `3px solid #0078D4` : '3px solid transparent' }}
            onMouseEnter={e => { if (section !== s.id) e.currentTarget.style.background = '#e8e8e8'; }}
            onMouseLeave={e => { if (section !== s.id) e.currentTarget.style.background = ''; }}>
            <FluentIcon name={s.icon} size={20} />
            {s.label}
          </div>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px', background: '#fff' }}>
        {renderContent()}
      </div>
    </div>
  );
}

function Subsection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '24px' }}>
      {title && <h3 style={{ margin: '0 0 12px', fontSize: '16px', fontWeight: 600, color: '#1a1a1a', paddingBottom: '8px', borderBottom: '1px solid #eee' }}>{title}</h3>}
      {children}
    </div>
  );
}

function SettingRow({ label, sub, children }: { label: string; sub: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
      <div>
        <div style={{ fontSize: '13px', fontWeight: 500 }}>{label}</div>
        {sub && <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>{sub}</div>}
      </div>
      {children}
    </div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  const { settings } = useOS();
  return (
    <div onClick={() => onChange(!value)} style={{ width: '44px', height: '24px', borderRadius: '12px', background: value ? settings.accentColor : '#ccc', cursor: 'pointer', position: 'relative', transition: 'background 200ms' }}>
      <div style={{ position: 'absolute', width: '20px', height: '20px', borderRadius: '50%', background: '#fff', top: '2px', left: value ? '22px' : '2px', transition: 'left 200ms', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
    </div>
  );
}

const h2Style: React.CSSProperties = { margin: '0 0 20px', fontSize: '22px', fontWeight: 300 };
const subsections: React.CSSProperties = {};
const linkBtn: React.CSSProperties = { background: 'none', border: 'none', color: '#0078D4', cursor: 'pointer', fontSize: '13px', textDecoration: 'underline', padding: 0 };
