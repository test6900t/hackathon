import { lazy, Suspense } from 'react';
import { useOS } from './OSContext';
import { Window } from '../components/Window';

const Notepad = lazy(() => import('../apps/Notepad').then(m => ({ default: m.Notepad })));
const Calculator = lazy(() => import('../apps/Calculator').then(m => ({ default: m.Calculator })));
const FileExplorer = lazy(() => import('../apps/FileExplorer').then(m => ({ default: m.FileExplorer })));
const CommandPrompt = lazy(() => import('../apps/CommandPrompt').then(m => ({ default: m.CommandPrompt })));
const Paint = lazy(() => import('../apps/Paint').then(m => ({ default: m.Paint })));
const Settings = lazy(() => import('../apps/Settings').then(m => ({ default: m.Settings })));
const Browser = lazy(() => import('../apps/Browser').then(m => ({ default: m.Browser })));
const Calendar = lazy(() => import('../apps/Calendar').then(m => ({ default: m.Calendar })));
const Mail = lazy(() => import('../apps/Mail').then(m => ({ default: m.Mail })));
const TaskManager = lazy(() => import('../apps/TaskManager').then(m => ({ default: m.TaskManager })));
const ControlPanel = lazy(() => import('../apps/ControlPanel').then(m => ({ default: m.ControlPanel })));
const Photos = lazy(() => import('../apps/Photos').then(m => ({ default: m.Photos })));
const Camera = lazy(() => import('../apps/Camera').then(m => ({ default: m.Camera })));
const MediaPlayer = lazy(() => import('../apps/MediaPlayer').then(m => ({ default: m.MediaPlayer })));
const WordPad = lazy(() => import('../apps/WordPad').then(m => ({ default: m.WordPad })));
const SnippingTool = lazy(() => import('../apps/SnippingTool').then(m => ({ default: m.SnippingTool })));
const CharacterMap = lazy(() => import('../apps/CharacterMap').then(m => ({ default: m.CharacterMap })));
const SystemInfo = lazy(() => import('../apps/SystemInfo').then(m => ({ default: m.SystemInfo })));
const DiskCleanup = lazy(() => import('../apps/DiskCleanup').then(m => ({ default: m.DiskCleanup })));
const EventViewer = lazy(() => import('../apps/EventViewer').then(m => ({ default: m.EventViewer })));
const OnScreenKeyboard = lazy(() => import('../apps/OnScreenKeyboard').then(m => ({ default: m.OnScreenKeyboard })));
const About = lazy(() => import('../apps/About').then(m => ({ default: m.About })));
const MSStore = lazy(() => import('../apps/MSStore').then(m => ({ default: m.MSStore })));
const Paint3D = lazy(() => import('../apps/Paint3D').then(m => ({ default: m.Paint3D })));
const Minecraft = lazy(() => import('../apps/Minecraft').then(m => ({ default: m.Minecraft })));
const StickyNotes = lazy(() => import('../apps/StickyNotes').then(m => ({ default: m.StickyNotesApp })));
const PlaceholderApp = lazy(() => import('../apps/PlaceholderApp').then(m => ({ default: m.PlaceholderApp })));

function getAppComponent(appId: string, props?: Record<string, unknown>) {
  switch (appId) {
    case 'notepad': return <Notepad {...(props || {})} />;
    case 'calculator': return <Calculator />;
    case 'explorer': return <FileExplorer initialPath={(props?.path as string) || 'C:\\Users\\User\\Desktop'} />;
    case 'cmd': return <CommandPrompt />;
    case 'paint': return <Paint />;
    case 'settings': return <Settings initialSection={(props?.section as string) || 'system'} />;
    case 'browser': return <Browser initialUrl={(props?.url as string) || ''} />;
    case 'calendar': return <Calendar />;
    case 'mail': return <Mail />;
    case 'taskmanager': return <TaskManager />;
    case 'controlpanel': return <ControlPanel />;
    case 'photos': return <Photos />;
    case 'camera': return <Camera />;
    case 'mediaplayer': return <MediaPlayer />;
    case 'wordpad': return <WordPad />;
    case 'snipping': return <SnippingTool />;
    case 'charmap': return <CharacterMap />;
    case 'sysinfo': return <SystemInfo />;
    case 'diskcleanup': return <DiskCleanup />;
    case 'eventviewer': return <EventViewer />;
    case 'osk': return <OnScreenKeyboard />;
    case 'about': return <About />;
    case 'msstore': return <MSStore />;
    case 'paint3d': return <Paint3D />;
    case 'minecraft': return <Minecraft />;
    case 'sticky': return <StickyNotes />;
    default: return <PlaceholderApp appId={appId} title={props?.title as string || appId} />;
  }
}

export function WindowLayer() {
  const { windows, closeWindow, minimizeWindow, maximizeWindow, restoreWindow, bringToFront, updateWindow, activeWindowId } = useOS();

  return (
    <>
      {windows.map(win => (
        <Window
          key={win.id}
          win={win}
          isActive={win.id === activeWindowId}
          onClose={() => closeWindow(win.id)}
          onMinimize={() => minimizeWindow(win.id)}
          onMaximize={() => maximizeWindow(win.id)}
          onRestore={() => restoreWindow(win.id)}
          onFocus={() => bringToFront(win.id)}
          onUpdate={(u) => updateWindow(win.id, u)}
        >
          <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#666' }}>Loading...</div>}>
            {getAppComponent(win.appId, win.appProps)}
          </Suspense>
        </Window>
      ))}
    </>
  );
}
