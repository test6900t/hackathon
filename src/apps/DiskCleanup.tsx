import { useState } from 'react';

const ITEMS = [
  { name: 'Downloaded Program Files', size: 12.4, selected: true, desc: 'Downloaded program files include ActiveX controls and Java applets downloaded automatically from the Internet when you view certain pages.' },
  { name: 'Temporary Internet Files', size: 153.2, selected: true, desc: 'The Temporary Internet Files folder contains Web pages stored on your hard disk for quick viewing.' },
  { name: 'Error Reports', size: 4.8, selected: false, desc: 'Error report files are created when a program errors.' },
  { name: 'Delivery Optimization Files', size: 89.1, selected: true, desc: 'Previously downloaded files used for delivery optimization.' },
  { name: 'Recycle Bin', size: 0, selected: false, desc: 'The Recycle Bin contains files you have deleted from your computer.' },
  { name: 'Setup Log Files', size: 2.1, selected: false, desc: 'Log files created by Error64 Setup.' },
  { name: 'Temporary Files', size: 76.3, selected: true, desc: 'Programs sometimes store temporary information in a TEMP folder.' },
  { name: 'Thumbnails', size: 34.7, selected: true, desc: 'Thumbnail cache files are used to display thumbnail images quickly.' },
];

export function DiskCleanup() {
  const [items, setItems] = useState(ITEMS);
  const [selectedItem, setSelectedItem] = useState(ITEMS[0]);
  const [cleaning, setCleaning] = useState(false);
  const [done, setDone] = useState(false);
  const [progress, setProgress] = useState(0);

  const totalSelected = items.filter(i => i.selected).reduce((sum, i) => sum + i.size, 0);

  const toggle = (name: string) => {
    setItems(prev => prev.map(i => i.name === name ? { ...i, selected: !i.selected } : i));
  };

  const cleanup = () => {
    setCleaning(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setCleaning(false);
          setDone(true);
          setItems(prev => prev.map(i => i.selected ? { ...i, size: 0 } : i));
          return 100;
        }
        return p + 3;
      });
    }, 60);
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', fontFamily: "'Segoe UI', sans-serif", background: '#f3f3f3' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #ddd', background: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div style={{ fontSize: '40px' }}>🧹</div>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 400 }}>Disk Cleanup</h2>
            <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>Select the files you want to delete:</div>
          </div>
        </div>
      </div>

      {done ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
          <div style={{ fontSize: '64px' }}>✅</div>
          <div style={{ fontSize: '18px', fontWeight: 400 }}>Disk Cleanup Complete!</div>
          <div style={{ fontSize: '13px', color: '#666' }}>{totalSelected.toFixed(1)} MB of disk space freed</div>
        </div>
      ) : cleaning ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', padding: '40px' }}>
          <div style={{ fontSize: '40px' }}>🧹</div>
          <div style={{ fontSize: '15px' }}>Cleaning up your files...</div>
          <div style={{ width: '100%', maxWidth: '400px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
              <span>Progress</span><span>{progress}%</span>
            </div>
            <div style={{ height: '20px', background: '#ddd', position: 'relative', overflow: 'hidden' }}>
              <div style={{ width: `${progress}%`, height: '100%', background: '#0078D4', transition: 'width 100ms' }} />
            </div>
          </div>
          <button onClick={() => { setCleaning(false); setProgress(0); }}
            style={{ padding: '6px 20px', border: '1px solid #ccc', background: '#fff', cursor: 'pointer' }}>Cancel</button>
        </div>
      ) : (
        <>
          {/* File list */}
          <div style={{ flex: 1, display: 'flex', gap: 0, overflow: 'hidden' }}>
            <div style={{ flex: 1, overflow: 'auto', background: '#fff', margin: '12px 0 0 12px', border: '1px solid #ccc' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#f3f3f3' }}>
                    <th style={{ padding: '8px 8px', textAlign: 'center', width: '32px', borderBottom: '1px solid #ddd' }}></th>
                    <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Files to delete</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item.name}
                      onClick={() => setSelectedItem(item)}
                      style={{ background: selectedItem.name === item.name ? '#e8f0fe' : 'transparent', cursor: 'pointer', borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                        <input type="checkbox" checked={item.selected} onChange={() => toggle(item.name)} onClick={e => e.stopPropagation()} />
                      </td>
                      <td style={{ padding: '6px 12px' }}>{item.name}</td>
                      <td style={{ padding: '6px 12px', textAlign: 'right', color: '#555' }}>
                        {item.size > 0 ? `${item.size.toFixed(1)} MB` : '0 bytes'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Description */}
          <div style={{ padding: '8px 12px', background: '#fff', borderTop: '1px solid #ddd', fontSize: '13px', color: '#444' }}>
            <strong>Description: </strong>{selectedItem.desc}
          </div>

          {/* Total + buttons */}
          <div style={{ padding: '12px 16px', borderTop: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, background: '#f3f3f3' }}>
            <div style={{ fontSize: '13px' }}>
              Total disk space to free: <strong>{totalSelected.toFixed(1)} MB</strong>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={cleanup} disabled={totalSelected === 0}
                style={{ padding: '6px 20px', background: totalSelected > 0 ? '#0078D4' : '#ccc', color: '#fff', border: 'none', cursor: totalSelected > 0 ? 'pointer' : 'default', fontSize: '13px' }}>
                OK
              </button>
              <button style={{ padding: '6px 20px', border: '1px solid #ccc', background: '#fff', cursor: 'pointer', fontSize: '13px' }}>Cancel</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
