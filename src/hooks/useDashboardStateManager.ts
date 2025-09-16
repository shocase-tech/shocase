import { useEffect, useRef, useCallback } from 'react';

interface DashboardState {
  scrollPosition: number;
  lastActive: number;
  editingSection: string | null;
  profileData: any;
  editorStates: {
    [editorId: string]: {
      formData: any;
      isActive: boolean;
      lastModified: number;
    };
  };
  unsavedChanges: boolean;
}

interface EditorRegistration {
  editorId: string;
  getState: () => any;
  setState: (state: any) => void;
  isActive: boolean;
}

class DashboardStateManager {
  private static instance: DashboardStateManager;
  private registeredEditors: Map<string, EditorRegistration> = new Map();
  private hasRestoredRef = { current: false };
  private isInitialLoadRef = { current: true };
  private preventReloadRef = { current: false };

  static getInstance(): DashboardStateManager {
    if (!DashboardStateManager.instance) {
      DashboardStateManager.instance = new DashboardStateManager();
    }
    return DashboardStateManager.instance;
  }

  private getStorageKey(): string {
    return `dashboardState_${window.location.pathname}`;
  }

  private getDefaultState(): DashboardState {
    return {
      scrollPosition: 0,
      lastActive: Date.now(),
      editingSection: null,
      profileData: null,
      editorStates: {},
      unsavedChanges: false,
    };
  }

  public storeState = (additionalState: Partial<DashboardState> = {}): void => {
    try {
      const currentState = this.getCurrentState();
      const stateToStore: DashboardState = {
        ...currentState,
        ...additionalState,
        scrollPosition: window.scrollY,
        lastActive: Date.now(),
      };

      // Collect state from all registered editors
      this.registeredEditors.forEach((editor, editorId) => {
        if (editor.isActive) {
          try {
            const editorState = editor.getState();
            stateToStore.editorStates[editorId] = {
              formData: editorState,
              isActive: true,
              lastModified: Date.now(),
            };
            console.log(`📝 StateManager: Stored state for ${editorId}:`, editorState);
          } catch (error) {
            console.warn(`⚠️ StateManager: Failed to get state from ${editorId}:`, error);
          }
        }
      });

      sessionStorage.setItem(this.getStorageKey(), JSON.stringify(stateToStore));
      console.log('💾 StateManager: Complete state stored:', stateToStore);
    } catch (error) {
      console.error('❌ StateManager: Failed to store state:', error);
    }
  };

  public restoreState = (): DashboardState | null => {
    try {
      const savedState = sessionStorage.getItem(this.getStorageKey());
      if (!savedState || this.hasRestoredRef.current) {
        return null;
      }

      const state = JSON.parse(savedState) as DashboardState;
      console.log('🔄 StateManager: Restoring state:', state);

      // Only restore if this wasn't a full page reload
      if (!this.isInitialLoadRef.current) {
        // Restore scroll position
        setTimeout(() => {
          window.scrollTo({
            top: state.scrollPosition,
            behavior: 'smooth'
          });
        }, 100);

        // Restore editor states
        this.restoreEditorStates(state.editorStates);
      }

      this.hasRestoredRef.current = true;
      return state;
    } catch (error) {
      console.error('❌ StateManager: Failed to restore state:', error);
      return null;
    }
  };

  private restoreEditorStates = (editorStates: DashboardState['editorStates']): void => {
    Object.entries(editorStates).forEach(([editorId, editorState]) => {
      const editor = this.registeredEditors.get(editorId);
      if (editor && editorState.isActive) {
        try {
          console.log(`🔄 StateManager: Restoring ${editorId} state:`, editorState.formData);
          editor.setState(editorState.formData);
        } catch (error) {
          console.warn(`⚠️ StateManager: Failed to restore state to ${editorId}:`, error);
        }
      }
    });
  };

  private getCurrentState = (): DashboardState => {
    try {
      const savedState = sessionStorage.getItem(this.getStorageKey());
      if (savedState) {
        return JSON.parse(savedState) as DashboardState;
      }
    } catch (error) {
      console.warn('⚠️ StateManager: Failed to get current state:', error);
    }
    return this.getDefaultState();
  };

  public registerEditor = (registration: EditorRegistration): void => {
    console.log(`📝 StateManager: Registering editor ${registration.editorId}`);
    this.registeredEditors.set(registration.editorId, registration);
    
    // Try to restore state if available
    const currentState = this.getCurrentState();
    const editorState = currentState.editorStates[registration.editorId];
    
    if (editorState && editorState.isActive) {
      setTimeout(() => {
        try {
          console.log(`🔄 StateManager: Auto-restoring ${registration.editorId} state:`, editorState.formData);
          registration.setState(editorState.formData);
        } catch (error) {
          console.warn(`⚠️ StateManager: Failed to auto-restore ${registration.editorId}:`, error);
        }
      }, 100);
    }
  };

