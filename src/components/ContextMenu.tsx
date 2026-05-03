import { useEffect, useRef, useState } from 'react';

interface MenuItem {
  label?: string;
  separator?: boolean;
  icon?: string;
  shortcut?: string;
  onClick?: () => void;
  submenu?: MenuItem[];
  disabled?: boolean;
}

interface ContextMenuProps {
  x: number;
  y: number;
  items: MenuItem[];
  onClose: () => void;
  dark?: boolean;
}

export function ContextMenu({ x, y, items, onClose, dark }: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x, y });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    let nx = x, ny = y;
    if (x + rect.width > window.innerWidth) nx = window.innerWidth - rect.width - 4;
    if (y + rect.height > window.innerHeight - 48) ny = window.innerHeight - 48 - rect.height - 4;
    setPos({ x: Math.max(0, nx), y: Math.max(0, ny) });
  }, [x, y]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) onClose();
    };
    const kh = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', kh);
    return () => { document.removeEventListener('mousedown', handler); document.removeEventListener('keydown', kh); };
  }, [onClose]);

  const bg = dark ? '#2d2d2d' : '#ffffff';
  const borderC = dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)';
  const textC = dark ? '#fff' : '#1a1a1a';
  const hoverBg = dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)';
  const sepC = dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';

  return (
    <div
      ref={ref}
      style={{
        position: 'fixed', left: pos.x, top: pos.y,
        background: bg, border: `1px solid ${borderC}`,
        boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
        zIndex: 99999, minWidth: '160px', padding: '2px 0',
        animation: 'contextFade 100ms ease',
      }}
    >
      {items.map((item, i) => (
        item.separator
          ? <div key={i} style={{ height: '1px', background: sepC, margin: '3px 0' }} />
          : <MenuItemEl key={i} item={item} onClose={onClose} textC={textC} hoverBg={hoverBg} sepC={sepC} bg={bg} dark={dark} />
      ))}
      <style>{`@keyframes contextFade { from { opacity:0; transform:scale(0.97) } to { opacity:1; transform:scale(1) } }`}</style>
    </div>
  );
}

function MenuItemEl({ item, onClose, textC, hoverBg, sepC, bg, dark }: {
  item: MenuItem; onClose: () => void; textC: string; hoverBg: string; sepC: string; bg: string; dark?: boolean;
}) {
  const [hover, setHover] = useState(false);
  const [subOpen, setSubOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleClick = () => {
    if (item.submenu) return;
    if (item.onClick) item.onClick();
    onClose();
  };

  return (
    <div
      ref={ref}
      style={{
        position: 'relative',
        padding: '5px 24px 5px 32px',
        cursor: item.disabled ? 'default' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: hover ? hoverBg : 'transparent',
        color: item.disabled ? '#aaa' : textC,
        fontSize: '13px',
        userSelect: 'none',
      }}
      onMouseEnter={() => { setHover(true); setSubOpen(!!item.submenu); }}
      onMouseLeave={() => { setHover(false); setSubOpen(false); }}
      onClick={handleClick}
    >
      <span>{item.label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {item.shortcut && <span style={{ fontSize: '11px', opacity: 0.6 }}>{item.shortcut}</span>}
        {item.submenu && <span style={{ opacity: 0.7 }}>›</span>}
      </div>

      {/* Submenu */}
      {item.submenu && subOpen && (
        <div style={{
          position: 'absolute', left: '100%', top: -2,
          background: bg, border: `1px solid rgba(0,0,0,0.15)`,
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          minWidth: '140px', padding: '2px 0', zIndex: 1,
        }}>
          {item.submenu.map((sub, j) => (
            sub.separator
              ? <div key={j} style={{ height: '1px', background: sepC, margin: '3px 0' }} />
              : <MenuItemEl key={j} item={sub} onClose={onClose} textC={textC} hoverBg={hoverBg} sepC={sepC} bg={bg} dark={dark} />
          ))}
        </div>
      )}
    </div>
  );
}
