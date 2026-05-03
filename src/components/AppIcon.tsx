import { getIconPath } from '../lib/iconMap';

interface AppIconProps {
  iconName: string;
  size?: number;
  alt?: string;
  className?: string;
}

export function AppIcon({ iconName, size = 32, alt, className }: AppIconProps) {
  return (
    <img
      src={getIconPath(iconName)}
      alt={alt || iconName}
      width={size}
      height={size}
      loading="eager"
      decoding="sync"
      style={{
        objectFit: 'contain',
        flexShrink: 0,
        imageRendering: 'auto',
      }}
      className={className}
      draggable={false}
    />
  );
}