  public unregisterEditor = (editorId: string): void => {
    console.log(`🗑️ StateManager: Unregistering editor ${editorId}`);
    
    // Store final state before unregistering
    const editor = this.registeredEditors.get(editorId);
    if (editor && editor.isActive) {
      try {
        const editorState = editor.getState();
        const currentState = this.getCurrentState();
        currentState.editorStates[editorId] = {
          formData: editorState,
          isActive: false, // Mark as inactive since we're unregistering
          lastModified: Date.now(),
        };
        sessionStorage.setItem(this.getStorageKey(), JSON.stringify(currentState));
        console.log(`📝 StateManager: Stored final state for ${editorId} before unregistering`);
      } catch (error) {
        console.warn(`⚠️ StateManager: Failed to store final state for ${editorId}:`, error);
      }
    }
    
    this.registeredEditors.delete(editorId);
  };

  public updateEditorActiveState = (editorId: string, isActive: boolean): void => {
    const editor = this.registeredEditors.get(editorId);
    if (editor) {
      editor.isActive = isActive;
      console.log(`🔄 StateManager: Updated ${editorId} active state to ${isActive}`);
    }
  };

  public clearState = (): void => {
    sessionStorage.removeItem(this.getStorageKey());
    this.registeredEditors.clear();
    this.hasRestoredRef.current = false;
    console.log('🗑️ StateManager: State cleared');
  };

  public updateProfileData = (profileData: any): void => {
    const currentState = this.getCurrentState();
    currentState.profileData = profileData;
    sessionStorage.setItem(this.getStorageKey(), JSON.stringify(currentState));
  };

  public updateEditingSection = (editingSection: string | null): void => {
    const currentState = this.getCurrentState();
    currentState.editingSection = editingSection;
    sessionStorage.setItem(this.getStorageKey(), JSON.stringify(currentState));
    console.log(`🎯 StateManager: Updated editing section to ${editingSection}`);
  };

  public getEditingSection = (): string | null => {
    const currentState = this.getCurrentState();
    return currentState.editingSection;
  };

  public setInitialLoad = (isInitialLoad: boolean): void => {
    this.isInitialLoadRef.current = isInitialLoad;
  };
}

export function useDashboardStateManager() {
  const stateManager = DashboardStateManager.getInstance();
  const preventReloadRef = useRef(false);

  useEffect(() => {
    const handleLoad = () => {
      const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      const navEntry = navigationEntries[0];
      
      // If page was reloaded or this is the first visit, don't restore scroll
      if (navEntry && (navEntry.type === 'reload' || navEntry.type === 'navigate')) {
        stateManager.setInitialLoad(true);
        stateManager.clearState(); // Clear on fresh load
      } else {
        stateManager.setInitialLoad(false);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Tab became visible - restore state
        preventReloadRef.current = false;
        stateManager.restoreState();
      } else {
        // Tab became hidden - store current state and prevent reload
        preventReloadRef.current = true;
        stateManager.storeState();
        
        // Reset prevent flag after a delay
        setTimeout(() => {
          preventReloadRef.current = false;
        }, 1000);
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      stateManager.storeState();
      
      // Prevent accidental reloads during tab switching
      if (preventReloadRef.current) {
        e.preventDefault();
      }
    };

    const handleFocus = () => {
      if (!document.hidden) {
        stateManager.restoreState();
      }
    };

    const handleBlur = () => {
      stateManager.storeState();
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
        stateManager.storeState();
      }
    }, 5000);

    // Mark initial load as complete after a short delay
    const initialLoadTimer = setTimeout(() => {
      stateManager.setInitialLoad(false);
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
  }, [stateManager]);

  // Return state manager functions for use in components
  return {
    storeState: useCallback((additionalState?: Partial<DashboardState>) => {
      stateManager.storeState(additionalState);
    }, [stateManager]),
    
    restoreState: useCallback(() => {
      return stateManager.restoreState();
    }, [stateManager]),
    
    registerEditor: useCallback((registration: EditorRegistration) => {
      stateManager.registerEditor(registration);
    }, [stateManager]),
    
    unregisterEditor: useCallback((editorId: string) => {
      stateManager.unregisterEditor(editorId);
    }, [stateManager]),
    
    updateEditorActiveState: useCallback((editorId: string, isActive: boolean) => {
      stateManager.updateEditorActiveState(editorId, isActive);
    }, [stateManager]),
    
    updateProfileData: useCallback((profileData: any) => {
      stateManager.updateProfileData(profileData);
    }, [stateManager]),
    
    updateEditingSection: useCallback((editingSection: string | null) => {
      stateManager.updateEditingSection(editingSection);
    }, [stateManager]),
    
    getEditingSection: useCallback(() => {
      return stateManager.getEditingSection();
    }, [stateManager]),
    
    clearState: useCallback(() => {
      stateManager.clearState();
    }, [stateManager])
  };
}