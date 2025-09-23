import { useEffect, useRef, useCallback } from 'react';
import { User } from "@supabase/supabase-js";

interface PersistedDashboardState {
  profile: any;
  editingSection: string | null;
  showPreviewModal: boolean;
  scrollPosition: number;
  lastSaved: number;
  version: string;
  formData?: Record<string, any>; // Store active editor form data
}

interface UseDashboardStatePersistenceProps {
  profile: any;
  editingSection: string | null;
  showPreviewModal: boolean;
  user: User | null;
  onStateRestore?: (state: Partial<PersistedDashboardState>) => void;
  getFormData?: () => Record<string, any>; // Function to capture current form data
}

const STORAGE_KEY = 'dashboard_persistent_state';
const SAVE_INTERVAL = 2000; // 2 seconds
const STATE_VERSION = '1.0';

export function useDashboardStatePersistence({
  profile,
  editingSection,
  showPreviewModal,
  user,
  onStateRestore,
  getFormData
}: UseDashboardStatePersistenceProps) {
  const hasRestoredRef = useRef(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const intervalRef = useRef<NodeJS.Timeout>();
  const restoredFromSavedStateRef = useRef(false);
  
  // Capture form data from all active editors
  const captureAllFormData = useCallback(() => {
    // Capture form data from all active editors
    const allFormData = getFormData ? getFormData() : {};
    
    // Also try to capture from sessionStorage as fallback
    try {
      const sessionFormData = sessionStorage.getItem('editor_form_data');
      if (sessionFormData) {
        const parsedSessionData = JSON.parse(sessionFormData);
        return { ...parsedSessionData, ...allFormData };
      }
    } catch (error) {
      console.warn('Failed to read session form data:', error);
    }
    
    return allFormData;
  }, [getFormData]);

  // Save current state to sessionStorage
  const saveState = useCallback(() => {
    if (!user) return;
    
    try {
      const formData = captureAllFormData();
      const state: PersistedDashboardState = {
        profile,
        editingSection,
        showPreviewModal,
        scrollPosition: window.scrollY,
        lastSaved: Date.now(),
        version: STATE_VERSION,
        formData
      };
      
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn('Failed to save dashboard state:', error);
    }
  }, [profile, editingSection, showPreviewModal, user, captureAllFormData]);

  // Restore state from sessionStorage
  const restoreState = useCallback(() => {
    if (!user || hasRestoredRef.current) return;
    
    try {
      const savedState = sessionStorage.getItem(STORAGE_KEY);
      if (!savedState) return;
      
      const state: PersistedDashboardState = JSON.parse(savedState);
      
      // Check version compatibility
      if (state.version !== STATE_VERSION) {
        sessionStorage.removeItem(STORAGE_KEY);
        return;
      }
      
      // Check if state is recent (within last 10 minutes)
      const timeDiff = Date.now() - state.lastSaved;
      if (timeDiff > 10 * 60 * 1000) {
        return;
      }
      
      // Mark that we're restoring from saved state (tab switch, not fresh load)
      restoredFromSavedStateRef.current = true;
      
      // Restore state through callback (including form data)
      if (onStateRestore) {
        onStateRestore({
          profile: state.profile,
          editingSection: state.editingSection,
          showPreviewModal: state.showPreviewModal,
          formData: state.formData
        });
      }
      
      // Restore scroll position with multiple attempts for reliability
      if (state.scrollPosition > 0) {
        const restoreScroll = () => {
          window.scrollTo({
            top: state.scrollPosition,
            behavior: 'auto'
          });
        };
        
        // Try multiple times to ensure DOM is ready
        setTimeout(restoreScroll, 50);
        setTimeout(restoreScroll, 150);
        setTimeout(restoreScroll, 300);
      }
      
      hasRestoredRef.current = true;
    } catch (error) {
      console.warn('Failed to restore dashboard state:', error);
    }
  }, [user, onStateRestore]);

  // Clear saved state
  const clearState = useCallback(() => {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
      restoredFromSavedStateRef.current = false;
    } catch (error) {
      console.warn('Failed to clear dashboard state:', error);
    }
  }, []);

  // Debounced save function
  const debouncedSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      saveState();
    }, 300);
  }, [saveState]);

  useEffect(() => {
    if (!user) return;

    // Restore state on mount
    restoreState();

    // Set up periodic saving
    intervalRef.current = setInterval(saveState, SAVE_INTERVAL);

    // Save state on visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        saveState();
      }
    };

    // Save state before page unload
    const handleBeforeUnload = () => {
      saveState();
    };

    // Save state on scroll (debounced)
    const handleScroll = () => {
      debouncedSave();
    };

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      // Cleanup
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('scroll', handleScroll);
      
      // Final save on unmount
      saveState();
    };
  }, [user, saveState, restoreState, debouncedSave]);

  // Save state whenever dependencies change (debounced)
  useEffect(() => {
    if (hasRestoredRef.current) {
      debouncedSave();
    }
  }, [profile, editingSection, showPreviewModal, debouncedSave]);

  return {
    clearState,
    saveState,
    hasRestoredState: hasRestoredRef.current,
    isRestoredFromSavedState: restoredFromSavedStateRef.current
  };
}