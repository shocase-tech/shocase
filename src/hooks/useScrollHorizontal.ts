import { useState, useEffect, useRef, useCallback } from 'react';

interface UseScrollHorizontalOptions {
  threshold?: number;
}

export function useScrollHorizontal(options: UseScrollHorizontalOptions = {}) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [accumulatedDelta, setAccumulatedDelta] = useState(0);
  const elementRef = useRef<HTMLElement>(null);
  const { threshold = 0 } = options;
  
  const lockScrollRef = useRef(false);
  const lastScrollYRef = useRef(0);
  const maxScrollDelta = 2000; // Total scroll units for full horizontal animation

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
    
    // Calculate horizontal progress (0 = left, 0.5 = center, 1 = right)
    const progress = newAccumulated / maxScrollDelta;
    setScrollProgress(progress);
    
    // Unlock when animation is complete (text off-screen right)
    if (progress >= 1 && lockScrollRef.current) {
      lockScrollRef.current = false;
      setIsLocked(false);
      
      // Allow natural scroll to continue
      window.scrollTo(0, lastScrollYRef.current + 400);
    }
  }, [accumulatedDelta, maxScrollDelta]);

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
    isLocked
  };
}