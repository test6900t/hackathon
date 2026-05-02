import { useState, useRef } from 'react';
import { FluentIcon } from '../components/Window';

const SAMPLE_PHOTOS = [
  { id: '1', url: 'https://picsum.photos/seed/error64a/600/400', name: 'photo_001.jpg', date: '2024-01-15', size: '2.3 MB' },
  { id: '2', url: 'https://picsum.photos/seed/error64b/600/400', name: 'photo_002.jpg', date: '2024-01-20', size: '1.8 MB' },
  { id: '3', url: 'https://picsum.photos/seed/error64c/600/400', name: 'photo_003.jpg', date: '2024-02-03', size: '3.1 MB' },
  { id: '4', url: 'https://picsum.photos/seed/error64d/600/400', name: 'photo_004.jpg', date: '2024-02-11', size: '2.7 MB' },
  { id: '5', url: 'https://picsum.photos/seed/error64e/600/400', name: 'photo_005.jpg', date: '2024-03-01', size: '1.5 MB' },
  { id: '6', url: 'https://picsum.photos/seed/error64f/600/400', name: 'photo_006.jpg', date: '2024-03-15', size: '4.2 MB' },
  { id: '7', url: 'https://picsum.photos/seed/error64g/600/400', name: 'photo_007.jpg', date: '2024-04-02', size: '3.0 MB' },
  { id: '8', url: 'https://picsum.photos/seed/error64h/600/400', name: 'photo_008.jpg', date: '2024-04-20', size: '2.1 MB' },
  { id: '9', url: 'https://picsum.photos/seed/error64i/600/400', name: 'photo_009.jpg', date: '2024-05-05', size: '2.9 MB' },
];

