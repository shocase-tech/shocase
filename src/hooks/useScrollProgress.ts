import { useState, useEffect, useRef, useCallback } from 'react';

interface UseScrollLockOptions {
  threshold?: number;
  lockDuration?: number; // Duration in scroll units for locked phase
}

export function useScrollProgress(options: UseScrollLockOptions = {}) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [accumulatedDelta, setAccumulatedDelta] = useState(0);
  const elementRef = useRef<HTMLElement>(null);
  const { threshold = 0, lockDuration = 1000 } = options;
  
  const lockScrollRef = useRef(false);
  const lastScrollYRef = useRef(0);
  const animationPhaseRef = useRef(0); // 0: enter, 1: text reveal, 2: text fade, 3: mic fade, 4: exit

  const updateScrollProgress = useCallback(() => {
    const element = elementRef.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const elementHeight = element.offsetHeight;
    const windowHeight = window.innerHeight;
    
    // Calculate when element starts entering viewport
    const startOffset = windowHeight - threshold;
    const endOffset = -elementHeight + threshold;
    
    // Check if we should enter scroll lock mode
    if (rect.top <= 0 && rect.top >= -windowHeight && !lockScrollRef.current) {
      // Microphone is fully visible, start scroll lock
      lockScrollRef.current = true;
      setIsLocked(true);
      lastScrollYRef.current = window.scrollY;
      animationPhaseRef.current = 1; // Start text reveal phase
      return;
    }
    
    // Normal scroll behavior when not locked
    if (!lockScrollRef.current) {
      let progress = 0;
      
      if (rect.top <= startOffset && rect.top >= endOffset) {
        const totalScrollDistance = startOffset - endOffset;
        const currentScrollDistance = startOffset - rect.top;
        progress = Math.max(0, Math.min(1, currentScrollDistance / totalScrollDistance));
      } else if (rect.top < endOffset) {
        progress = 1;
      }
      
      setScrollProgress(progress);
    }
  }, [threshold]);

  const handleWheel = useCallback((e: WheelEvent) => {
    if (!lockScrollRef.current) return;
    
    e.preventDefault();
    
    const delta = e.deltaY;
    const newAccumulated = Math.max(0, accumulatedDelta + delta);
    setAccumulatedDelta(newAccumulated);
    
    // Phase 1: Text reveal (0-600 scroll units)
    if (newAccumulated <= 600) {
      animationPhaseRef.current = 1;
      const progress = Math.min(1, newAccumulated / 600);
      setScrollProgress(progress);
    }
    // Phase 2: Text fade out (600-900 scroll units)
    else if (newAccumulated <= 900) {
      animationPhaseRef.current = 2;
      const fadeProgress = (newAccumulated - 600) / 300;
      setScrollProgress(1 + fadeProgress); // 1-2 range for fade out
    }
    // Phase 3: Microphone fade (900-1200 scroll units)
    else if (newAccumulated <= 1200) {
      animationPhaseRef.current = 3;
      const micFadeProgress = (newAccumulated - 900) / 300;
      setScrollProgress(2 + micFadeProgress); // 2-3 range for mic fade
      
      // Unlock at 50% fade
      if (micFadeProgress >= 0.5 && lockScrollRef.current) {
        lockScrollRef.current = false;
        setIsLocked(false);
        animationPhaseRef.current = 4;
        
        // Allow natural scroll to continue
        window.scrollTo(0, lastScrollYRef.current + (newAccumulated * 0.5));
      }
    }
    // Phase 4: Complete and unlock
    else {
      if (lockScrollRef.current) {
        lockScrollRef.current = false;
        setIsLocked(false);
        animationPhaseRef.current = 4;
        setScrollProgress(3);
        
        // Resume natural scrolling
        window.scrollTo(0, lastScrollYRef.current + 600);
      }
    }
  }, [accumulatedDelta]);

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
    animationPhase: animationPhaseRef.current 
  };
}