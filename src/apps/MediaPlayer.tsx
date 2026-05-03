import { useState, useRef, useEffect } from 'react';
import { FluentIcon } from '../components/Window';

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

  const track = tracks.find((entry) => entry.id === currentTrack);

  const playTrack = (id: string) => {
    setCurrentTrack(id);
    setPlaying(true);
    setElapsed(0);
    setProgress(0);
    setTab('nowplaying');

    try {
      if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();
      const context = audioCtxRef.current;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.connect(gain);
      gain.connect(context.destination);
      gain.gain.setValueAtTime(volume * 0.1, context.currentTime);
      oscillator.frequency.setValueAtTime(440, context.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(220, context.currentTime + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.3);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.3);
    } catch {}
  };

  const handleNext = () => {
    const index = tracks.findIndex((entry) => entry.id === currentTrack);
    if (shuffle) {
      const randomIndex = Math.floor(Math.random() * tracks.length);
      playTrack(tracks[randomIndex].id);
    } else if (index < tracks.length - 1) {
      playTrack(tracks[index + 1].id);
    } else if (repeat === 'all') {
      playTrack(tracks[0].id);
    } else {
      setPlaying(false);
    }
  };

  const handlePrev = () => {
    if (elapsed > 3) {
      setElapsed(0);
      setProgress(0);
      return;
    }

    const index = tracks.findIndex((entry) => entry.id === currentTrack);
    if (index > 0) playTrack(tracks[index - 1].id);
  };

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setElapsed((previous) => {
          if (!track) return 0;
          const next = previous + 1;
          if (next >= track.duration) {
            handleNext();
            return 0;
          }
          setProgress((next / track.duration) * 100);
          return next;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [playing, track]);

  const albumColors = ['#0078D4', '#107C10', '#8764B8', '#CA5010', '#038387', '#C239B3'];
  const getColor = (id: string) => albumColors[parseInt(id, 10) % albumColors.length];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#1e1e1e', color: '#fff', fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ background: '#111', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ width: '48px', height: '48px', background: track ? getColor(track.id) : '#333', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <FluentIcon name="music_note_1" size={24} color="#ffffff" />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '14px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {track?.title || 'No track selected'}
          </div>
          <div style={{ fontSize: '12px', opacity: 0.7 }}>{track?.artist || ''}</div>
        </div>

        <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', opacity: 0.6 }}>
            <span>{fmtTime(elapsed)}</span>
            <span>{fmtTime(track?.duration || 0)}</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={progress}
            onChange={(event) => {
              if (!track) return;
              const nextProgress = Number(event.target.value);
              setProgress(nextProgress);
              setElapsed(Math.floor((nextProgress / 100) * track.duration));
            }}
            style={{ width: '100%', accentColor: '#0078D4' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
          <button onClick={() => setShuffle((value) => !value)} title="Shuffle" style={{ ...ctrlBtn, opacity: shuffle ? 1 : 0.5 }}>
            <FluentIcon name="shuffle" size={18} white />
          </button>
          <button onClick={handlePrev} title="Previous" style={ctrlBtn}>
            <FluentIcon name="step_back" size={18} white />
          </button>
          <button
            onClick={() => {
              if (!currentTrack) return;
              setPlaying((value) => !value);
            }}
            title={playing ? 'Pause' : 'Play'}
            style={{ ...ctrlBtn, width: '40px', height: '40px', borderRadius: '50%', background: '#0078D4' }}
          >
            <FluentIcon name={playing ? 'pause' : 'play'} size={18} white />
          </button>
          <button onClick={handleNext} title="Next" style={ctrlBtn}>
            <FluentIcon name="step_forward" size={18} white />
          </button>
          <button onClick={() => setRepeat((value) => value === 'none' ? 'all' : value === 'all' ? 'one' : 'none')} title="Repeat" style={{ ...ctrlBtn, opacity: repeat !== 'none' ? 1 : 0.5 }}>
            <FluentIcon name={repeat === 'one' ? 'repeat_1' : 'repeat'} size={18} white />
          </button>
          <button onClick={() => setMuted((value) => !value)} title="Mute" style={ctrlBtn}>
            <FluentIcon name={muted ? 'speaker_off' : 'speaker_2'} size={18} white />
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={muted ? 0 : volume}
            onChange={(event) => {
              setVolume(Number(event.target.value));
              setMuted(false);
            }}
            style={{ width: '70px', accentColor: '#0078D4' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', background: '#1a1a1a', borderBottom: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
        {([['nowplaying', 'Now Playing'], ['library', 'Library'], ['playlists', 'Playlists']] as const).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            style={{ padding: '10px 20px', background: 'none', border: 'none', color: tab === id ? '#0078D4' : 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '13px', borderBottom: tab === id ? '2px solid #0078D4' : '2px solid transparent' }}
          >
            {label}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflow: 'auto' }}>
        {tab === 'nowplaying' && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: '20px' }}>
            {track ? (
              <>
                <div style={{ width: '200px', height: '200px', background: getColor(track.id), display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 16px 48px rgba(0,0,0,0.5)' }}>
                  <FluentIcon name="music_note_1" size={80} color="#ffffff" />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '22px', fontWeight: 400, marginBottom: '4px' }}>{track.title}</div>
                  <div style={{ opacity: 0.7, fontSize: '14px' }}>{track.artist}</div>
                  <div style={{ opacity: 0.5, fontSize: '12px', marginTop: '4px' }}>{track.album}</div>
                </div>
                <div style={{ display: 'flex', gap: '16px', fontSize: '12px', opacity: 0.75 }}>
                  <span style={metaAction}><FluentIcon name="heart" size={14} white /> Like</span>
                  <span style={metaAction}><FluentIcon name="plus" size={14} white /> Add to playlist</span>
                  <span style={metaAction}><FluentIcon name="more_horizontal" size={14} white /> More</span>
                </div>
              </>
            ) : (
              <div style={{ opacity: 0.6, textAlign: 'center' }}>
                <div style={{ display: 'inline-flex', width: '84px', height: '84px', borderRadius: '24px', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.06)', marginBottom: '12px' }}>
                  <FluentIcon name="music_note_1" size={36} white />
                </div>
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
                <th style={{ padding: '8px 16px', textAlign: 'right', fontWeight: 500, opacity: 0.6 }}><FluentIcon name="clock" size={14} color="rgba(255,255,255,0.65)" /></th>
              </tr>
            </thead>
            <tbody>
              {tracks.map((entry, index) => (
                <tr
                  key={entry.id}
                  onDoubleClick={() => playTrack(entry.id)}
                  style={{ background: currentTrack === entry.id ? 'rgba(0,120,212,0.2)' : 'transparent', cursor: 'pointer' }}
                  onMouseEnter={(event) => {
                    if (currentTrack !== entry.id) event.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  }}
                  onMouseLeave={(event) => {
                    if (currentTrack !== entry.id) event.currentTarget.style.background = '';
                  }}
                >
                  <td style={{ padding: '10px 16px', opacity: 0.7 }}>
                    {currentTrack === entry.id && playing ? <FluentIcon name="play" size={14} color="#ffffff" /> : index + 1}
                  </td>
                  <td style={{ padding: '10px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '36px', height: '36px', background: getColor(entry.id), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <FluentIcon name="music_note_1" size={16} color="#ffffff" />
                      </div>
                      <span style={{ fontWeight: currentTrack === entry.id ? 600 : 400, color: currentTrack === entry.id ? '#7bc1ff' : '#fff' }}>{entry.title}</span>
                    </div>
                  </td>
                  <td style={{ padding: '10px 16px', opacity: 0.7 }}>{entry.artist}</td>
                  <td style={{ padding: '10px 16px', opacity: 0.7 }}>{entry.album}</td>
                  <td style={{ padding: '10px 16px', textAlign: 'right', opacity: 0.5 }}>{fmtTime(entry.duration)}</td>
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
            ].map((playlist) => (
              <div
                key={playlist.name}
                style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', cursor: 'pointer' }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                }}
              >
                <div style={{ width: '60px', height: '60px', background: playlist.color, marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FluentIcon name="music_note_1" size={28} color="#ffffff" />
                </div>
                <div style={{ fontWeight: 500 }}>{playlist.name}</div>
                <div style={{ fontSize: '12px', opacity: 0.6, marginTop: '2px' }}>{playlist.count} tracks</div>
              </div>
            ))}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '2px dashed rgba(255,255,255,0.2)', padding: '16px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', minHeight: '100px' }}>
              <FluentIcon name="plus" size={24} color="rgba(255,255,255,0.6)" />
              <div style={{ fontSize: '12px', opacity: 0.6 }}>New Playlist</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const ctrlBtn: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: '#fff',
  cursor: 'pointer',
  padding: '4px 6px',
  lineHeight: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const metaAction: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
};

function fmtTime(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}
