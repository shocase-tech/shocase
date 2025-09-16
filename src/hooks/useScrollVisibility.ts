import { useState, useEffect, useRef } from 'react';

interface UseScrollVisibilityOptions {
  threshold?: number;
  rootMargin?: string;
}

export function useScrollVisibility(
  targetRef: React.RefObject<HTMLElement>,
  options: UseScrollVisibilityOptions = {}
) {
  const [isVisible, setIsVisible] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const { threshold = 0, rootMargin = '0px' } = options;
    
    if (!targetRef.current) {
      return;
    }

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        // When the target is NOT visible (user scrolled past it), show floating indicator
        setIsVisible(!entry.isIntersecting);
      },
      {
        threshold,
        rootMargin,
      }
    );

    observerRef.current.observe(targetRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [targetRef, options.threshold, options.rootMargin]);
  
  return isVisible;
}