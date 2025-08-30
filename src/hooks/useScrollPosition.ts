import { useState, useEffect } from 'react';

interface UseScrollPositionOptions {
  threshold?: number;
}

export function useScrollPosition(options: UseScrollPositionOptions = {}) {
  const [scrollY, setScrollY] = useState(0);
  const [isAboveThreshold, setIsAboveThreshold] = useState(false);
  const { threshold = 400 } = options;

  useEffect(() => {
    const updateScrollPosition = () => {
      const currentScrollY = window.scrollY;
      setScrollY(currentScrollY);
      setIsAboveThreshold(currentScrollY > threshold);
      
      console.log('📊 Scroll Position Update:', {
        scrollY: currentScrollY,
        threshold,
        isAboveThreshold: currentScrollY > threshold
      });
    };

    // Initial check
    updateScrollPosition();

    // Add scroll listener
    window.addEventListener('scroll', updateScrollPosition, { passive: true });

    return () => {
      window.removeEventListener('scroll', updateScrollPosition);
    };
  }, [threshold]);

  console.log('🎯 useScrollPosition: Current state:', { scrollY, isAboveThreshold, threshold });

  return { scrollY, isAboveThreshold };
}