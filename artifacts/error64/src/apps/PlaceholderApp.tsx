import { FluentIcon } from '../components/Window';

interface PlaceholderAppProps { appId: string; title?: string; }

export function PlaceholderApp({ appId, title }: PlaceholderAppProps) {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f9f9f9', gap: '12px', fontFamily: "'Segoe UI', sans-serif" }}>
      <FluentIcon name={appId} size={64} />
      <h2 style={{ margin: 0, fontWeight: 300, fontSize: '24px' }}>{title || appId}</h2>
      <p style={{ margin: 0, color: '#666', fontSize: '13px' }}>This application is coming soon.</p>
    </div>
  );
}
