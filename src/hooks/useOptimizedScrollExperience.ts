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
  
  // Total scroll distance for the entire experience (much larger for scroll resistance)
  const totalScrollDistance = 8000;
  
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
    
    if (elementInView && rect.top <= 0 && !isLockedRef.current) {
      // Lock scroll when element reaches top of screen
      isLockedRef.current = true;
      setIsLocked(true);
      document.body.style.overflow = 'hidden';
      accumulatedScrollRef.current = 0;
      // Prevent any hero section bleed-through - ensure exact top alignment
      element.style.position = 'fixed';
      element.style.top = '0px';
      element.style.left = '0px';
      element.style.right = '0px';
      element.style.zIndex = '50';
      element.style.width = '100vw';
      element.style.height = '100vh';
    }
  }, [threshold]);
  
  const handleWheelEvent = useCallback((e: WheelEvent) => {
    if (!isLockedRef.current) return;
    
    e.preventDefault();
    
    const delta = e.deltaY * 0.3; // Add scroll resistance - much slower progression
    const newAccumulated = Math.max(0, Math.min(totalScrollDistance, accumulatedScrollRef.current + delta));
    accumulatedScrollRef.current = newAccumulated;
    
    const progress = newAccumulated / totalScrollDistance;
    setScrollProgress(progress);
    
    // Update current phase - ensure exact 33.33% boundaries
    if (progress <= 0.3333) setCurrentPhase(0);
    else if (progress <= 0.6666) setCurrentPhase(1);
    else setCurrentPhase(2);
    
    // Unlock when reaching end and scrolling down - smooth transition to next section
    if (newAccumulated >= totalScrollDistance && delta > 0) {
      isLockedRef.current = false;
      setIsLocked(false);
      document.body.style.overflow = 'unset';
      // Reset positioning immediately to allow natural scroll flow
      if (elementRef.current) {
        elementRef.current.style.position = 'relative';
        elementRef.current.style.top = 'unset';
        elementRef.current.style.left = 'unset';
        elementRef.current.style.right = 'unset';
        elementRef.current.style.zIndex = 'unset';
        elementRef.current.style.width = 'unset';
        elementRef.current.style.height = 'unset';
      }
      // Allow immediate scroll to next section without timeout
      window.scrollBy(0, 1);
    }
    
    // Unlock when at beginning and scrolling up - smooth transition to previous section
    if (newAccumulated <= 0 && delta < 0) {
      isLockedRef.current = false;
      setIsLocked(false);
      document.body.style.overflow = 'unset';
      // Reset positioning immediately
      if (elementRef.current) {
        elementRef.current.style.position = 'relative';
        elementRef.current.style.top = 'unset';
        elementRef.current.style.left = 'unset';
        elementRef.current.style.right = 'unset';
        elementRef.current.style.zIndex = 'unset';
        elementRef.current.style.width = 'unset';
        elementRef.current.style.height = 'unset';
      }
      // Allow scroll to previous section
      window.scrollBy(0, -1);
    }
  }, [totalScrollDistance]);
  
  // Phase 1: Actions animation (0-33%) with pan-right transition
  const getActionsAnimation = useCallback(() => {
    if (scrollProgress > 0.33) return { 
      microphoneOpacity: 0, 
      elevateOpacity: 0, 
      bookShowsOpacity: 0, 
      buildBrandOpacity: 0,
      horizontalPosition: 100
    };
    
    const phaseProgress = scrollProgress / 0.33;
    
    // Start panning right when 80% through the phase (at 26.4% overall progress)
    const panStartPoint = 0.8;
    const panProgress = Math.max(0, (phaseProgress - panStartPoint) / (1 - panStartPoint));
    
    return {
      microphoneOpacity: Math.max(0, 0.7 - phaseProgress * 0.3 - panProgress * 0.4),
      elevateOpacity: Math.min(1, Math.max(0, (phaseProgress - 0.1) / 0.25)) * (1 - panProgress),
      bookShowsOpacity: Math.min(1, Math.max(0, (phaseProgress - 0.4) / 0.25)) * (1 - panProgress),
      buildBrandOpacity: Math.min(1, Math.max(0, (phaseProgress - 0.7) / 0.25)) * (1 - panProgress),
      horizontalPosition: panProgress * 100, // Pan right 0 to 100%
    };
  }, [scrollProgress]);
  
  // Phase 2: Message animation - starts when actions are 80% gone (26.4% progress)
  const getMessageAnimation = useCallback(() => {
    // Start message animation when actions are 80% through (at 26.4% overall progress)
    const messageStartPoint = 0.264; // 80% of 33%
    const messageEndPoint = 0.67;
    
    if (scrollProgress < messageStartPoint) return { horizontalPosition: -100, opacity: 0 };
    if (scrollProgress > messageEndPoint) return { horizontalPosition: 100, opacity: 0 };
    
    const phaseProgress = (scrollProgress - messageStartPoint) / (messageEndPoint - messageStartPoint);
    let horizontalPosition = -100;
    
    if (phaseProgress < 0.25) {
      // Move from left to center
      const easedProgress = phaseProgress / 0.25;
      const eased = 1 - Math.pow(1 - easedProgress, 3); // Ease out cubic
      horizontalPosition = -100 + eased * 100; // -100 to 0
    } else if (phaseProgress < 0.75) {
      // Hold in center
      horizontalPosition = 0;
    } else {
      // Move from center to right
      const easedProgress = (phaseProgress - 0.75) / 0.25;
      const eased = Math.pow(easedProgress, 3); // Ease in cubic
      horizontalPosition = eased * 100; // 0 to 100
    }
    
    return {
      horizontalPosition,
      opacity: 1,
    };
  }, [scrollProgress]);
  
  // Phase 3: Features animation (67-100%) - visible throughout with staggered entry
  const getFeatureAnimation = useCallback((cardIndex: number) => {
    if (scrollProgress < 0.67) return { opacity: 0, transform: 40 };
    
    const phaseProgress = (scrollProgress - 0.67) / 0.33;
    const totalCards = 8;
    const staggerDelay = cardIndex / totalCards * 0.2; // Reduced stagger for smoother effect
    const animationDuration = 0.3;
    
    const cardProgress = Math.min(1, Math.max(0, (phaseProgress - staggerDelay) / animationDuration));
    
    return {
      opacity: cardProgress,
      transform: (1 - cardProgress) * 40, // Move up from 40px to 0
    };
  }, [scrollProgress]);
  
  // Header fade animation for features section
  const getHeaderFadeAnimation = useCallback(() => {
    if (scrollProgress < 0.67) return { opacity: 0, transform: 20 };
    
    const phaseProgress = (scrollProgress - 0.67) / 0.33;
    const fadeProgress = Math.min(1, phaseProgress / 0.2); // Fade in quickly
    
    return {
      opacity: fadeProgress,
      transform: (1 - fadeProgress) * 20,
    };
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
      if (elementRef.current) {
        elementRef.current.style.position = 'relative';
        elementRef.current.style.top = 'unset';
        elementRef.current.style.left = 'unset';
        elementRef.current.style.right = 'unset';
        elementRef.current.style.zIndex = 'unset';
        elementRef.current.style.width = 'unset';
        elementRef.current.style.height = 'unset';
      }
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
    getHeaderFadeAnimation,
  };
};