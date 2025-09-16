// DEPRECATED: This hook is being replaced by useDashboardStateManager
// It's kept for backward compatibility during the transition

export function useTabStateManager() {
  console.warn('⚠️ useTabStateManager is deprecated. Use useDashboardStateManager instead.');
  
  // Minimal implementation to prevent errors during transition
  return {
    storeCurrentState: () => {
      // No-op for backward compatibility
    }
  };
}