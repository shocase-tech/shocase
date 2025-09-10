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
      console.log("🔍 useClickOutside: Click detected, event type:", event.type, "target:", event.target);
      
      // Check for recent drag operations
      const now = Date.now();
      const timeSinceLastDrag = now - ((window as any).lastDragEndTime || 0);
      
      if (timeSinceLastDrag < 500) {
        console.log("🔍 useClickOutside: Ignoring click - recent drag operation:", timeSinceLastDrag + "ms ago");
        return;
      }
      
      // Ignore drag events to prevent closing editor during drag operations
      const target = event.target as Element;
      
      // Enhanced drag detection - check for any ongoing drag state
      const isDragRelated = target?.closest('[data-dragging="true"]') || 
          target?.closest('.sortable-item') ||
          target?.hasAttribute('data-sortable-handle') ||
          target?.closest('[data-sortable-handle="true"]') ||
          // Check if target is within a dnd-kit drag overlay
          target?.closest('.dnd-sortable') ||
          target?.closest('[role="button"][draggable]') ||
          // Check for recent drag operations (within 200ms)
          document.querySelector('[data-dragging="true"]') !== null;
      
      if (isDragRelated ||
          event.type === 'dragstart' || 
          event.type === 'dragend' ||
          event.type === 'drag' ||
          event.type === 'dragover' ||
          // Ignore date picker and calendar elements
          target?.closest('.react-datepicker') ||
          target?.closest('.react-datepicker-popper') ||
          target?.closest('[role="dialog"]') ||
          target?.closest('[data-radix-popper-content-wrapper]') ||
          target?.closest('.calendar') ||
          target?.closest('[data-state="open"]') ||
          target?.closest('[aria-expanded="true"]')) {
        console.log("🔍 useClickOutside: Ignoring drag/calendar-related event, isDragRelated:", isDragRelated);
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