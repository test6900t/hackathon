import { FluentIcon } from '../components/Window';

const EAGLERCRAFT_URL = 'https://eaglercraftx.github.io/';

export function Minecraft() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#12100d', color: '#f5f1e8' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          padding: '12px 16px',
          background: 'linear-gradient(180deg, #3e2b1f 0%, #24170f 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(180deg, #67b64b 0%, #5b9b43 48%, #6d4c33 48%, #6d4c33 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)',
            }}
          >
            <FluentIcon name="cube" size={18} color="#f5f1e8" />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '14px', fontWeight: 600 }}>Minecraft</div>
            <div style={{ fontSize: '12px', color: 'rgba(245,241,232,0.7)' }}>
              EaglercraftX
            </div>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, position: 'relative', background: '#000' }}>
        <iframe
          src={EAGLERCRAFT_URL}
          title="EaglercraftX"
          allow="fullscreen; autoplay; gamepad; clipboard-read; clipboard-write; pointer-events"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-pointer-lock"
          style={{ width: '100%', height: '100%', border: 'none' }}
        />
      </div>
    </div>
  );
}