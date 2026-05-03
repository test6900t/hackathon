// Mapping of app IDs to actual icon files in ICONS folder
export const ICON_MAP: Record<string, string> = {
  // Desktop and File Explorer icons
  'this-pc': 'this_pc.png',
  'recycle': 'recycle_bin.png',
  'explorer': 'file_explorer.png',
  'media': 'media_player.png',
  
  // Main applications - matched to actual icon files
  'browser': 'browser.png',
  'notepad': 'notepad.png',
  'paint': 'icons8-paint-48.png',
  'calculator': 'calculator.png',
  'camera': 'camera.png',
  'photos': 'photos.png',
  'calendar': 'calender.png',
  'mail': 'mail.png',
  'mediaplayer': 'media_player.png',
  'settings': 'settings.png',
  'taskmanager': 'task_manager.png',
  'controlpanel': 'control_panel.png',
  'cmd': 'command_prompt.png',
  'snipping': 'snipping_tool.png',
  'sticky': 'sticky_notes.png',

  // Fallback for missing icons (use best matching icon)
  'about': 'this_pc.png',
  'charmap': 'notepad.png',
  'diskcleanup': 'settings.png',
  'eventviewer': 'this_pc.png',
  'osk': 'notepad.png',
  'msstore': 'browser.png',
  'paint3d': 'icons8-paint-48.png',
  'magnifier': 'browser.png',
  'sysinfo': 'this_pc.png',
  'wordpad': 'notepad.png',
  'phone-link': 'camera.png',
  'quick-assist': 'this_pc.png',
  'win-security': 'settings.png',
  'wsl': 'command_prompt.png',
  'feedback': 'mail.png',
  'minecraft': '',
};

const MINECRAFT_ICON = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <rect width="64" height="64" rx="12" fill="#2d2017"/>
    <rect x="6" y="8" width="52" height="18" rx="6" fill="#5fa045"/>
    <rect x="6" y="24" width="52" height="34" rx="8" fill="#6d4c33"/>
    <path d="M18 24h8v10h-8zm20 0h8v10h-8zM12 38h10v8H12zm18 10h8v8h-8zm14-12h8v8h-8z" fill="#3d2a1e" opacity=".85"/>
    <path d="M13 18h7v4h-7zm12-6h7v4h-7zm12 6h7v4h-7zm11-4h4v4h-4z" fill="#89c865" opacity=".95"/>
  </svg>`,
)}`;

export function getIconPath(iconName: string): string {
  if (iconName?.toLowerCase?.() === 'minecraft') {
    return MINECRAFT_ICON;
  }
  const mapped = ICON_MAP[iconName?.toLowerCase?.()];
  if (mapped) {
    return `/ICONS/${mapped}`;
  }
  // Fallback to a generic icon
  return '/ICONS/this_pc.png';
}
