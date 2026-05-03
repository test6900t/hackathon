import { useState, useRef, useEffect } from 'react';

export function Camera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasCamera, setHasCamera] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [mode, setMode] = useState<'photo' | 'video'>('photo');
  const [recording, setRecording] = useState(false);
  const [flash, setFlash] = useState(false);
  const [timer, setTimer] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [error, setError] = useState('');
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  const startCamera = async (facing = facingMode) => {
    try {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: facing }, audio: mode === 'video' });
      streamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); }
      setHasCamera(true);
      setError('');
    } catch (err) {
      setError('Camera not available or permission denied.');
    }
  };

  useEffect(() => { startCamera(); return () => { streamRef.current?.getTracks().forEach(t => t.stop()); }; }, []);

  const takePhoto = () => {
    if (timer > 0) {
      setCountdown(timer);
      const interval = setInterval(() => {
        setCountdown(c => { if (c <= 1) { clearInterval(interval); capturePhoto(); return 0; } return c - 1; });
      }, 1000);
    } else { capturePhoto(); }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d')!;
    if (facingMode === 'user') { ctx.translate(canvas.width, 0); ctx.scale(-1, 1); }
    ctx.drawImage(video, 0, 0);
    if (facingMode === 'user') { ctx.setTransform(1, 0, 0, 1, 0, 0); }
    // Flash effect
    setFlash(true); setTimeout(() => setFlash(false), 300);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setPhotos(prev => [dataUrl, ...prev]);
  };

  const startRecording = () => {
    if (!streamRef.current) return;
    chunks.current = [];
    const mr = new MediaRecorder(streamRef.current);
    mr.ondataavailable = e => chunks.current.push(e.data);
    mr.onstop = () => {
      const blob = new Blob(chunks.current, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `video_${Date.now()}.webm`; a.click();
    };
    mr.start();
    mediaRecorderRef.current = mr;
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const flipCamera = () => {
    const newFacing = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newFacing);
    startCamera(newFacing);
  };

  const downloadPhoto = (url: string) => {
    const a = document.createElement('a');
    a.href = url; a.download = `photo_${Date.now()}.jpg`; a.click();
  };

  return (
    <div style={{ height: '100%', background: '#111', color: '#fff', display: 'flex', flexDirection: 'column', fontFamily: "'Segoe UI', sans-serif", userSelect: 'none' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '8px 16px', gap: '12px', background: '#1a1a1a', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: '2px' }}>
          {(['photo','video'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)}
              style={{ padding: '6px 16px', background: mode === m ? '#0078D4' : 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '13px' }}>
              {m === 'photo' ? '📷 Photo' : '🎥 Video'}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '4px', marginLeft: 'auto' }}>
          <button onClick={flipCamera} title="Flip camera" style={{ ...camBtn }}>🔄</button>
          <select value={timer} onChange={e => setTimer(Number(e.target.value))}
            style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '6px', fontSize: '13px', cursor: 'pointer' }}>
            <option value={0}>No timer</option>
            <option value={3}>3 seconds</option>
            <option value={5}>5 seconds</option>
            <option value={10}>10 seconds</option>
          </select>
        </div>
      </div>

      {/* Main area */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Camera view */}
        <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
          {error ? (
            <div style={{ textAlign: 'center', padding: '40px', opacity: 0.7 }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>📷</div>
              <div style={{ fontSize: '14px', marginBottom: '16px' }}>{error}</div>
              <button onClick={() => startCamera()}
                style={{ padding: '8px 20px', background: '#0078D4', border: 'none', color: '#fff', cursor: 'pointer' }}>
                Try Again
              </button>
            </div>
          ) : (
            <>
              <video ref={videoRef} autoPlay muted playsInline
                style={{ maxWidth: '100%', maxHeight: '100%', transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }} />
              {flash && <div style={{ position: 'absolute', inset: 0, background: '#fff', opacity: 0.8, pointerEvents: 'none' }} />}
              {countdown > 0 && (
                <div style={{ position: 'absolute', fontSize: '120px', fontWeight: 100, opacity: 0.9, textShadow: '0 0 20px rgba(0,0,0,0.5)' }}>{countdown}</div>
              )}
              {recording && (
                <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0,0,0,0.5)', padding: '6px 12px', borderRadius: '20px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#D13438', animation: 'blink 1s infinite' }} />
                  <span style={{ fontSize: '13px' }}>REC</span>
                </div>
              )}
              {/* Grid overlay */}
              <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', border: '1px solid rgba(255,255,255,0)' }}>
                {[1, 2].map(i => (
                  <div key={i} style={{ position: 'absolute', left: `${i * 33.33}%`, top: 0, bottom: 0, borderLeft: '1px solid rgba(255,255,255,0.2)' }} />
                ))}
                {[1, 2].map(i => (
                  <div key={i} style={{ position: 'absolute', top: `${i * 33.33}%`, left: 0, right: 0, borderTop: '1px solid rgba(255,255,255,0.2)' }} />
                ))}
              </div>
            </>
          )}
          <canvas ref={canvasRef} style={{ display: 'none' }} />

          {/* Capture button */}
          {hasCamera && (
            <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '24px', alignItems: 'center' }}>
              {mode === 'photo' ? (
                <button onClick={takePhoto}
                  style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#fff', border: '4px solid rgba(255,255,255,0.5)', cursor: 'pointer', boxShadow: '0 0 0 4px rgba(0,0,0,0.5)' }} />
              ) : (
                <button onClick={recording ? stopRecording : startRecording}
                  style={{ width: '64px', height: '64px', borderRadius: '50%', background: recording ? '#D13438' : '#fff', border: '4px solid rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: recording ? '20px' : '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {recording ? '⬛' : '●'}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Photo strip */}
        {photos.length > 0 && (
          <div style={{ width: '120px', background: '#1a1a1a', overflowY: 'auto', padding: '8px', display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
            {photos.map((url, i) => (
              <div key={i} style={{ position: 'relative', cursor: 'pointer' }} onClick={() => downloadPhoto(url)}>
                <img src={url} alt={`Photo ${i+1}`} style={{ width: '100%', objectFit: 'cover', display: 'block' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, fontSize: '20px', transition: 'all 150ms' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.5)'; e.currentTarget.style.opacity = '1'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0)'; e.currentTarget.style.opacity = '0'; }}>⬇</div>
              </div>
            ))}
          </div>
        )}
      </div>
      <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
    </div>
  );
}

const camBtn: React.CSSProperties = {
  background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', cursor: 'pointer', padding: '6px 10px', fontSize: '16px',
};
