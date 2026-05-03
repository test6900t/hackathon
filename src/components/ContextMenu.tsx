import { useEffect, useRef, useState } from 'react';
import { FluentIcon } from './Window';

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
    const element = ref.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    let nextX = x;
    let nextY = y;
    if (x + rect.width > window.innerWidth) nextX = window.innerWidth - rect.width - 4;
    if (y + rect.height > window.innerHeight - 48) nextY = window.innerHeight - 48 - rect.height - 4;
    setPos({ x: Math.max(0, nextX), y: Math.max(0, nextY) });
  }, [x, y]);

  useEffect(() => {
    const handlePointer = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) onClose();
    };
    const handleKeyboard = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('mousedown', handlePointer);
    document.addEventListener('keydown', handleKeyboard);
    return () => {
      document.removeEventListener('mousedown', handlePointer);
      document.removeEventListener('keydown', handleKeyboard);
    };
  }, [onClose]);

  const bg = dark ? '#2d2d2d' : '#ffffff';
  const borderColor = dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)';
  const textColor = dark ? '#fff' : '#1a1a1a';
  const hoverBg = dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)';
  const separatorColor = dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';

  return (
    <div
      ref={ref}
      style={{
        position: 'fixed',
        left: pos.x,
        top: pos.y,
        background: bg,
        border: `1px solid ${borderColor}`,
        boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
        zIndex: 99999,
        minWidth: '160px',
        padding: '2px 0',
        animation: 'contextFade 100ms ease',
      }}
    >
      {items.map((item, index) => (
        item.separator
          ? <div key={index} style={{ height: '1px', background: separatorColor, margin: '3px 0' }} />
          : <MenuItemEl key={index} item={item} onClose={onClose} textColor={textColor} hoverBg={hoverBg} separatorColor={separatorColor} bg={bg} dark={dark} />
      ))}
      <style>{`@keyframes contextFade { from { opacity:0; transform:scale(0.97) } to { opacity:1; transform:scale(1) } }`}</style>
    </div>
  );
}

function MenuItemEl({ item, onClose, textColor, hoverBg, separatorColor, bg, dark }: {
  item: MenuItem;
  onClose: () => void;
  textColor: string;
  hoverBg: string;
  separatorColor: string;
  bg: string;
  dark?: boolean;
}) {
  const [hover, setHover] = useState(false);
  const [subOpen, setSubOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleClick = () => {
    if (item.submenu || item.disabled) return;
    item.onClick?.();
    onClose();
  };

  return (
    <div
      ref={ref}
      style={{
        position: 'relative',
        padding: '5px 24px 5px 32px',
        cursor: item.disabled ? 'default' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: hover ? hoverBg : 'transparent',
        color: item.disabled ? '#aaa' : textColor,
        fontSize: '13px',
        userSelect: 'none',
      }}
      onMouseEnter={() => {
        setHover(true);
        setSubOpen(Boolean(item.submenu));
      }}
      onMouseLeave={() => {
        setHover(false);
        setSubOpen(false);
      }}
      onClick={handleClick}
    >
      <span>{item.label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {item.shortcut && <span style={{ fontSize: '11px', opacity: 0.6 }}>{item.shortcut}</span>}
        {item.submenu && <FluentIcon name="chevron_right" size={13} color={item.disabled ? '#aaa' : textColor} />}
      </div>

      {item.submenu && subOpen && (
        <div style={{ position: 'absolute', left: '100%', top: -2, background: bg, border: `1px solid rgba(0,0,0,0.15)`, boxShadow: '0 4px 20px rgba(0,0,0,0.2)', minWidth: '140px', padding: '2px 0', zIndex: 1 }}>
          {item.submenu.map((subItem, index) => (
            subItem.separator
              ? <div key={index} style={{ height: '1px', background: separatorColor, margin: '3px 0' }} />
              : <MenuItemEl key={index} item={subItem} onClose={onClose} textColor={textColor} hoverBg={hoverBg} separatorColor={separatorColor} bg={bg} dark={dark} />
          ))}
        </div>
      )}
    </div>
  );
}
