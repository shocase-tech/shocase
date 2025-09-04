import { useEffect, useRef } from 'react';

interface TabState {
  scrollPosition: number;
  lastActive: number;
}

export function useTabStateManager() {
  const hasRestoredRef = useRef(false);
  const isInitialLoadRef = useRef(true);
  const preventReloadRef = useRef(false);

  useEffect(() => {
    const storeState = () => {
      const state: TabState = {
        scrollPosition: window.scrollY,
        lastActive: Date.now()
      };
      sessionStorage.setItem('dashboardState', JSON.stringify(state));
    };

    const restoreState = () => {
      try {
        const savedState = sessionStorage.getItem('dashboardState');
        if (savedState && !hasRestoredRef.current) {
          const { scrollPosition } = JSON.parse(savedState) as TabState;
          
          // Only restore if this wasn't a full page reload
          if (!isInitialLoadRef.current) {
            setTimeout(() => {
              window.scrollTo({
                top: scrollPosition,
                behavior: 'smooth'
              });
            }, 100);
          }
          
          hasRestoredRef.current = true;
        }
      } catch (error) {
        console.warn('Failed to restore tab state:', error);
      }
    };

    // Handle page load - check if this is a fresh load vs tab return
    const handleLoad = () => {
      const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      const navEntry = navigationEntries[0];
      
      // If page was reloaded or this is the first visit, don't restore scroll
      if (navEntry && (navEntry.type === 'reload' || navEntry.type === 'navigate')) {
        isInitialLoadRef.current = true;
        sessionStorage.removeItem('dashboardState'); // Clear on fresh load
      } else {
        isInitialLoadRef.current = false;
      }
    };

    // Handle visibility changes (tab switching)
    const handleVisibilityChange = () => {
      console.log('👁️ Tab visibility changed to:', document.visibilityState);
      
      if (document.visibilityState === 'visible') {
        // Tab became visible - restore state
        console.log('🔄 Tab became visible, restoring state');
        preventReloadRef.current = false;
        restoreState();
      } else {
        // Tab became hidden - store current state and prevent reload
        console.log('💾 Tab became hidden, storing state');
        preventReloadRef.current = true;
        storeState();
        
        // Reset prevent flag after a delay
        setTimeout(() => {
          preventReloadRef.current = false;
        }, 1000);
      }
    };

    // Handle before unload (page closing/refreshing)
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      console.log('🛡️ beforeunload triggered, storing state');
      storeState();
      
      // Prevent accidental reloads during tab switching
      if (preventReloadRef.current) {
        e.preventDefault();
        console.log('🚫 Prevented accidental reload');
      }
    };

    // Handle page focus/blur for additional reliability
    const handleFocus = () => {
      if (!document.hidden) {
        restoreState();
      }
    };

    const handleBlur = () => {
      storeState();
    };

    // Initial setup
    handleLoad();

    // Add event listeners
    window.addEventListener('load', handleLoad);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    // Periodic state saving (every 5 seconds when active)
    const stateInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        storeState();
      }
    }, 5000);

    // Mark initial load as complete after a short delay
    const initialLoadTimer = setTimeout(() => {
      isInitialLoadRef.current = false;
    }, 1000);

    return () => {
      window.removeEventListener('load', handleLoad);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      clearInterval(stateInterval);
      clearTimeout(initialLoadTimer);
    };
  }, []);

  return {
    storeCurrentState: () => {
      const state: TabState = {
        scrollPosition: window.scrollY,
        lastActive: Date.now()
      };
      sessionStorage.setItem('dashboardState', JSON.stringify(state));
    }
  };
}