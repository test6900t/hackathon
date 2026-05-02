import { useOS } from '../os/OSContext';

export function BootScreen() {
  const { phase } = useOS();
  if (phase !== 'boot') return null;

  return (
    <div className="fixed inset-0 z-[99999] bg-black flex flex-col items-center justify-center">
      <div className="flex items-center gap-5 mb-20">
        <svg width="52" height="52" viewBox="0 0 21 21">
          <path d="M0 0h10v10H0z" fill="#f35325"/>
          <path d="M11 0h10v10H11z" fill="#81bc06"/>
          <path d="M0 11h10v10H0z" fill="#05a6f0"/>
          <path d="M11 11h10v10H11z" fill="#ffba08"/>
        </svg>
        <h1 style={{ fontFamily: "'Segoe UI', sans-serif", fontWeight: 100, fontSize: '48px', color: '#fff', letterSpacing: '2px', margin: 0 }}>
          Error64
        </h1>
      </div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        {[0, 1, 2, 3, 4].map(i => (
          <div
            key={i}
            style={{
              width: '6px', height: '6px', borderRadius: '50%', background: '#fff',
              animation: 'winDot 1.4s ease-in-out infinite',
              animationDelay: `${i * 0.16}s`,
            }}
          />
        ))}
      </div>
      <style>{`
        @keyframes winDot {
          0%, 80%, 100% { transform: scale(0.4); opacity: 0.3; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
