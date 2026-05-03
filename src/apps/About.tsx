export function About() {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'Segoe UI', sans-serif", background: '#fff', padding: '32px', textAlign: 'center', gap: '16px' }}>
      {/* Logo */}
      <svg width="72" height="72" viewBox="0 0 21 21">
        <path d="M0 0h10v10H0z" fill="#f35325"/>
        <path d="M11 0h10v10H11z" fill="#81bc06"/>
        <path d="M0 11h10v10H0z" fill="#05a6f0"/>
        <path d="M11 11h10v10H11z" fill="#ffba08"/>
      </svg>

      <div>
        <h1 style={{ margin: '0 0 4px', fontWeight: 100, fontSize: '32px' }}>Error64</h1>
        <p style={{ margin: 0, fontSize: '15px', color: '#555' }}>Browser Operating System</p>
      </div>

      <div style={{ background: '#f5f5f5', padding: '16px 32px', width: '100%', maxWidth: '400px', fontSize: '13px', color: '#333', textAlign: 'left', lineHeight: 1.8 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
          <span style={{ color: '#666' }}>Version</span><span style={{ fontWeight: 500 }}>21H2 (Build 19044.1288)</span>
          <span style={{ color: '#666' }}>Edition</span><span style={{ fontWeight: 500 }}>Error64 Pro</span>
          <span style={{ color: '#666' }}>System type</span><span style={{ fontWeight: 500 }}>x64-based OS</span>
          <span style={{ color: '#666' }}>Registered to</span><span style={{ fontWeight: 500 }}>User</span>
          <span style={{ color: '#666' }}>Processor</span><span style={{ fontWeight: 500 }}>Intel Core i5-10400</span>
          <span style={{ color: '#666' }}>RAM</span><span style={{ fontWeight: 500 }}>8.00 GB</span>
        </div>
      </div>

      <p style={{ fontSize: '12px', color: '#888', maxWidth: '400px', lineHeight: 1.5 }}>
        © 2024 Error64 Corporation. All rights reserved.
        This is a browser-based simulation of a Windows-like operating system,
        built entirely in React + TypeScript. All functionality runs client-side.
      </p>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button style={{ padding: '7px 24px', background: '#0078D4', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '13px' }}>
          OK
        </button>
        <button onClick={() => window.open('https://github.com', '_blank')}
          style={{ padding: '7px 24px', border: '1px solid #ccc', background: '#fff', cursor: 'pointer', fontSize: '13px' }}>
          License Terms
        </button>
      </div>
    </div>
  );
}
