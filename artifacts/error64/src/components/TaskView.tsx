import { useOS } from '../os/OSContext';
import { FluentIcon } from './Window';

export function TaskView() {
  const { taskViewOpen, setTaskViewOpen, windows, bringToFront, restoreWindow, closeWindow, desktops, currentDesktop, setCurrentDesktop, addDesktop, removeDesktop } = useOS();

  if (!taskViewOpen) return null;

  const handleWindowClick = (id: string) => {
    bringToFront(id);
    restoreWindow(id);
    setTaskViewOpen(false);
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, bottom: '48px', zIndex: 9996,
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(20px)',
        display: 'flex', flexDirection: 'column',
        animation: 'fadeIn 150ms ease',
        color: '#fff',
      }}
      onClick={() => setTaskViewOpen(false)}
    >
      {/* Desktops bar */}
      <div style={{ padding: '20px 30px', display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
        <span style={{ fontSize: '13px', opacity: 0.7, marginRight: '8px' }}>Virtual Desktops:</span>
        {desktops.map((name, i) => (
          <div
            key={i}
            style={{
              padding: '6px 16px', cursor: 'pointer', fontSize: '13px',
              background: i === currentDesktop ? '#0078D4' : 'rgba(255,255,255,0.15)',
              border: i === currentDesktop ? 'none' : '1px solid rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}
            onClick={() => { setCurrentDesktop(i); setTaskViewOpen(false); }}
          >
            {name}
            {desktops.length > 1 && (
              <button
                onClick={e => { e.stopPropagation(); removeDesktop(i); }}
                style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', opacity: 0.7, padding: '0 2px', fontSize: '12px' }}
              >✕</button>
            )}
          </div>
        ))}
        <button
          onClick={addDesktop}
          style={{
            padding: '6px 16px', background: 'rgba(255,255,255,0.1)',
            border: '1px dashed rgba(255,255,255,0.3)', color: '#fff',
            cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px',
          }}
        >
          <span style={{ fontSize: '16px' }}>+</span> New Desktop
        </button>
      </div>

      {/* Window thumbnails */}
      <div style={{
        flex: 1, display: 'flex', flexWrap: 'wrap', gap: '20px',
        padding: '20px 40px', alignContent: 'flex-start', overflowY: 'auto',
      }} onClick={e => e.stopPropagation()}>
        {windows.length === 0 ? (
          <div style={{ width: '100%', textAlign: 'center', opacity: 0.5, paddingTop: '60px', fontSize: '16px' }}>
            No open windows on this desktop
          </div>
        ) : (
          windows.map(win => (
            <div
              key={win.id}
              style={{
                width: '200px', cursor: 'pointer', position: 'relative',
                animation: 'windowOpen 150ms ease',
              }}
              onClick={() => handleWindowClick(win.id)}
            >
              {/* Window preview */}
              <div style={{
                height: '130px', background: 'rgba(255,255,255,0.9)',
                border: '2px solid transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden', position: 'relative',
              }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#0078D4')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'transparent')}
              >
                <FluentIcon name={win.icon} size={48} />
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '24px', background: '#f3f3f3', display: 'flex', alignItems: 'center', padding: '0 8px', gap: '4px' }}>
                  <FluentIcon name={win.icon} size={12} />
                  <span style={{ fontSize: '11px', color: '#333' }}>{win.title}</span>
                </div>
              </div>
              {/* Close button */}
              <button
                onClick={e => { e.stopPropagation(); closeWindow(win.id); }}
                style={{
                  position: 'absolute', top: -8, right: -8, width: '24px', height: '24px',
                  background: '#E81123', border: 'none', borderRadius: '50%', color: '#fff',
                  cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >✕</button>
              <div style={{ fontSize: '12px', textAlign: 'center', marginTop: '6px', opacity: 0.9 }}>
                {win.title}
              </div>
            </div>
          ))
        )}
      </div>
      <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}}`}</style>
    </div>
  );
}
