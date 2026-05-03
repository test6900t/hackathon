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
      style={{
        objectFit: 'contain',
        flexShrink: 0,
        imageRendering: 'crisp-edges',
      }}
      className={className}
      draggable={false}
      onError={(e) => {
        // Fallback if image fails to load
        (e.target as HTMLImageElement).src = '/ICONS/this_pc.png';
      }}
    />
  );
}
