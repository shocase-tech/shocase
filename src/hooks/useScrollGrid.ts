import { useState, useEffect, useRef, useCallback } from 'react';

interface UseScrollGridOptions {
  threshold?: number;
  totalCards?: number;
}

export function useScrollGrid(options: UseScrollGridOptions = {}) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [accumulatedDelta, setAccumulatedDelta] = useState(0);
  const elementRef = useRef<HTMLElement>(null);
  const { threshold = 0, totalCards = 8 } = options;
  
  const lockScrollRef = useRef(false);
  const lastScrollYRef = useRef(0);
  const maxScrollDelta = 1600; // Total scroll units for all cards to reveal

  const updateScrollProgress = useCallback(() => {
    const element = elementRef.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    // Check if we should enter scroll lock mode
    if (rect.top <= 0 && rect.bottom >= windowHeight && !lockScrollRef.current) {
      // Section is fully visible, start scroll lock
      lockScrollRef.current = true;
      setIsLocked(true);
      lastScrollYRef.current = window.scrollY;
      setAccumulatedDelta(0);
      return;
    }
    
    // Normal scroll behavior when not locked
    if (!lockScrollRef.current) {
      let progress = 0;
      
      if (rect.top <= threshold && rect.bottom >= -threshold) {
        const totalScrollDistance = windowHeight + element.offsetHeight;
        const currentScrollDistance = Math.max(0, threshold - rect.top);
        progress = Math.max(0, Math.min(1, currentScrollDistance / totalScrollDistance));
      } else if (rect.top < -threshold) {
        progress = 1;
      }
      
      setScrollProgress(progress);
    }
  }, [threshold]);

  const handleWheel = useCallback((e: WheelEvent) => {
    if (!lockScrollRef.current) return;
    
    e.preventDefault();
    
    const delta = e.deltaY;
    const newAccumulated = Math.max(0, Math.min(maxScrollDelta, accumulatedDelta + delta));
    setAccumulatedDelta(newAccumulated);
    
    // Calculate overall progress (0 to 1)
    const progress = newAccumulated / maxScrollDelta;
    setScrollProgress(progress);
    
    // Unlock when all cards are fully revealed
    if (progress >= 1 && lockScrollRef.current) {
      lockScrollRef.current = false;
      setIsLocked(false);
      
      // Allow natural scroll to continue
      window.scrollTo(0, lastScrollYRef.current + 600);
    }
  }, [accumulatedDelta, maxScrollDelta]);

  // Calculate individual card reveal progress with staggered timing
  const getCardProgress = useCallback((cardIndex: number) => {
    const staggerOffset = cardIndex * 0.1; // 10% offset between cards
    const cardDuration = 0.3; // Each card takes 30% of total progress to animate
    
    const cardStart = staggerOffset;
    const cardEnd = cardStart + cardDuration;
    
    if (scrollProgress <= cardStart) return 0;
    if (scrollProgress >= cardEnd) return 1;
    
    return (scrollProgress - cardStart) / cardDuration;
  }, [scrollProgress]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Initial check
    updateScrollProgress();

    // Add scroll listener for normal behavior
    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    window.addEventListener('resize', updateScrollProgress, { passive: true });
    
    // Add wheel listener for scroll hijacking
    window.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      window.removeEventListener('scroll', updateScrollProgress);
      window.removeEventListener('resize', updateScrollProgress);
      window.removeEventListener('wheel', handleWheel);
    };
  }, [updateScrollProgress, handleWheel]);

  // Reset accumulated delta when not locked
  useEffect(() => {
    if (!isLocked) {
      setAccumulatedDelta(0);
    }
  }, [isLocked]);

  return { 
    scrollProgress, 
    elementRef, 
    isLocked,
    getCardProgress
  };
}