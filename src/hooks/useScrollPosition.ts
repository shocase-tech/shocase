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
    };

    // Initial check
    updateScrollPosition();

    // Add scroll listener
    window.addEventListener('scroll', updateScrollPosition, { passive: true });

    return () => {
      window.removeEventListener('scroll', updateScrollPosition);
    };
  }, [threshold]);

  return { scrollY, isAboveThreshold };
}