import { lazy, Suspense } from 'react';
import { OSProvider, useOS } from './os/OSContext';
import { BootScreen } from './components/BootScreen';
import { LockScreen } from './components/LockScreen';
import { Desktop } from './components/Desktop';
import { TaskBar } from './components/TaskBar';
import { StartMenu } from './components/StartMenu';
import { SearchOverlay } from './components/SearchOverlay';
import { NotificationCenter } from './components/NotificationCenter';
import { TaskView } from './components/TaskView';
import { RunDialog } from './components/RunDialog';
import { AltTabSwitcher } from './components/AltTabSwitcher';
import { WindowLayer } from './os/WindowLayer';
import { StickyNotesLayer } from './components/StickyNotesLayer';
import { Magnifier } from './components/Magnifier';
import { XboxGameBar } from './components/XboxGameBar';

function ShutdownScreen() {
  return (
    <div className="fixed inset-0 z-[999999] bg-black flex flex-col items-center justify-center text-white">
      <div className="flex items-center gap-4 mb-8">
        <WinLogo size={48} />
        <h1 className="text-4xl font-light tracking-wide">Error64</h1>
      </div>
      <p className="text-lg font-light text-white/80">Shutting down...</p>
    </div>
  );
}

function WinLogo({ size = 20 }: { size?: number }) {
  const s = size / 2 - 1;
  return (
    <svg width={size} height={size} viewBox="0 0 21 21">
      <path d="M0 0h10v10H0z" fill="#f35325" />
      <path d="M11 0h10v10H11z" fill="#81bc06" />
      <path d="M0 11h10v10H0z" fill="#05a6f0" />
      <path d="M11 11h10v10H11z" fill="#ffba08" />
    </svg>
  );
}

function OSShell() {
  const { phase } = useOS();

  if (phase === 'shutdown') return <ShutdownScreen />;

  return (
    <div
      id="os-shell"
      className="w-screen h-screen overflow-hidden relative select-none"
      style={{ fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif", fontSize: '13px' }}
    >
      {/* Night light overlay */}
      <div
        id="night-light-overlay"
        className="fixed inset-0 pointer-events-none z-[99998]"
        style={{ display: 'none', background: 'rgba(255,140,0,0.15)', mixBlendMode: 'multiply' }}
      />

      <BootScreen />
      <LockScreen />

      {phase === 'desktop' && (
        <>
          <Desktop />
          <StickyNotesLayer />
          <WindowLayer />
          <TaskBar />
          <StartMenu />
          <SearchOverlay />
          <NotificationCenter />
          <TaskView />
          <RunDialog />
          <AltTabSwitcher />
          <Magnifier />
          <XboxGameBar />
        </>
      )}
    </div>
  );
}

export default function App() {
  return (
    <OSProvider>
      <OSShell />
    </OSProvider>
  );
}
