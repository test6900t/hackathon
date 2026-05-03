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

  const selectedPhoto = photos.find((photo) => photo.id === selected);
  const selectedIdx = photos.findIndex((photo) => photo.id === selected);

  const prev = () => {
    if (selectedIdx > 0) setSelected(photos[selectedIdx - 1].id);
  };

  const next = () => {
    if (selectedIdx < photos.length - 1) setSelected(photos[selectedIdx + 1].id);
  };

  const importPhoto = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        const url = readerEvent.target?.result as string;
        setPhotos((previous) => [...previous, { id: `img-${Date.now()}-${file.name}`, url, name: file.name, date: new Date().toISOString().split('T')[0], size: `${(file.size / 1048576).toFixed(1)} MB` }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const deletePhoto = (id: string) => {
    setPhotos((previous) => previous.filter((photo) => photo.id !== id));
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
      <div style={{ width: '180px', background: '#111', borderRight: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        {[
          { id: 'collection', label: 'Collection', icon: 'image_multiple' },
          { id: 'albums', label: 'Albums', icon: 'album' },
          { id: 'people', label: 'People', icon: 'person' },
          { id: 'folders', label: 'Folders', icon: 'folder' },
        ].map((entry) => (
          <div key={entry.id} onClick={() => setTab(entry.id as typeof tab)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', cursor: 'pointer', fontSize: '13px', background: tab === entry.id ? 'rgba(255,255,255,0.1)' : 'transparent' }}>
            <FluentIcon name={entry.icon} size={18} white />
            {entry.label}
          </div>
        ))}
        <div style={{ marginTop: 'auto', padding: '12px' }}>
          <button onClick={() => fileInputRef.current?.click()} style={{ width: '100%', padding: '8px', background: '#0078D4', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
            <FluentIcon name="add" size={14} white /> Import
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={importPhoto} style={{ display: 'none' }} />
        </div>
      </div>

      {selected && view === 'detail' ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#0a0a0a' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: '#111', flexShrink: 0 }}>
            <button onClick={() => { setSelected(null); setView('grid'); }} style={toolBtn}>
              <FluentIcon name="arrow_left" size={16} white />
              Back
            </button>
            <div style={{ flex: 1, textAlign: 'center', fontSize: '13px', opacity: 0.8 }}>{selectedPhoto?.name}</div>
            <div style={{ display: 'flex', gap: '4px' }}>
              {(['none', 'grayscale', 'sepia', 'brightness', 'contrast'] as const).map((entry) => (
                <button key={entry} onClick={() => setFilter(entry)} style={{ ...toolBtn, background: filter === entry ? '#0078D4' : 'transparent', fontSize: '11px', padding: '4px 8px' }}>{entry}</button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              <button onClick={() => setZoom((value) => Math.max(0.2, value - 0.2))} style={toolBtn}>
                <FluentIcon name="minus" size={14} white />
              </button>
              <span style={{ fontSize: '12px', minWidth: '40px', textAlign: 'center', lineHeight: '28px' }}>{Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom((value) => Math.min(4, value + 0.2))} style={toolBtn}>
                <FluentIcon name="plus" size={14} white />
              </button>
            </div>
            <button onClick={() => deletePhoto(selected)} style={{ ...toolBtn, background: 'rgba(220,50,50,0.3)' }}>
              <FluentIcon name="delete" size={16} white />
            </button>
          </div>

          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
            <button onClick={prev} disabled={selectedIdx === 0} style={galleryNavButton(selectedIdx === 0)}>
              <FluentIcon name="chevron_left" size={18} white />
            </button>
            {selectedPhoto && (
              <img src={selectedPhoto.url} alt={selectedPhoto.name} style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain', transform: `scale(${zoom})`, filter: filters[filter], transition: 'filter 200ms' }} />
            )}
            <button onClick={next} disabled={selectedIdx === photos.length - 1} style={galleryNavButton(selectedIdx === photos.length - 1, true)}>
              <FluentIcon name="chevron_right" size={18} white />
            </button>
          </div>

          <div style={{ height: '80px', display: 'flex', gap: '4px', padding: '8px', background: '#111', overflowX: 'auto', flexShrink: 0 }}>
            {photos.map((photo) => (
              <img key={photo.id} src={photo.url} alt={photo.name} onClick={() => setSelected(photo.id)} style={{ height: '64px', width: '96px', objectFit: 'cover', cursor: 'pointer', opacity: photo.id === selected ? 1 : 0.5, border: photo.id === selected ? '2px solid #0078D4' : '2px solid transparent', flexShrink: 0 }} />
            ))}
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ display: 'flex', gap: '8px', padding: '8px 12px', background: '#1a1a1a', borderBottom: '1px solid rgba(255,255,255,0.1)', alignItems: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: '15px', fontWeight: 300 }}>All Photos</span>
            <span style={{ opacity: 0.5, fontSize: '13px' }}>({photos.length} items)</span>
          </div>

          <div style={{ flex: 1, overflow: 'auto', padding: '8px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '4px' }}>
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  onClick={() => {
                    setSelected(photo.id);
                    setView('detail');
                  }}
                  style={{ cursor: 'pointer', position: 'relative', aspectRatio: '4/3', overflow: 'hidden', background: '#222' }}
                  onMouseEnter={(event) => {
                    event.currentTarget.style.opacity = '0.85';
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.opacity = '1';
                  }}
                >
                  <img src={photo.url} alt={photo.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} loading="lazy" />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.7))', padding: '12px 6px 4px', fontSize: '11px', opacity: 0.9 }}>
                    {photo.date}
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
  background: 'rgba(255,255,255,0.1)',
  border: 'none',
  color: '#fff',
  cursor: 'pointer',
  padding: '6px 12px',
  fontSize: '13px',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
};

function galleryNavButton(disabled: boolean, right?: boolean): React.CSSProperties {
  return {
    position: 'absolute',
    ...(right ? { right: '20px' } : { left: '20px' }),
    zIndex: 10,
    background: 'rgba(0,0,0,0.5)',
    border: 'none',
    color: '#fff',
    cursor: disabled ? 'default' : 'pointer',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    opacity: disabled ? 0.3 : 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };
}