export function Photos() {
  const [photos, setPhotos] = useState(SAMPLE_PHOTOS);
  const [selected, setSelected] = useState<string | null>(null);
  const [view, setView] = useState<'grid' | 'detail'>('grid');
  const [zoom, setZoom] = useState(1);
  const [filter, setFilter] = useState<'none' | 'grayscale' | 'sepia' | 'brightness' | 'contrast'>('none');
  const [tab, setTab] = useState<'collection' | 'albums' | 'people' | 'folders'>('collection');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedPhoto = photos.find(p => p.id === selected);
  const selectedIdx = photos.findIndex(p => p.id === selected);

  const prev = () => { if (selectedIdx > 0) setSelected(photos[selectedIdx - 1].id); };
  const next = () => { if (selectedIdx < photos.length - 1) setSelected(photos[selectedIdx + 1].id); };

  const importPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => {
        const url = ev.target?.result as string;
        setPhotos(prev => [...prev, { id: `img-${Date.now()}`, url, name: file.name, date: new Date().toISOString().split('T')[0], size: `${(file.size / 1048576).toFixed(1)} MB` }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const deletePhoto = (id: string) => {
    setPhotos(p => p.filter(x => x.id !== id));
    setSelected(null);
  };

  const filters: Record<string, string> = {
    none: 'none',
    grayscale: 'grayscale(100%)',
    sepia: 'sepia(100%)',
    brightness: 'brightness(150%)',
    contrast: 'contrast(150%)',
  };

  return (
    <div style={{ display: 'flex', height: '100%', fontFamily: "'Segoe UI', sans-serif", background: '#1a1a1a', color: '#fff' }}>
      {/* Sidebar */}
      <div style={{ width: '180px', background: '#111', borderRight: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        {[
          { id: 'collection', label: 'Collection', icon: 'image_multiple' },
          { id: 'albums', label: 'Albums', icon: 'album' },
          { id: 'people', label: 'People', icon: 'person' },
          { id: 'folders', label: 'Folders', icon: 'folder' },
        ].map(t => (
          <div key={t.id} onClick={() => setTab(t.id as typeof tab)}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', cursor: 'pointer', fontSize: '13px', background: tab === t.id ? 'rgba(255,255,255,0.1)' : 'transparent' }}>
            <FluentIcon name={t.icon} size={18} />
            {t.label}
          </div>
        ))}
        <div style={{ marginTop: 'auto', padding: '12px' }}>
          <button onClick={() => fileInputRef.current?.click()}
            style={{ width: '100%', padding: '8px', background: '#0078D4', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
            <FluentIcon name="add" size={14} /> Import
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={importPhoto} style={{ display: 'none' }} />
        </div>
      </div>

      {/* Main */}
      {selected && view === 'detail' ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#0a0a0a' }}>
          {/* Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: '#111', flexShrink: 0 }}>
            <button onClick={() => { setSelected(null); setView('grid'); }} style={toolBtn}>← Back</button>
            <div style={{ flex: 1, textAlign: 'center', fontSize: '13px', opacity: 0.8 }}>{selectedPhoto?.name}</div>
            <div style={{ display: 'flex', gap: '4px' }}>
              {(['none','grayscale','sepia','brightness','contrast'] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{ ...toolBtn, background: filter === f ? '#0078D4' : 'transparent', fontSize: '11px', padding: '4px 8px' }}>{f}</button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button onClick={() => setZoom(z => Math.max(0.2, z - 0.2))} style={toolBtn}>−</button>
              <span style={{ fontSize: '12px', minWidth: '40px', textAlign: 'center', lineHeight: '28px' }}>{Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom(z => Math.min(4, z + 0.2))} style={toolBtn}>+</button>
            </div>
            <button onClick={() => deletePhoto(selected!)} style={{ ...toolBtn, background: 'rgba(220,50,50,0.3)' }}>🗑</button>
          </div>

          {/* Image */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
            <button onClick={prev} disabled={selectedIdx === 0} style={{ position: 'absolute', left: '20px', zIndex: 10, background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', cursor: 'pointer', width: '40px', height: '40px', fontSize: '20px', borderRadius: '50%', opacity: selectedIdx === 0 ? 0.3 : 1 }}>‹</button>
            {selectedPhoto && (
              <img src={selectedPhoto.url} alt={selectedPhoto.name}
                style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain', transform: `scale(${zoom})`, filter: filters[filter], transition: 'filter 200ms' }} />
            )}
            <button onClick={next} disabled={selectedIdx === photos.length - 1} style={{ position: 'absolute', right: '20px', zIndex: 10, background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', cursor: 'pointer', width: '40px', height: '40px', fontSize: '20px', borderRadius: '50%', opacity: selectedIdx === photos.length - 1 ? 0.3 : 1 }}>›</button>
          </div>

          {/* Film strip */}
          <div style={{ height: '80px', display: 'flex', gap: '4px', padding: '8px', background: '#111', overflowX: 'auto', flexShrink: 0 }}>
            {photos.map(p => (
              <img key={p.id} src={p.url} alt={p.name}
                onClick={() => setSelected(p.id)}
                style={{ height: '64px', width: '96px', objectFit: 'cover', cursor: 'pointer', opacity: p.id === selected ? 1 : 0.5, border: p.id === selected ? '2px solid #0078D4' : '2px solid transparent', flexShrink: 0 }} />
            ))}
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Toolbar */}
          <div style={{ display: 'flex', gap: '8px', padding: '8px 12px', background: '#1a1a1a', borderBottom: '1px solid rgba(255,255,255,0.1)', alignItems: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: '15px', fontWeight: 300 }}>All Photos</span>
            <span style={{ opacity: 0.5, fontSize: '13px' }}>({photos.length} items)</span>
          </div>

          {/* Grid */}
          <div style={{ flex: 1, overflow: 'auto', padding: '8px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '4px' }}>
              {photos.map(p => (
                <div key={p.id}
                  onClick={() => { setSelected(p.id); setView('detail'); }}
                  style={{ cursor: 'pointer', position: 'relative', aspectRatio: '4/3', overflow: 'hidden', background: '#222' }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
                  <img src={p.url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} loading="lazy" />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.7))', padding: '12px 6px 4px', fontSize: '11px', opacity: 0.9 }}>
                    {p.date}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const toolBtn: React.CSSProperties = {
  background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', cursor: 'pointer', padding: '6px 12px', fontSize: '13px',
};
