import { useEffect, useRef } from 'react';

interface UseEnhancedClickOutsideOptions {
  onClickOutside: () => void;
  disabled?: boolean;
  ignoreDragOperations?: boolean;
}

export function useEnhancedClickOutside<T extends HTMLElement>(
  options: UseEnhancedClickOutsideOptions
) {
  const ref = useRef<T>(null);
  const { onClickOutside, disabled = false, ignoreDragOperations = true } = options;

  useEffect(() => {
    if (disabled) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      // Check if this is during or immediately after a drag operation
      if (ignoreDragOperations) {
        const lastDragEndTime = (window as any).lastDragEndTime;
        const isDragActive = (window as any).isDragOperationActive;
        
        if (isDragActive || (lastDragEndTime && Date.now() - lastDragEndTime < 1000)) {
          console.log('🚫 Enhanced Click Outside: Ignoring click during drag operation');
          return;
        }
      }

      if (ref.current && !ref.current.contains(event.target as Node)) {
        // Additional check for floating UI elements like date pickers, dropdowns, etc.
        const target = event.target as Element;
        
        // Ignore clicks on portal elements (modals, popovers, etc.)
        if (target.closest('[data-radix-portal]') || 
            target.closest('[data-portal]') ||
            target.closest('.rdp') || // React Day Picker
            target.closest('[data-floating-ui]')) {
          console.log('🚫 Enhanced Click Outside: Ignoring click on portal element');
          return;
        }

        // Ignore clicks on sortable handles and drag-related elements
        if (target.closest('[data-sortable-handle]') ||
            target.closest('.sortable-item') ||
            target.closest('[data-dragging="true"]')) {
          console.log('🚫 Enhanced Click Outside: Ignoring click on sortable element');
          return;
        }

        console.log('✅ Enhanced Click Outside: Valid click outside detected');
        onClickOutside();
      }
    };

    // Use capture phase to handle events before they bubble
    document.addEventListener('mousedown', handleClickOutside, true);
    document.addEventListener('touchstart', handleClickOutside, true);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
      document.removeEventListener('touchstart', handleClickOutside, true);
    };
  }, [onClickOutside, disabled, ignoreDragOperations]);

  return ref;
}