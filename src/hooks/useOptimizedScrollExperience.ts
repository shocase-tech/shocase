import { useState, useRef, useCallback, useEffect } from 'react';

interface UseOptimizedScrollExperienceOptions {
  threshold?: number;
}

export const useOptimizedScrollExperience = (options: UseOptimizedScrollExperienceOptions = {}) => {
  const { threshold = 0.1 } = options;
  
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(0);
  
  const elementRef = useRef<HTMLElement>(null);
  const isLockedRef = useRef(false);
  const accumulatedScrollRef = useRef(0);
  const lastScrollTimeRef = useRef(0);
  const animationFrameRef = useRef<number>();
  
  // Total scroll distance for the entire experience
  const totalScrollDistance = 3000;
  
  // Throttled scroll handler for better performance
  const updateScrollProgress = useCallback(() => {
    if (!elementRef.current) return;
    
    const now = performance.now();
    if (now - lastScrollTimeRef.current < 16) return; // ~60fps throttle
    lastScrollTimeRef.current = now;
    
    const element = elementRef.current;
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    // Check if element is in view
    const elementInView = rect.top < windowHeight && rect.bottom > 0;
    const triggerPoint = windowHeight * threshold;
    
    if (elementInView && rect.top <= triggerPoint && !isLockedRef.current) {
      // Lock scroll
      isLockedRef.current = true;
      setIsLocked(true);
      document.body.style.overflow = 'hidden';
      accumulatedScrollRef.current = 0;
    }
  }, [threshold]);
  
  const handleWheelEvent = useCallback((e: WheelEvent) => {
    if (!isLockedRef.current) return;
    
    e.preventDefault();
    
    const delta = e.deltaY;
    const newAccumulated = Math.max(0, Math.min(totalScrollDistance, accumulatedScrollRef.current + delta));
    accumulatedScrollRef.current = newAccumulated;
    
    const progress = newAccumulated / totalScrollDistance;
    setScrollProgress(progress);
    
    // Update current phase
    if (progress < 0.33) setCurrentPhase(0);
    else if (progress < 0.67) setCurrentPhase(1);
    else setCurrentPhase(2);
    
    // Unlock when reaching end and scrolling down
    if (newAccumulated >= totalScrollDistance && delta > 0) {
      isLockedRef.current = false;
      setIsLocked(false);
      document.body.style.overflow = 'unset';
    }
    
    // Unlock when at beginning and scrolling up
    if (newAccumulated <= 0 && delta < 0) {
      isLockedRef.current = false;
      setIsLocked(false);
      document.body.style.overflow = 'unset';
    }
  }, [totalScrollDistance]);
  
  // Phase 1: Actions animation (0-33%)
  const getActionsAnimation = useCallback(() => {
    if (scrollProgress > 0.33) return { microphoneOpacity: 0, elevateOpacity: 1, bookShowsOpacity: 1, buildBrandOpacity: 1 };
    
    const phaseProgress = scrollProgress / 0.33;
    return {
      microphoneOpacity: Math.max(0, 0.7 - phaseProgress * 0.3),
      elevateOpacity: Math.min(1, Math.max(0, (phaseProgress - 0.1) / 0.25)),
      bookShowsOpacity: Math.min(1, Math.max(0, (phaseProgress - 0.4) / 0.25)),
      buildBrandOpacity: Math.min(1, Math.max(0, (phaseProgress - 0.7) / 0.25)),
    };
  }, [scrollProgress]);
  
  // Phase 2: Message animation (33-67%)
  const getMessageAnimation = useCallback(() => {
    if (scrollProgress < 0.33) return { horizontalPosition: -100 };
    if (scrollProgress > 0.67) return { horizontalPosition: 100 };
    
    const phaseProgress = (scrollProgress - 0.33) / 0.34;
    return {
      horizontalPosition: -100 + (phaseProgress * 200), // -100 to +100
    };
  }, [scrollProgress]);
  
  // Phase 3: Features animation (67-100%)
  const getFeatureAnimation = useCallback((cardIndex: number) => {
    if (scrollProgress < 0.67) return 0;
    
    const phaseProgress = (scrollProgress - 0.67) / 0.33;
    const totalCards = 8;
    const staggerDelay = cardIndex / totalCards * 0.3; // 30% of phase duration for stagger
    const animationDuration = 0.4;
    
    const cardProgress = Math.min(1, Math.max(0, (phaseProgress - staggerDelay) / animationDuration));
    return cardProgress;
  }, [scrollProgress]);
  
  useEffect(() => {
    const throttledScroll = () => {
      if (animationFrameRef.current) return;
      
      animationFrameRef.current = requestAnimationFrame(() => {
        updateScrollProgress();
        animationFrameRef.current = undefined;
      });
    };
    
    window.addEventListener('scroll', throttledScroll, { passive: true });
    window.addEventListener('resize', throttledScroll, { passive: true });
    window.addEventListener('wheel', handleWheelEvent, { passive: false });
    
    updateScrollProgress();
    
    return () => {
      window.removeEventListener('scroll', throttledScroll);
      window.removeEventListener('resize', throttledScroll);
      window.removeEventListener('wheel', handleWheelEvent);
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      // Cleanup
      document.body.style.overflow = 'unset';
    };
  }, [updateScrollProgress, handleWheelEvent]);
  
  return {
    scrollProgress,
    currentPhase,
    isLocked,
    elementRef,
    getActionsAnimation,
    getMessageAnimation,
    getFeatureAnimation,
  };
};