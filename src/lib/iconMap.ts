// Mapping of app IDs to actual icon files in ICONS folder
export const ICON_MAP: Record<string, string> = {
  // Desktop and File Explorer icons
  'this-pc': '/ICONS/this_pc.png',
  'desktop_pc': '/ICONS/this_pc.png',
  'recycle': '/ICONS/recycle_bin.png',
  'delete': '/ICONS/recycle_bin.png',
  'explorer': '/ICONS/file_explorer.png',
  'folder': '/ICONS/file_explorer.png',
  'media': '/ICONS/media_player.png',
  'play_circle': '/ICONS/media_player.png',
  
  // Main applications
  'browser': '/ICONS/browser.png',
  'globe': '/ICONS/browser.png',
  'store_microsoft': '/ICONS/browser.png',
  'notepad': '/ICONS/notepad.png',
  'document': '/ICONS/notepad.png',
  'paint': '/ICONS/icons8-paint-48.png',
  'paint_bucket': '/ICONS/icons8-paint-48.png',
  'calculator': '/ICONS/calculator.png',
  'camera': '/ICONS/camera.png',
  'image': '/ICONS/photos.png',
  'photos': '/ICONS/photos.png',
  'calendar': '/ICONS/calender.png',
  'calendar_ltr': '/ICONS/calender.png',
  'mail': '/ICONS/mail.png',
  'mediaplayer': '/ICONS/media_player.png',
  'settings': '/ICONS/settings.png',
  'taskmanager': '/ICONS/task_manager.png',
  'task_list_square_ltr': '/ICONS/task_manager.png',
  'controlpanel': '/ICONS/control_panel.png',
  'apps_list': '/ICONS/control_panel.png',
  'cmd': '/ICONS/command_prompt.png',
  'prompt': '/ICONS/command_prompt.png',
  'snipping': '/ICONS/snipping_tool.png',
  'screenshot': '/ICONS/snipping_tool.png',
  'sticky': '/ICONS/sticky_notes.png',
  'note': '/ICONS/sticky_notes.png',
  'minecraft': '',
  'cube': '',
};

const MINECRAFT_ICON = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <rect width="64" height="64" rx="12" fill="#2d2017"/>
    <rect x="6" y="8" width="52" height="18" rx="6" fill="#5fa045"/>
    <rect x="6" y="24" width="52" height="34" rx="8" fill="#6d4c33"/>
    <path d="M18 24h8v10h-8zm20 0h8v10h-8zM12 38h10v8H12zm18 10h8v8h-8zm14-12h8v8h-8z" fill="#3d2a1e" opacity=".85"/>
    <path d="M13 18h7v4h-7zm12-6h7v4h-7zm12 6h7v4h-7zm11-4h4v4h-4z" fill="#89c865" opacity=".95"/>
  </svg>`
)}`;

export function getIconPath(iconName: string): string {
  if (iconName?.toLowerCase?.() === 'minecraft') return MINECRAFT_ICON;
  if (iconName?.toLowerCase?.() === 'cube') return MINECRAFT_ICON;
  const mapped = ICON_MAP[iconName?.toLowerCase?.()];
  if (mapped) return mapped;
  return '/ICONS/this_pc.png';
}
