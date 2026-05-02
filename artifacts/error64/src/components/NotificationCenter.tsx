import { useOS } from '../os/OSContext';
import { useEffect, useRef } from 'react';
import { FluentIcon } from './Window';

export function NotificationCenter() {
  const { notifOpen, setNotifOpen, notifications, dismissNotification, clearNotifications, settings, updateSettings, openWindow } = useOS();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [setNotifOpen]);

  if (!notifOpen) return null;

  const toggles = [
    { label: 'Wi-Fi', icon: 'wifi_1', key: 'wifi', active: true },
    { label: 'Bluetooth', icon: 'bluetooth', key: 'bluetooth', active: false },
    { label: 'Airplane Mode', icon: 'airplane', key: 'airplane', active: false },
    { label: 'Focus Assist', icon: 'alert_off', key: 'focus', active: false },
    { label: 'Night Light', icon: 'brightness_high', key: 'nightLight', active: settings.nightLight },
    { label: 'Battery Saver', icon: 'battery_saver', key: 'battSaver', active: false },
  ];

  return (
    <div
      ref={ref}
      style={{
        position: 'fixed', right: 0, top: 0, bottom: '48px',
        width: '360px', zIndex: 9997,
        background: settings.transparency ? 'rgba(30,30,30,0.92)' : 'rgba(30,30,30,1)',
        backdropFilter: settings.transparency ? 'blur(30px)' : 'none',
        borderLeft: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '-4px 0 24px rgba(0,0,0,0.4)',
        display: 'flex', flexDirection: 'column',
        color: '#fff',
        animation: 'notifSlide 200ms ease',
        overflowY: 'auto',
      }}
    >
      <style>{`@keyframes notifSlide { from{transform:translateX(100%)} to{transform:translateX(0)} }`}</style>

      {/* Header */}
      <div style={{ padding: '16px 20px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '15px', fontWeight: 500 }}>Notification Center</span>
        {notifications.length > 0 && (
          <button onClick={clearNotifications} style={{ background: 'none', border: 'none', color: '#0078D4', cursor: 'pointer', fontSize: '12px' }}>
            Clear all
          </button>
        )}
      </div>

      {/* Notifications */}
      <div style={{ flex: 1, padding: '0 12px', minHeight: 0 }}>
        {notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', opacity: 0.5, fontSize: '13px' }}>
            <FluentIcon name="alert_off" size={32} white />
            <div style={{ marginTop: '8px' }}>No notifications</div>
          </div>
        ) : (
          notifications.map(n => (
            <div
              key={n.id}
              style={{
                background: 'rgba(255,255,255,0.07)', marginBottom: '8px',
                padding: '12px', position: 'relative',
                cursor: 'pointer',
              }}
              onClick={() => { openWindow(n.appId, n.title, 'alert'); dismissNotification(n.id); }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '13px', fontWeight: 500 }}>{n.title}</span>
                <button
                  onClick={e => { e.stopPropagation(); dismissNotification(n.id); }}
                  style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', opacity: 0.6, fontSize: '12px' }}
                >✕</button>
              </div>
              <div style={{ fontSize: '12px', opacity: 0.8, lineHeight: 1.4 }}>{n.body}</div>
              <div style={{ fontSize: '11px', opacity: 0.5, marginTop: '4px' }}>
                {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quick Settings */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', padding: '12px' }}>
        <div style={{ fontSize: '11px', opacity: 0.5, marginBottom: '8px' }}>QUICK SETTINGS</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginBottom: '12px' }}>
          {toggles.map(t => (
            <QuickToggle
              key={t.key}
              label={t.label}
              icon={t.icon}
              active={t.active}
              onClick={() => {
                if (t.key === 'nightLight') updateSettings({ nightLight: !settings.nightLight });
              }}
            />
          ))}
        </div>

        {/* Brightness */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <FluentIcon name="brightness_high" size={16} white />
          <input type="range" min={0} max={100} defaultValue={100} style={{ flex: 1, accentColor: '#0078D4' }} />
        </div>

        {/* Volume */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FluentIcon name="speaker_2" size={16} white />
          <input
            type="range" min={0} max={100}
            value={settings.volume}
            onChange={e => updateSettings({ volume: Number(e.target.value) })}
            style={{ flex: 1, accentColor: '#0078D4' }}
          />
        </div>

        {/* Bottom links */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
          {['All Settings', 'Connect', 'VPN', 'Project'].map(l => (
            <button
              key={l}
              onClick={() => { if (l === 'All Settings') { openWindow('settings', 'Settings', 'settings'); setNotifOpen(false); } }}
              style={{ background: 'none', border: 'none', color: '#0078D4', cursor: 'pointer', fontSize: '11px' }}
            >{l}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

function QuickToggle({ label, icon, active, onClick }: { label: string; icon: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title={label}
      style={{
        background: active ? 'rgba(0,120,212,0.7)' : 'rgba(255,255,255,0.08)',
        border: 'none', cursor: 'pointer', color: '#fff',
        padding: '8px 4px', display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: '4px', fontSize: '10px',
        transition: 'background 150ms',
      }}
    >
      <FluentIcon name={icon} size={18} white />
      {label}
    </button>
  );
}
