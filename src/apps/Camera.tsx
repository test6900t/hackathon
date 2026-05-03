import { useState, useRef, useEffect } from 'react';
import { FluentIcon } from '../components/Window';

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
      if (streamRef.current) streamRef.current.getTracks().forEach((track) => track.stop());
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: facing }, audio: mode === 'video' });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setHasCamera(true);
      setError('');
    } catch {
      setHasCamera(false);
      setError('Camera not available or permission denied.');
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');
    if (!context) return;

    if (facingMode === 'user') {
      context.translate(canvas.width, 0);
      context.scale(-1, 1);
    }

    context.drawImage(video, 0, 0);
    context.setTransform(1, 0, 0, 1, 0, 0);

    setFlash(true);
    setTimeout(() => setFlash(false), 300);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setPhotos((previous) => [dataUrl, ...previous]);
  };

  const takePhoto = () => {
    if (timer > 0) {
      setCountdown(timer);
      const interval = setInterval(() => {
        setCountdown((current) => {
          if (current <= 1) {
            clearInterval(interval);
            capturePhoto();
            return 0;
          }
          return current - 1;
        });
      }, 1000);
      return;
    }

    capturePhoto();
  };

  const startRecording = () => {
    if (!streamRef.current) return;
    chunks.current = [];
    const recorder = new MediaRecorder(streamRef.current);
    recorder.ondataavailable = (event) => chunks.current.push(event.data);
    recorder.onstop = () => {
      const blob = new Blob(chunks.current, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `video_${Date.now()}.webm`;
      anchor.click();
    };
    recorder.start();
    mediaRecorderRef.current = recorder;
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const flipCamera = () => {
    const nextFacingMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextFacingMode);
    startCamera(nextFacingMode);
  };

  const downloadPhoto = (url: string) => {
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `photo_${Date.now()}.jpg`;
    anchor.click();
  };

  return (
    <div style={{ height: '100%', background: '#111', color: '#fff', display: 'flex', flexDirection: 'column', fontFamily: "'Segoe UI', sans-serif", userSelect: 'none' }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '8px 16px', gap: '12px', background: '#1a1a1a', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: '2px' }}>
          {([
            { id: 'photo', label: 'Photo', icon: 'camera' },
            { id: 'video', label: 'Video', icon: 'video_clip' },
          ] as const).map((entry) => (
            <button
              key={entry.id}
              onClick={() => setMode(entry.id)}
              style={{
                padding: '6px 12px',
                background: mode === entry.id ? '#0078d4' : 'rgba(255,255,255,0.1)',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <FluentIcon name={entry.icon} size={15} white />
              {entry.label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '4px', marginLeft: 'auto', alignItems: 'center' }}>
          <button onClick={flipCamera} title="Flip camera" style={camBtn}>
            <FluentIcon name="sync" size={16} white />
          </button>
          <select
            value={timer}
            onChange={(event) => setTimer(Number(event.target.value))}
            style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '6px', fontSize: '13px', cursor: 'pointer' }}
          >
            <option value={0}>No timer</option>
            <option value={3}>3 seconds</option>
            <option value={5}>5 seconds</option>
            <option value={10}>10 seconds</option>
          </select>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
          {error ? (
            <div style={{ textAlign: 'center', padding: '40px', opacity: 0.82 }}>
              <div style={{ display: 'inline-flex', width: '78px', height: '78px', borderRadius: '24px', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.08)', marginBottom: '16px' }}>
                <FluentIcon name="camera" size={34} white />
              </div>
              <div style={{ fontSize: '14px', marginBottom: '16px' }}>{error}</div>
              <button onClick={() => startCamera()} style={{ padding: '8px 20px', background: '#0078D4', border: 'none', color: '#fff', cursor: 'pointer' }}>
                Try Again
              </button>
            </div>
          ) : (
            <>
              <video ref={videoRef} autoPlay muted playsInline style={{ maxWidth: '100%', maxHeight: '100%', transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }} />
              {flash && <div style={{ position: 'absolute', inset: 0, background: '#fff', opacity: 0.8, pointerEvents: 'none' }} />}
              {countdown > 0 && (
                <div style={{ position: 'absolute', fontSize: '120px', fontWeight: 100, opacity: 0.9, textShadow: '0 0 20px rgba(0,0,0,0.5)' }}>{countdown}</div>
              )}
              {recording && (
                <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0,0,0,0.5)', padding: '6px 12px', borderRadius: '20px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#d13438', animation: 'blink 1s infinite' }} />
                  <span style={{ fontSize: '13px' }}>REC</span>
                </div>
              )}
              <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', border: '1px solid rgba(255,255,255,0)' }}>
                {[1, 2].map((index) => (
                  <div key={`v-${index}`} style={{ position: 'absolute', left: `${index * 33.33}%`, top: 0, bottom: 0, borderLeft: '1px solid rgba(255,255,255,0.2)' }} />
                ))}
                {[1, 2].map((index) => (
                  <div key={`h-${index}`} style={{ position: 'absolute', top: `${index * 33.33}%`, left: 0, right: 0, borderTop: '1px solid rgba(255,255,255,0.2)' }} />
                ))}
              </div>
            </>
          )}

          <canvas ref={canvasRef} style={{ display: 'none' }} />

          {hasCamera && (
            <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '24px', alignItems: 'center' }}>
              {mode === 'photo' ? (
                <button onClick={takePhoto} style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#fff', border: '4px solid rgba(255,255,255,0.5)', cursor: 'pointer', boxShadow: '0 0 0 4px rgba(0,0,0,0.5)' }} />
              ) : (
                <button
                  onClick={recording ? stopRecording : startRecording}
                  style={{ width: '64px', height: '64px', borderRadius: '50%', background: recording ? '#d13438' : '#fff', border: '4px solid rgba(255,255,255,0.5)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 4px rgba(0,0,0,0.5)' }}
                >
                  {recording ? (
                    <div style={{ width: '18px', height: '18px', background: '#fff', borderRadius: '4px' }} />
                  ) : (
                    <div style={{ width: '18px', height: '18px', background: '#d13438', borderRadius: '50%' }} />
                  )}
                </button>
              )}
            </div>
          )}
        </div>

        {photos.length > 0 && (
          <div style={{ width: '120px', background: '#1a1a1a', overflowY: 'auto', padding: '8px', display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
            {photos.map((url, index) => (
              <div key={index} style={{ position: 'relative', cursor: 'pointer' }} onClick={() => downloadPhoto(url)}>
                <img src={url} alt={`Photo ${index + 1}`} style={{ width: '100%', objectFit: 'cover', display: 'block' }} />
                <div
                  style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'all 150ms' }}
                  onMouseEnter={(event) => {
                    event.currentTarget.style.background = 'rgba(0,0,0,0.5)';
                    event.currentTarget.style.opacity = '1';
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.background = 'rgba(0,0,0,0)';
                    event.currentTarget.style.opacity = '0';
                  }}
                >
                  <FluentIcon name="download" size={20} white />
                </div>
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
  background: 'rgba(255,255,255,0.1)',
  border: 'none',
  color: '#fff',
  cursor: 'pointer',
  padding: '6px 10px',
  fontSize: '16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};
