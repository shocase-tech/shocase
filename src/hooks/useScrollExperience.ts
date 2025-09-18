import { useState, useRef, useCallback, useEffect } from 'react';

interface UseScrollExperienceOptions {
  threshold?: number;
}

export const useScrollExperience = (options: UseScrollExperienceOptions = {}) => {
  const { threshold = 0.1 } = options;
  
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [accumulatedDelta, setAccumulatedDelta] = useState(0);
  
  const elementRef = useRef<HTMLElement>(null);
  const lockScrollRef = useRef(false);
  const lastScrollYRef = useRef(0);
  
  // Total scroll units for the entire experience (4 phases)
  const maxScrollDelta = 4000;
  
  const updateScrollProgress = useCallback(() => {
    if (!elementRef.current) return;
    
    const element = elementRef.current;
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    // Element is in view when top is above viewport bottom
    const elementInView = rect.top < windowHeight && rect.bottom > 0;
    
    if (elementInView && !lockScrollRef.current) {
      // Element is in view, start scroll lock
      const elementTop = rect.top;
      const triggerPoint = windowHeight * threshold;
      
      if (elementTop <= triggerPoint) {
        lockScrollRef.current = true;
        setIsLocked(true);
        lastScrollYRef.current = window.scrollY;
        
        // Prevent default scroll behavior
        document.body.style.overflow = 'hidden';
      }
    }
  }, [threshold]);
  
  const handleWheel = useCallback((e: WheelEvent) => {
    if (!isLocked || !lockScrollRef.current) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const delta = e.deltaY;
    const newAccumulated = Math.max(0, Math.min(maxScrollDelta, accumulatedDelta + delta));
    setAccumulatedDelta(newAccumulated);
    
    const progress = newAccumulated / maxScrollDelta;
    setScrollProgress(progress);
    
    // Unlock when we reach the end and user continues scrolling down
    if (newAccumulated >= maxScrollDelta && delta > 0) {
      lockScrollRef.current = false;
      setIsLocked(false);
      document.body.style.overflow = 'unset';
      
      // Resume natural scroll
      const currentScrollY = lastScrollYRef.current;
      window.scrollTo(0, currentScrollY + 1);
    }
    
    // Unlock when scrolling back up at the beginning
    if (newAccumulated <= 0 && delta < 0) {
      lockScrollRef.current = false;
      setIsLocked(false);
      document.body.style.overflow = 'unset';
      
      // Resume natural scroll upward
      const currentScrollY = lastScrollYRef.current;
      window.scrollTo(0, Math.max(0, currentScrollY - 1));
    }
  }, [isLocked, accumulatedDelta, maxScrollDelta]);
  
  // Animation phase calculators
  const getActionsProgress = useCallback(() => {
    // Phase 1: 0-25% of total progress
    const phaseProgress = Math.min(1, Math.max(0, scrollProgress * 4));
    return {
      microphoneOpacity: 0.75 * Math.max(0, 1 - Math.max(0, phaseProgress - 0.8) * 5),
      elevateOpacity: Math.min(1, Math.max(0, (phaseProgress - 0.1) / 0.3)),
      bookShowsOpacity: Math.min(1, Math.max(0, (phaseProgress - 0.4) / 0.3)),
      buildBrandOpacity: Math.min(1, Math.max(0, (phaseProgress - 0.7) / 0.3)),
    };
  }, [scrollProgress]);
  
  const getMessageProgress = useCallback(() => {
    // Phase 2: 25-50% of total progress
    if (scrollProgress < 0.25) return { horizontalPosition: -100 };
    if (scrollProgress > 0.5) return { horizontalPosition: 100 };
    
    const phaseProgress = (scrollProgress - 0.25) / 0.25;
    const horizontalPosition = -100 + (phaseProgress * 200); // -100 to +100
    return { horizontalPosition };
  }, [scrollProgress]);
  
  const getFeatureProgress = useCallback((cardIndex: number) => {
    // Phase 3: 50-100% of total progress
    if (scrollProgress < 0.5) return 0;
    
    const phaseProgress = (scrollProgress - 0.5) / 0.5;
    const totalCards = 8;
    const staggerDelay = cardIndex / totalCards;
    const animationDuration = 0.4; // Each card animates over 40% of the phase
    const cardProgress = Math.min(1, Math.max(0, (phaseProgress - staggerDelay) / animationDuration));
    
    return cardProgress;
  }, [scrollProgress]);
  
  useEffect(() => {
    const handleScroll = () => updateScrollProgress();
    const handleResize = () => updateScrollProgress();
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('wheel', handleWheel, { passive: false });
    
    // Initial check
    updateScrollProgress();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('wheel', handleWheel);
      
      // Cleanup: ensure scroll is unlocked
      document.body.style.overflow = 'unset';
    };
  }, [updateScrollProgress, handleWheel]);
  
  // Reset accumulated delta when not locked
  useEffect(() => {
    if (!isLocked) {
      setAccumulatedDelta(0);
      setScrollProgress(0);
    }
  }, [isLocked]);
  
  return {
    scrollProgress,
    elementRef,
    isLocked,
    getActionsProgress,
    getMessageProgress,
    getFeatureProgress,
  };
};