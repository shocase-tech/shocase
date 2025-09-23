import { useState, useRef, useCallback, useEffect } from 'react';

interface UseOptimizedScrollExperienceOptions {
  threshold?: number;
}

export const useOptimizedScrollExperience = (options: UseOptimizedScrollExperienceOptions = {}) => {
  const { threshold = 0.1 } = options;
  
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  
  const elementRef = useRef<HTMLElement>(null);
  const isLockedRef = useRef(false);
  const accumulatedScrollRef = useRef(0);
  const lastScrollTimeRef = useRef(0);
  const animationFrameRef = useRef<number>();
  const isMobile = useRef(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
  
  // Total scroll distance for the entire experience - optimized for mobile vs desktop
  const totalScrollDistance = isMobile.current ? 5000 : 12000;
  
  // Scroll resistance multiplier - much more responsive on mobile
  const scrollMultiplier = isMobile.current ? 0.7 : 0.2;
  
  // Touch sensitivity multiplier for mobile devices
  const touchSensitivity = isMobile.current ? 5 : 2;
  
  // Shared scroll logic for both wheel and touch events
  const updateScrollDelta = useCallback((delta: number) => {
    if (!isLockedRef.current) return;
    
    const scrollDelta = delta * scrollMultiplier; // Device-optimized scroll resistance
    const newAccumulated = Math.max(0, Math.min(totalScrollDistance, accumulatedScrollRef.current + scrollDelta));
    accumulatedScrollRef.current = newAccumulated;
    
    const progress = newAccumulated / totalScrollDistance;
    setScrollProgress(progress);
    
    // Update current phase with boundaries
    if (progress <= 0.34) setCurrentPhase(0);
    else if (progress <= 0.59) setCurrentPhase(1);
    else if (progress <= 0.84) setCurrentPhase(2);
    else setCurrentPhase(3);
    
    // Hard stop at 100% - this is the bottom of the landing page
    if (newAccumulated >= totalScrollDistance) {
      // Lock at exactly 100% - no further scrolling allowed
      accumulatedScrollRef.current = totalScrollDistance;
      setScrollProgress(1);
      setCurrentPhase(3);
      
      // Only unlock if scrolling up from 100%
      if (delta < 0) {
        // Allow slight scroll back into the experience
        const backScrollAmount = Math.min(100, -delta);
        accumulatedScrollRef.current = totalScrollDistance - backScrollAmount;
      }
      return; // Prevent any downward scrolling past 100%
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
  }, [totalScrollDistance, scrollMultiplier]);
  
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
    updateScrollDelta(e.deltaY);
  }, [updateScrollDelta]);

  // Touch event handlers for mobile support
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!isLockedRef.current) return;
    setTouchStart(e.touches[0].clientY);
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isLockedRef.current || touchStart === null) return;
    
    e.preventDefault();
    
    const touchCurrent = e.touches[0].clientY;
    const delta = (touchStart - touchCurrent) * touchSensitivity; // Device-optimized touch sensitivity
    
    updateScrollDelta(delta);
    setTouchStart(touchCurrent);
  }, [touchStart, updateScrollDelta, touchSensitivity]);

  const handleTouchEnd = useCallback(() => {
    setTouchStart(null);
  }, []);
  
  // Phase 0: Actions animation (0-34%)
  const getActionsAnimation = useCallback(() => {
    if (scrollProgress > 0.34) {
      // Fully scrolled off screen after phase 0
      return { 
        microphoneOpacity: 0, 
        elevateOpacity: 0, 
        bookShowsOpacity: 0, 
        buildBrandOpacity: 0,
        microphoneTransform: -200, // Microphone moves faster (parallax)
        textTransform: -150 // Text moves slower
      };
    }
    
    const phaseProgress = scrollProgress / 0.34;
    
    // Regular animations until 27%
    if (scrollProgress < 0.27) {
      return {
        microphoneOpacity: Math.max(0, 0.7 - phaseProgress * 0.3),
        elevateOpacity: scrollProgress >= 0.09 ? 1 : Math.max(0, (scrollProgress - 0.05) / 0.04),
        bookShowsOpacity: scrollProgress >= 0.18 ? 1 : Math.max(0, (scrollProgress - 0.14) / 0.04),
        buildBrandOpacity: scrollProgress >= 0.27 ? 1 : Math.max(0, (scrollProgress - 0.23) / 0.04),
        microphoneTransform: 0,
        textTransform: 0
      };
    }
    
    // Parallax scroll effect from 27-34%
    const panProgress = (scrollProgress - 0.27) / 0.07; // 0 to 1 over 7% scroll
    const easeOutQuart = 1 - Math.pow(1 - panProgress, 4); // Smooth easing
    
    return {
      microphoneOpacity: Math.max(0, 0.4 - panProgress), // Fade out as it moves
      elevateOpacity: Math.max(0, 1 - panProgress * 1.5), // Fade out faster
      bookShowsOpacity: Math.max(0, 1 - panProgress * 1.5),
      buildBrandOpacity: Math.max(0, 1 - panProgress * 1.5),
      microphoneTransform: easeOutQuart * -200, // Microphone moves faster (parallax)
      textTransform: easeOutQuart * -150 // Text moves slower for parallax effect
    };
  }, [scrollProgress]);
  
  // Phase 1: Message animation (34-59%) - much slower movement with extended center pause
  const getMessageAnimation = useCallback(() => {
    if (scrollProgress < 0.34) return { horizontalPosition: -100, opacity: 0 };
    if (scrollProgress > 0.59) return { horizontalPosition: 100, opacity: 0 };
    
    const phaseProgress = (scrollProgress - 0.34) / 0.25;
    let horizontalPosition = -100;
    
    if (phaseProgress < 0.3) {
      // Move from left to center (much slower with easing)
      const easedProgress = phaseProgress / 0.3;
      const eased = 1 - Math.pow(1 - easedProgress, 3); // Ease out cubic
      horizontalPosition = -100 + eased * 100; // -100 to 0
    } else if (phaseProgress < 0.7) {
      // Hold in center (extended pause)
      horizontalPosition = 0;
    } else {
      // Move from center to right (much slower with easing)
      const easedProgress = (phaseProgress - 0.7) / 0.3;
      const eased = Math.pow(easedProgress, 3); // Ease in cubic
      horizontalPosition = eased * 100; // 0 to 100
    }
    
    return {
      horizontalPosition,
      opacity: 1,
    };
  }, [scrollProgress]);
  
  // Phase 2: Features animation (59-84%) - visible throughout with staggered entry
  const getFeatureAnimation = useCallback((cardIndex: number) => {
    if (scrollProgress < 0.59) return { opacity: 0, transform: 40, panUpTransform: 0 };
    
    // Parallax scroll effect from 84-90%
    if (scrollProgress > 0.84) {
      const panProgress = (scrollProgress - 0.84) / 0.06; // 0 to 1 over 6% scroll
      const easeOutQuart = 1 - Math.pow(1 - panProgress, 4); // Smooth easing
      return { 
        opacity: Math.max(0, 1 - panProgress * 1.5), // Fade out as they move
        transform: 0, 
        panUpTransform: easeOutQuart * -150 // All cards move up together
      };
    }
    
    const phaseProgress = (scrollProgress - 0.59) / 0.25;
    const totalCards = 8;
    const staggerDelay = cardIndex / totalCards * 0.2; // Reduced stagger for smoother effect
    const animationDuration = 0.3;
    
    const cardProgress = Math.min(1, Math.max(0, (phaseProgress - staggerDelay) / animationDuration));
    
    return {
      opacity: cardProgress,
      transform: (1 - cardProgress) * 40, // Move up from 40px to 0
      panUpTransform: 0
    };
  }, [scrollProgress]);
  
  // Header fade animation for features section
  const getHeaderFadeAnimation = useCallback(() => {
    if (scrollProgress < 0.59) return { opacity: 0, transform: 20, panUpTransform: 0 };
    
    // Parallax scroll effect from 84-90%
    if (scrollProgress > 0.84) {
      const panProgress = (scrollProgress - 0.84) / 0.06; // 0 to 1 over 6% scroll
      const easeOutQuart = 1 - Math.pow(1 - panProgress, 4); // Smooth easing
      return { 
        opacity: Math.max(0, 1 - panProgress * 1.5), // Fade out as it moves
        transform: 0, 
        panUpTransform: easeOutQuart * -200 // Header moves up faster for parallax
      };
    }
    
    const phaseProgress = (scrollProgress - 0.59) / 0.25;
    const fadeProgress = Math.min(1, phaseProgress / 0.2); // Fade in quickly
    
    return {
      opacity: fadeProgress,
      transform: (1 - fadeProgress) * 20,
      panUpTransform: 0
    };
  }, [scrollProgress]);

  // Phase 3: CTA/Footer animation (90-100%)
  const getCTAAnimation = useCallback(() => {
    if (scrollProgress < 0.90) return { opacity: 0, transform: 40 };
    
    const phaseProgress = (scrollProgress - 0.90) / 0.10;
    const fadeProgress = Math.min(1, phaseProgress / 0.3); // Fade in quickly
    
    return {
      opacity: fadeProgress,
      transform: (1 - fadeProgress) * 40,
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
    
    // Add touch event listeners for mobile support
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    updateScrollProgress();
    
    return () => {
      window.removeEventListener('scroll', throttledScroll);
      window.removeEventListener('resize', throttledScroll);
      window.removeEventListener('wheel', handleWheelEvent);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      
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
  }, [updateScrollProgress, handleWheelEvent, handleTouchStart, handleTouchMove, handleTouchEnd]);
  
  return {
    scrollProgress,
    currentPhase,
    isLocked,
    elementRef,
    getActionsAnimation,
    getMessageAnimation,
    getFeatureAnimation,
    getHeaderFadeAnimation,
    getCTAAnimation,
  };
};