import { useEffect, useRef } from 'react';

export function useClickOutside<T extends HTMLElement>(
  callback: () => void,
  enabled: boolean = true
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    console.log("🔍 useClickOutside: Hook initialized, enabled:", enabled);
    if (!enabled) return;

    function handleClickOutside(event: MouseEvent) {
      console.log("🔍 useClickOutside: Click detected, checking if outside element");
      
      // Ignore drag events to prevent closing editor during drag operations
      const target = event.target as Element;
      if (target?.closest('[data-dragging="true"]') || 
          target?.closest('.sortable-item') ||
          event.type === 'dragstart' || 
          event.type === 'dragend' ||
          target?.hasAttribute('data-sortable-handle') ||
          // Ignore date picker and calendar elements
          target?.closest('.react-datepicker') ||
          target?.closest('.react-datepicker-popper') ||
          target?.closest('[role="dialog"]') ||
          target?.closest('[data-radix-popper-content-wrapper]') ||
          target?.closest('.calendar') ||
          target?.closest('[data-state="open"]') ||
          target?.closest('[aria-expanded="true"]')) {
        console.log("🔍 useClickOutside: Ignoring drag/calendar-related event");
        return;
      }
      
      if (ref.current && !ref.current.contains(event.target as Node)) {
        console.log("🔍 useClickOutside: Click is outside element, calling callback");
        callback();
      } else {
        console.log("🔍 useClickOutside: Click is inside element, ignoring");
      }
    }

    // Add a small delay to avoid immediate triggering when opening editor
    const timeoutId = setTimeout(() => {
      console.log("🔍 useClickOutside: Adding mousedown event listener");
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      console.log("🔍 useClickOutside: Cleaning up event listener");
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [callback, enabled]);

  return ref;
}