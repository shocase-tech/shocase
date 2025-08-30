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