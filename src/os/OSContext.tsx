import { useState, useEffect, ReactNode, createContext, useContext, useCallback, useRef } from 'react';

export type OSPhase = 'boot' | 'lock' | 'desktop' | 'shutdown';

export interface AppWindow {
  id: string;
  appId: string;
  title: string;
  icon: string;
  isMinimized: boolean;
  isMaximized: boolean;
  isFullscreen: boolean;
  zIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  prevX?: number;
  prevY?: number;
  prevWidth?: number;
  prevHeight?: number;
  desktopId: string;
  appProps?: Record<string, unknown>;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  appId: string;
  timestamp: Date;
  read: boolean;
}

export interface StickyNote {
  id: string;
  content: string;
  color: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface OSSettings {
  accentColor: string;
  darkMode: boolean;
  transparency: boolean;
  nightLight: boolean;
  volume: number;
  muted: boolean;
  wallpaper: string;
  username: string;
  taskbarAutoHide: boolean;
  showDesktopIcons: boolean;
  clockFormat: '12h' | '24h';
}

interface OSContextType {
  phase: OSPhase;
  setPhase: (phase: OSPhase) => void;
  windows: AppWindow[];
  openWindow: (appId: string, title: string, icon: string, props?: Record<string, unknown>) => string;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  bringToFront: (id: string) => void;
  updateWindow: (id: string, updates: Partial<AppWindow>) => void;
  startMenuOpen: boolean;
  setStartMenuOpen: (open: boolean) => void;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  notifOpen: boolean;
  setNotifOpen: (open: boolean) => void;
  taskViewOpen: boolean;
  setTaskViewOpen: (open: boolean) => void;
  runDialogOpen: boolean;
  setRunDialogOpen: (open: boolean) => void;
  altTabOpen: boolean;
  setAltTabOpen: (open: boolean) => void;
  notifications: Notification[];
  addNotification: (n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  dismissNotification: (id: string) => void;
  clearNotifications: () => void;
  settings: OSSettings;
  updateSettings: (s: Partial<OSSettings>) => void;
  stickyNotes: StickyNote[];
  setStickyNotes: (notes: StickyNote[]) => void;
  clipboard: { type: 'text' | 'file'; content: string } | null;
  setClipboard: (c: { type: 'text' | 'file'; content: string } | null) => void;
  undoStack: { type: 'text' | 'file'; content: string }[];
  pushToUndo: (item: { type: 'text' | 'file'; content: string }[]) => void;
  activeWindowId: string | null;
  currentDesktop: number;
  setCurrentDesktop: (d: number) => void;
  desktops: string[];
  addDesktop: () => void;
  removeDesktop: (idx: number) => void;
  playSound: (type: 'open' | 'close' | 'notify' | 'error') => void;
  restart: () => void;
  shutdown: () => void;
}

const OSContext = createContext<OSContextType | undefined>(undefined);
let zIndexCounter = 100;

const DEFAULT_WINDOW_SIZES: Record<string, { width: number; height: number }> = {
  calculator: { width: 320, height: 500 },
  notepad: { width: 600, height: 500 },
  explorer: { width: 1040, height: 680 },
  browser: { width: 1120, height: 720 },
  minecraft: { width: 1180, height: 760 },
};

const DEFAULT_SETTINGS: OSSettings = {
  accentColor: '#0078D4',
  darkMode: false,
  transparency: true,
  nightLight: false,
  volume: 75,
  muted: false,
  wallpaper: '/wallpapers/7.jpg',
  username: 'User',
  taskbarAutoHide: false,
  showDesktopIcons: true,
  clockFormat: '12h',
};

function loadSettings(): OSSettings {
  try {
    const s = localStorage.getItem('error64_settings');
    return s ? { ...DEFAULT_SETTINGS, ...JSON.parse(s) } : DEFAULT_SETTINGS;
  } catch { return DEFAULT_SETTINGS; }
}

function saveSettings(s: OSSettings) {
  localStorage.setItem('error64_settings', JSON.stringify(s));
}

function loadStickyNotes(): StickyNote[] {
  try {
    const s = localStorage.getItem('error64_sticky');
    return s ? JSON.parse(s) : [];
  } catch { return []; }
}

export const OSProvider = ({ children }: { children: ReactNode }) => {
  const [phase, setPhaseRaw] = useState<OSPhase>('boot');
  const [windows, setWindows] = useState<AppWindow[]>([]);
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [taskViewOpen, setTaskViewOpen] = useState(false);
  const [runDialogOpen, setRunDialogOpen] = useState(false);
  const [altTabOpen, setAltTabOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<OSSettings>(loadSettings);
  const [stickyNotes, setStickyNotesRaw] = useState<StickyNote[]>(loadStickyNotes);
  const [clipboard, setClipboard] = useState<{ type: 'text' | 'file'; content: string } | null>(null);
  const [undoStack, setUndoStack] = useState<{ type: 'text' | 'file'; content: string }[]>([]);
  const [currentDesktop, setCurrentDesktop] = useState(0);
  const [desktops, setDesktops] = useState<string[]>(['Desktop 1']);
  const audioCtx = useRef<AudioContext | null>(null);

  const setPhase = useCallback((p: OSPhase) => setPhaseRaw(p), []);

  useEffect(() => {
    if (phase === 'boot') {
      const t = setTimeout(() => setPhase('lock'), 3500);
      return () => clearTimeout(t);
    }
  }, [phase, setPhase]);

  // Apply settings to DOM
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--accent-color', settings.accentColor);
    root.style.setProperty('--accent-color-light', settings.accentColor + 'cc');
    if (settings.darkMode) root.classList.add('dark');
    else root.classList.remove('dark');
    saveSettings(settings);
  }, [settings]);

