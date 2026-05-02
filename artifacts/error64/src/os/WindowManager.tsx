import { ReactNode } from 'react';
import { useOS } from './OSContext';

export function WindowManager() {
  const { windows, bringToFront, closeWindow, maximizeWindow, minimizeWindow, restoreWindow, updateWindow } = useOS();

  return (
    <>
      {windows.map(win => {
        if (win.isMinimized) return null;
        
        return (
          <div
            key={win.id}
            className={`absolute bg-white dark:bg-[#202020] border border-[#0078D4]/50 shadow-2xl flex flex-col overflow-hidden transition-all duration-150 ease-out`}
            style={{
              left: win.isMaximized ? 0 : win.x,
              top: win.isMaximized ? 0 : win.y,
              width: win.isMaximized ? '100%' : win.width,
              height: win.isMaximized ? 'calc(100% - 48px)' : win.height,
              zIndex: win.zIndex,
            }}
            onMouseDown={() => bringToFront(win.id)}
          >
            {/* Title Bar */}
            <div 
              className="h-8 bg-[#f3f3f3] dark:bg-[#1a1a1a] flex items-center justify-between select-none"
              onDoubleClick={() => win.isMaximized ? restoreWindow(win.id) : maximizeWindow(win.id)}
            >
              <div className="flex items-center px-2 space-x-2 truncate">
                <span className="text-sm">{win.icon}</span>
                <span className="text-xs text-black dark:text-white">{win.title}</span>
              </div>
              <div className="flex h-full">
                <button 
                  className="h-full w-12 hover:bg-black/10 dark:hover:bg-white/10 flex items-center justify-center text-black dark:text-white"
                  onClick={(e) => { e.stopPropagation(); minimizeWindow(win.id); }}
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" stroke="currentColor" fill="none"><path d="M 0,5 H 10" /></svg>
                </button>
                <button 
                  className="h-full w-12 hover:bg-black/10 dark:hover:bg-white/10 flex items-center justify-center text-black dark:text-white"
                  onClick={(e) => { e.stopPropagation(); win.isMaximized ? restoreWindow(win.id) : maximizeWindow(win.id); }}
                >
                  {win.isMaximized ? (
                    <svg width="10" height="10" viewBox="0 0 10 10" stroke="currentColor" fill="none"><path d="M 2,2 h 6 v 6 h -6 z M 3,3 h 6 v 6 h -6 z" /></svg>
                  ) : (
                    <svg width="10" height="10" viewBox="0 0 10 10" stroke="currentColor" fill="none"><path d="M 1,1 h 8 v 8 h -8 z" /></svg>
                  )}
                </button>
                <button 
                  className="h-full w-12 hover:bg-[#E81123] hover:text-white flex items-center justify-center text-black dark:text-white"
                  onClick={(e) => { e.stopPropagation(); closeWindow(win.id); }}
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" stroke="currentColor" fill="none"><path d="M 1,1 L 9,9 M 9,1 L 1,9" /></svg>
                </button>
              </div>
            </div>
            
            {/* Content */}
            <div className="flex-1 bg-white dark:bg-[#2d2d2d] overflow-auto text-black dark:text-white">
              <div className="p-4 h-full">
                <h2 className="text-xl font-bold mb-4">Welcome to {win.title}</h2>
                <p>This is a placeholder for the {win.appId} app.</p>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}
