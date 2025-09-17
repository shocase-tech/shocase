import { useState, useEffect, useRef } from 'react';

interface UseScrollProgressOptions {
  threshold?: number;
}

export function useScrollProgress(options: UseScrollProgressOptions = {}) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const elementRef = useRef<HTMLElement>(null);
  const { threshold = 0 } = options;

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const updateScrollProgress = () => {
      const rect = element.getBoundingClientRect();
      const elementHeight = element.offsetHeight;
      const windowHeight = window.innerHeight;
      
      // Calculate when element starts entering viewport
      const startOffset = windowHeight - threshold;
      const endOffset = -elementHeight + threshold;
      
      // Calculate progress based on element position
      let progress = 0;
      
      if (rect.top <= startOffset && rect.top >= endOffset) {
        // Element is in the scroll range
        const totalScrollDistance = startOffset - endOffset;
        const currentScrollDistance = startOffset - rect.top;
        progress = Math.max(0, Math.min(1, currentScrollDistance / totalScrollDistance));
      } else if (rect.top < endOffset) {
        // Element has completely passed through
        progress = 1;
      }
      
      setScrollProgress(progress);
    };

    // Initial check
    updateScrollProgress();

    // Add scroll listener
    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    window.addEventListener('resize', updateScrollProgress, { passive: true });

    return () => {
      window.removeEventListener('scroll', updateScrollProgress);
      window.removeEventListener('resize', updateScrollProgress);
    };
  }, [threshold]);

  return { scrollProgress, elementRef };
}