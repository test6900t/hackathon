import { FluentIcon } from '../components/Window';

const MINECRAFT_EMBED_URL = 'https://www.gameflare.com/embed/minecraft-classic/';

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
            <div style={{ fontSize: '14px', fontWeight: 600 }}>Minecraft Classic</div>
            <div style={{ fontSize: '12px', color: 'rgba(245,241,232,0.7)' }}>
              Embedded via Gameflare&apos;s public embed page
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'rgba(245,241,232,0.72)' }}>
            <FluentIcon name="keyboard" size={14} color="rgba(245,241,232,0.9)" />
            WASD, mouse, `B`, `R`, `F`, `Esc`
          </div>
          <button
            onClick={() => window.open(MINECRAFT_EMBED_URL, '_blank', 'noopener,noreferrer')}
            style={{
              padding: '7px 12px',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(255,255,255,0.06)',
              color: '#f5f1e8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '12px',
            }}
          >
            <FluentIcon name="globe" size={14} color="#f5f1e8" />
            Open Source Page
          </button>
        </div>
      </div>

      <div style={{ flex: 1, position: 'relative', background: '#000' }}>
        <iframe
          src={MINECRAFT_EMBED_URL}
          title="Minecraft Classic"
          allow="fullscreen; autoplay; gamepad; clipboard-read; clipboard-write"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          style={{ width: '100%', height: '100%', border: 'none' }}
        />
      </div>
    </div>
  );
}
