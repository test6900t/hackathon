import { useState, useRef, useEffect } from 'react';

const SAMPLE_TRACKS = [
  { id: '1', title: 'Ambient Waves', artist: 'Error64 Sounds', duration: 243, album: 'System Sounds' },
  { id: '2', title: 'Digital Dreams', artist: 'Error64 Sounds', duration: 187, album: 'System Sounds' },
  { id: '3', title: 'Circuit Breaker', artist: 'Error64 Sounds', duration: 312, album: 'Startup Beats' },
  { id: '4', title: 'Binary Sunrise', artist: 'Error64 Sounds', duration: 228, album: 'Startup Beats' },
  { id: '5', title: 'Memory Leak', artist: 'Error64 Sounds', duration: 195, album: 'Debug Sessions' },
  { id: '6', title: 'Stack Overflow', artist: 'Error64 Sounds', duration: 267, album: 'Debug Sessions' },
];

export function MediaPlayer() {
  const [tracks] = useState(SAMPLE_TRACKS);
  const [currentTrack, setCurrentTrack] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [muted, setMuted] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<'none' | 'all' | 'one'>('none');
  const [tab, setTab] = useState<'nowplaying' | 'library' | 'playlists'>('library');
  const [elapsed, setElapsed] = useState(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const track = tracks.find(t => t.id === currentTrack);

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setElapsed(prev => {
          if (!track) return 0;
          const next = prev + 1;
          if (next >= track.duration) {
            handleNext();
            return 0;
          }
          setProgress((next / track.duration) * 100);
          return next;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [playing, track]);

  const playTrack = (id: string) => {
    setCurrentTrack(id); setPlaying(true); setElapsed(0); setProgress(0);
    setTab('nowplaying');
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      gain.gain.setValueAtTime(volume * 0.1, ctx.currentTime);
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start(); osc.stop(ctx.currentTime + 0.3);
    } catch {}
  };

  const handleNext = () => {
    const idx = tracks.findIndex(t => t.id === currentTrack);
    if (shuffle) {
      const r = Math.floor(Math.random() * tracks.length);
      playTrack(tracks[r].id);
    } else if (idx < tracks.length - 1) {
      playTrack(tracks[idx + 1].id);
    } else if (repeat === 'all') {
      playTrack(tracks[0].id);
    } else {
      setPlaying(false);
    }
  };

  const handlePrev = () => {
    if (elapsed > 3) { setElapsed(0); setProgress(0); return; }
    const idx = tracks.findIndex(t => t.id === currentTrack);
    if (idx > 0) playTrack(tracks[idx - 1].id);
  };

  const fmtTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const albumColors = ['#0078D4','#107C10','#8764B8','#CA5010','#038387','#C239B3'];
  const getColor = (id: string) => albumColors[parseInt(id) % albumColors.length];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#1e1e1e', color: '#fff', fontFamily: "'Segoe UI', sans-serif" }}>
      {/* Now playing bar */}
      <div style={{ background: '#111', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        {/* Album art */}
        <div style={{ width: '48px', height: '48px', background: track ? getColor(track.id) : '#333', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
          {track ? '♪' : '🎵'}
        </div>
        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '14px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {track?.title || 'No track selected'}
          </div>
          <div style={{ fontSize: '12px', opacity: 0.7 }}>{track?.artist || ''}</div>
        </div>
        {/* Progress */}
        <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', opacity: 0.6 }}>
            <span>{fmtTime(elapsed)}</span>
            <span>{fmtTime(track?.duration || 0)}</span>
          </div>
          <input type="range" min={0} max={100} value={progress}
            onChange={e => { if (!track) return; const p = Number(e.target.value); setProgress(p); setElapsed(Math.floor(p / 100 * track.duration)); }}
            style={{ width: '100%', accentColor: '#0078D4' }} />
        </div>
        {/* Controls */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
          <button onClick={() => setShuffle(v => !v)} title="Shuffle" style={{ ...ctrlBtn, opacity: shuffle ? 1 : 0.5 }}>⇌</button>
          <button onClick={handlePrev} title="Previous" style={ctrlBtn}>⏮</button>
          <button onClick={() => { if (!currentTrack) return; setPlaying(v => !v); }} title={playing ? 'Pause' : 'Play'}
            style={{ ...ctrlBtn, width: '40px', height: '40px', borderRadius: '50%', background: '#0078D4', fontSize: '18px' }}>
            {playing ? '⏸' : '▶'}
          </button>
          <button onClick={handleNext} title="Next" style={ctrlBtn}>⏭</button>
          <button onClick={() => setRepeat(r => r === 'none' ? 'all' : r === 'all' ? 'one' : 'none')} title="Repeat"
            style={{ ...ctrlBtn, opacity: repeat !== 'none' ? 1 : 0.5 }}>
            {repeat === 'one' ? '🔂' : '🔁'}
          </button>
          <button onClick={() => setMuted(v => !v)} title="Mute" style={ctrlBtn}>{muted ? '🔇' : '🔊'}</button>
          <input type="range" min={0} max={1} step={0.01} value={muted ? 0 : volume}
            onChange={e => { setVolume(Number(e.target.value)); setMuted(false); }}
            style={{ width: '70px', accentColor: '#0078D4' }} />
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', background: '#1a1a1a', borderBottom: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
        {([['nowplaying','Now Playing'],['library','Library'],['playlists','Playlists']] as const).map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            style={{ padding: '10px 20px', background: 'none', border: 'none', color: tab === id ? '#0078D4' : 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '13px', borderBottom: tab === id ? '2px solid #0078D4' : '2px solid transparent' }}>
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {tab === 'nowplaying' && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: '20px' }}>
            {track ? (
              <>
                <div style={{ width: '200px', height: '200px', background: getColor(track.id), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '80px', boxShadow: '0 16px 48px rgba(0,0,0,0.5)' }}>♪</div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '22px', fontWeight: 400, marginBottom: '4px' }}>{track.title}</div>
                  <div style={{ opacity: 0.7, fontSize: '14px' }}>{track.artist}</div>
                  <div style={{ opacity: 0.5, fontSize: '12px', marginTop: '4px' }}>{track.album}</div>
                </div>
                <div style={{ display: 'flex', gap: '16px', fontSize: '12px', opacity: 0.5 }}>
                  <span>♥ Like</span>
                  <span>+ Add to playlist</span>
                  <span>⋯ More</span>
                </div>
              </>
            ) : (
              <div style={{ opacity: 0.5, textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎵</div>
                <div>Select a track to play</div>
              </div>
            )}
          </div>
        )}

        {tab === 'library' && (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#111', position: 'sticky', top: 0 }}>
                <th style={{ padding: '8px 16px', textAlign: 'left', fontWeight: 500, opacity: 0.6, width: '32px' }}>#</th>
                <th style={{ padding: '8px 16px', textAlign: 'left', fontWeight: 500, opacity: 0.6 }}>Title</th>
                <th style={{ padding: '8px 16px', textAlign: 'left', fontWeight: 500, opacity: 0.6 }}>Artist</th>
                <th style={{ padding: '8px 16px', textAlign: 'left', fontWeight: 500, opacity: 0.6 }}>Album</th>
                <th style={{ padding: '8px 16px', textAlign: 'right', fontWeight: 500, opacity: 0.6 }}>⏱</th>
              </tr>
            </thead>
            <tbody>
              {tracks.map((t, i) => (
                <tr key={t.id}
                  onDoubleClick={() => playTrack(t.id)}
                  style={{ background: currentTrack === t.id ? 'rgba(0,120,212,0.2)' : 'transparent', cursor: 'pointer' }}
                  onMouseEnter={e => { if (currentTrack !== t.id) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                  onMouseLeave={e => { if (currentTrack !== t.id) e.currentTarget.style.background = ''; }}>
                  <td style={{ padding: '10px 16px', opacity: 0.5 }}>
                    {currentTrack === t.id && playing ? '▶' : i + 1}
                  </td>
                  <td style={{ padding: '10px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '36px', height: '36px', background: getColor(t.id), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>♪</div>
                      <span style={{ fontWeight: currentTrack === t.id ? 600 : 400, color: currentTrack === t.id ? '#0078D4' : '#fff' }}>{t.title}</span>
                    </div>
                  </td>
                  <td style={{ padding: '10px 16px', opacity: 0.7 }}>{t.artist}</td>
                  <td style={{ padding: '10px 16px', opacity: 0.7 }}>{t.album}</td>
                  <td style={{ padding: '10px 16px', textAlign: 'right', opacity: 0.5 }}>{fmtTime(t.duration)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === 'playlists' && (
          <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
            {[
              { name: 'Favorites', count: 3, color: '#8764B8' },
              { name: 'Chill', count: 2, color: '#038387' },
              { name: 'Work Focus', count: 4, color: '#107C10' },
            ].map(pl => (
              <div key={pl.name} style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', cursor: 'pointer' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}>
                <div style={{ width: '60px', height: '60px', background: pl.color, marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>♬</div>
                <div style={{ fontWeight: 500 }}>{pl.name}</div>
                <div style={{ fontSize: '12px', opacity: 0.6, marginTop: '2px' }}>{pl.count} tracks</div>
              </div>
            ))}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '2px dashed rgba(255,255,255,0.2)', padding: '16px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', minHeight: '100px' }}>
              <div style={{ fontSize: '24px', opacity: 0.5 }}>+</div>
              <div style={{ fontSize: '12px', opacity: 0.5 }}>New Playlist</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const ctrlBtn: React.CSSProperties = {
  background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '20px', padding: '4px 6px', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
};

function fmtTime(s: number) { return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; }
