import { FluentIcon } from '../components/Window';

const EAGLERCRAFT_URL = 'https://eaglercraftx.github.io/';

export function Minecraft() {
  return (
    <div style={{ width: '100%', height: '100%', background: '#000', overflow: 'hidden' }}>
      <iframe
        src={EAGLERCRAFT_URL}
        title="Minecraft"
        allow="fullscreen; autoplay; gamepad; clipboard-read; clipboard-write; pointer-events"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-pointer-lock"
        style={{ width: '100%', height: '100%', border: 'none' }}
      />
    </div>
  );
}