  // Night light
  useEffect(() => {
    const el = document.getElementById('night-light-overlay');
    if (el) el.style.display = settings.nightLight ? 'block' : 'none';
  }, [settings.nightLight]);

  const updateSettings = useCallback((s: Partial<OSSettings>) => {
    setSettings(prev => ({ ...prev, ...s }));
  }, []);

  const setStickyNotes = useCallback((notes: StickyNote[]) => {
    setStickyNotesRaw(notes);
    localStorage.setItem('error64_sticky', JSON.stringify(notes));
  }, []);

  const pushToUndo = useCallback((item: { type: 'text' | 'file'; content: string }[]) => {
    setUndoStack(prev => [...prev, ...item].slice(-50));
  }, []);

  const activeWindowId = windows.reduce<string | null>((best, w) => {
    if (w.isMinimized) return best;
    if (!best) return w.id;
    const bestW = windows.find(x => x.id === best);
    return (bestW && w.zIndex > bestW.zIndex) ? w.id : best;
  }, null);

  const playSound = useCallback((type: 'open' | 'close' | 'notify' | 'error') => {
    if (settings.muted) return;
    try {
      if (!audioCtx.current) audioCtx.current = new AudioContext();
      const ctx = audioCtx.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      const vol = settings.volume / 100 * 0.15;
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      if (type === 'open') { osc.frequency.setValueAtTime(440, ctx.currentTime); osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08); }
      else if (type === 'close') { osc.frequency.setValueAtTime(660, ctx.currentTime); osc.frequency.exponentialRampToValueAtTime(330, ctx.currentTime + 0.08); }
      else if (type === 'notify') { osc.frequency.setValueAtTime(523, ctx.currentTime); osc.frequency.setValueAtTime(659, ctx.currentTime + 0.1); }
      else { osc.frequency.setValueAtTime(220, ctx.currentTime); }
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.15);
    } catch {}
  }, [settings.muted, settings.volume]);

  const openWindow = useCallback((appId: string, title: string, icon: string, props?: Record<string, unknown>): string => {
    let result = '';
    setWindows(prev => {
      const existing = prev.find(w => w.appId === appId && w.desktopId === String(currentDesktop));
      if (existing && !props) {
        // Bring to front and restore if minimized
        zIndexCounter++;
        result = existing.id;
        return prev.map(w => w.id === existing.id
          ? { ...w, zIndex: zIndexCounter, isMinimized: false }
          : w);
      }
      zIndexCounter++;
      const offset = (prev.filter(w => !w.isMinimized).length % 10) * 20;
      const size = DEFAULT_WINDOW_SIZES[appId] || { width: 900, height: 600 };
      const newWin: AppWindow = {
        id: `win-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        appId, title, icon,
        isMinimized: false, isMaximized: false, isFullscreen: false,
        zIndex: zIndexCounter,
        x: 80 + offset, y: 60 + offset,
        width: size.width,
        height: size.height,
        desktopId: String(currentDesktop),
        appProps: props,
      };
      result = newWin.id;
      return [...prev, newWin];
    });
    playSound('open');
    return result;
  }, [currentDesktop, playSound]);

  const closeWindow = useCallback((id: string) => {
    setWindows(prev => prev.filter(w => w.id !== id));
    playSound('close');
  }, [playSound]);

  const minimizeWindow = useCallback((id: string) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isMinimized: true } : w));
  }, []);

  const maximizeWindow = useCallback((id: string) => {
    setWindows(prev => prev.map(w => {
      if (w.id !== id) return w;
      return { ...w, isMaximized: true, isMinimized: false, prevX: w.x, prevY: w.y, prevWidth: w.width, prevHeight: w.height };
    }));
  }, []);

  const restoreWindow = useCallback((id: string) => {
    setWindows(prev => prev.map(w => {
      if (w.id !== id) return w;
      zIndexCounter++;
      return {
        ...w, isMaximized: false, isMinimized: false, isFullscreen: false,
        zIndex: zIndexCounter,
        x: w.prevX ?? w.x, y: w.prevY ?? w.y,
        width: w.prevWidth ?? w.width, height: w.prevHeight ?? w.height,
      };
    }));
  }, []);

  const bringToFront = useCallback((id: string) => {
    zIndexCounter++;
    setWindows(prev => prev.map(w => w.id === id ? { ...w, zIndex: zIndexCounter } : w));
  }, []);

  const updateWindow = useCallback((id: string, updates: Partial<AppWindow>) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w));
  }, []);

  const addNotification = useCallback((n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const notif: Notification = { ...n, id: `notif-${Date.now()}`, timestamp: new Date(), read: false };
    setNotifications(prev => [notif, ...prev].slice(0, 50));
    playSound('notify');
  }, [playSound]);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearNotifications = useCallback(() => setNotifications([]), []);

  const addDesktop = useCallback(() => {
    setDesktops(prev => [...prev, `Desktop ${prev.length + 1}`]);
  }, []);

  const removeDesktop = useCallback((idx: number) => {
    setDesktops(prev => {
      if (prev.length <= 1) return prev;
      const next = prev.filter((_, i) => i !== idx);
      setCurrentDesktop(c => Math.min(c, next.length - 1));
      return next;
    });
    setWindows(prev => prev.filter(w => w.desktopId !== String(idx)));
  }, []);

  const restart = useCallback(() => {
    setWindows([]);
    setPhase('boot');
  }, [setPhase]);

  const shutdown = useCallback(() => {
    setPhase('shutdown');
    setTimeout(() => setWindows([]), 500);
  }, [setPhase]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.key === 'Meta';
      // Windows key
      if (e.key === 'Meta') { e.preventDefault(); setStartMenuOpen(v => !v); return; }
      if ((e.metaKey || e.ctrlKey) && e.key === 'Escape') { e.preventDefault(); setStartMenuOpen(v => !v); return; }
      if (e.metaKey) {
        if (e.key === 'd' || e.key === 'D') { e.preventDefault(); setWindows(prev => { const allMin = prev.every(w => w.isMinimized); return prev.map(w => ({ ...w, isMinimized: !allMin })); }); }
        if (e.key === 'e' || e.key === 'E') { e.preventDefault(); openWindow('explorer', 'File Explorer', 'folder'); }
        if (e.key === 'l' || e.key === 'L') { e.preventDefault(); setPhase('lock'); }
        if (e.key === 'r' || e.key === 'R') { e.preventDefault(); setRunDialogOpen(true); }
        if (e.key === 's' || e.key === 'S') { e.preventDefault(); if (e.shiftKey) { openWindow('snipping', 'Snipping Tool', 'snipping_tool'); } else { setSearchOpen(true); } }
        if (e.key === 'a' || e.key === 'A') { e.preventDefault(); setNotifOpen(v => !v); }
        if (e.key === 'Tab') { e.preventDefault(); setTaskViewOpen(v => !v); }
      }
      // Ctrl+Z for Undo
      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        if (undoStack.length > 0) {
          const lastItem = undoStack[undoStack.length - 1];
          setClipboard(lastItem);
          setUndoStack(prev => prev.slice(0, -1));
        }
      }
      // Ctrl+X for Cut - handles both text and files
      if (e.ctrlKey && e.key === 'x') {
        const activeEl = document.activeElement;
        if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable)) {
          const selection = window.getSelection();
          const text = selection?.toString() || '';
          if (text) {
            setClipboard({ type: 'text', content: text });
            pushToUndo([{ type: 'text', content: text }]);
            const target = activeEl as HTMLInputElement | HTMLTextAreaElement;
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
              const start = target.selectionStart || 0;
              const end = target.selectionEnd || 0;
              target.value = target.value.substring(0, start) + target.value.substring(end);
              target.setSelectionRange(start, start);
            }
          }
        }
      }
      // Ctrl+C is handled by browser natively for text
      if (e.ctrlKey && e.key === 'c') {
        const activeEl = document.activeElement;
        if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable)) {
          const selection = window.getSelection();
          const text = selection?.toString() || '';
          if (text) {
            setClipboard({ type: 'text', content: text });
            pushToUndo([{ type: 'text', content: text }]);
          }
        }
      }
      // Ctrl+V is handled by browser natively for text
      if (e.ctrlKey && e.key === 'v') {
        const activeEl = document.activeElement;
        if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable)) {
          if (clipboard?.type === 'text') {
            pushToUndo([{ type: 'text', content: clipboard.content }]);
          }
        }
      }
      if (e.altKey && e.key === 'Tab') { e.preventDefault(); setAltTabOpen(v => !v); }
      if (e.altKey && e.key === 'F4') { e.preventDefault(); if (activeWindowId) closeWindow(activeWindowId); }
      if (e.ctrlKey && e.shiftKey && e.key === 'Escape') { e.preventDefault(); openWindow('taskmanager', 'Task Manager', 'taskmanager'); }
      if (e.key === 'Escape') {
        setStartMenuOpen(false); setSearchOpen(false); setNotifOpen(false);
        setTaskViewOpen(false); setRunDialogOpen(false); setAltTabOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [openWindow, closeWindow, activeWindowId, setPhase, undoStack, clipboard, pushToUndo]);

  const visibleWindows = windows.filter(w => w.desktopId === String(currentDesktop));

  return (
    <OSContext.Provider value={{
      phase, setPhase,
      windows: visibleWindows,
      openWindow, closeWindow, minimizeWindow, maximizeWindow, restoreWindow, bringToFront, updateWindow,
      startMenuOpen, setStartMenuOpen,
      searchOpen, setSearchOpen,
      notifOpen, setNotifOpen,
      taskViewOpen, setTaskViewOpen,
      runDialogOpen, setRunDialogOpen,
      altTabOpen, setAltTabOpen,
      notifications, addNotification, dismissNotification, clearNotifications,
      settings, updateSettings,
      stickyNotes, setStickyNotes,
      clipboard, setClipboard,
      undoStack, pushToUndo,
      activeWindowId,
      currentDesktop, setCurrentDesktop,
      desktops, addDesktop, removeDesktop,
      playSound, restart, shutdown,
    }}>
      {children}
    </OSContext.Provider>
  );
};

export const useOS = () => {
  const ctx = useContext(OSContext);
  if (!ctx) throw new Error('useOS must be used within OSProvider');
  return ctx;
};
