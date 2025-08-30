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
    
    console.log('🔍 useScrollVisibility: Setting up observer', { 
      hasTargetRef: !!targetRef.current,
      threshold,
      rootMargin 
    });
    
    if (!targetRef.current) {
      console.log('❌ useScrollVisibility: No target ref available');
      return;
    }

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        console.log('📊 Intersection Observer Update:', {
          isIntersecting: entry.isIntersecting,
          intersectionRatio: entry.intersectionRatio,
          boundingClientRect: entry.boundingClientRect,
          willShowFloating: !entry.isIntersecting
        });
        
        // When the target is NOT visible (user scrolled past it), show floating indicator
        setIsVisible(!entry.isIntersecting);
      },
      {
        threshold,
        rootMargin,
      }
    );

    console.log('👀 useScrollVisibility: Starting to observe element');
    observerRef.current.observe(targetRef.current);

    return () => {
      console.log('🧹 useScrollVisibility: Cleaning up observer');
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [targetRef, options.threshold, options.rootMargin]);

  console.log('🎯 useScrollVisibility: Current state:', { isVisible });
  
  return isVisible;
}