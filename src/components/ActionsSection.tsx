import { useScrollProgress } from "@/hooks/useScrollProgress";
import microphoneImage from "@/assets/microphone.png";

const ActionsSection = () => {
  const { scrollProgress, elementRef, isLocked, animationPhase } = useScrollProgress();

  // Calculate animation states based on scroll progress and phase
  let microphoneOpacity = 0.75; // Base 75% opacity for better visibility
  let elevateOpacity = 0;
  let bookShowsOpacity = 0;
  let buildBrandOpacity = 0;

  if (scrollProgress <= 1) {
    // Phase 1: Text reveal based on scroll progress
    elevateOpacity = Math.min(1, Math.max(0, (scrollProgress - 0.2) / 0.3));
    bookShowsOpacity = Math.min(1, Math.max(0, (scrollProgress - 0.5) / 0.3));
    buildBrandOpacity = Math.min(1, Math.max(0, (scrollProgress - 0.8) / 0.2));
  } else if (scrollProgress <= 2) {
    // Phase 2: Text fade out
    const fadeProgress = scrollProgress - 1;
    elevateOpacity = 1 - fadeProgress;
    bookShowsOpacity = 1 - fadeProgress;
    buildBrandOpacity = 1 - fadeProgress;
  } else if (scrollProgress <= 3) {
    // Phase 3: Microphone fade out
    const micFadeProgress = scrollProgress - 2;
    microphoneOpacity = 0.75 * (1 - micFadeProgress);
    elevateOpacity = 0;
    bookShowsOpacity = 0;
    buildBrandOpacity = 0;
  }

  // Fixed microphone position (diagonal from bottom-right to center-top)
  const microphoneScale = 1.2; // Larger scale for better visibility
  const microphoneX = 20; // Fixed X position (right side)
  const microphoneY = 20; // Fixed Y position (bottom area)
  const microphoneRotation = 10; // 10 degree clockwise rotation

  return (
    <section 
      ref={elementRef} 
      className="relative h-screen bg-gradient-to-br from-background via-background/95 to-muted/20 overflow-hidden"
    >
      {/* Scroll Lock Indicator */}
      {isLocked && (
        <div className="fixed top-4 right-4 z-50 bg-primary/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm text-primary border border-primary/30">
          Scroll to animate
        </div>
      )}

      {/* Microphone Image */}
      <div 
        className="absolute pointer-events-none"
        style={{
          right: `${microphoneX}%`,
          bottom: `${microphoneY}%`,
          transform: `translate(50%, 50%) scale(${microphoneScale}) rotate(${microphoneRotation}deg)`,
          transformOrigin: 'center center',
          opacity: microphoneOpacity,
          transition: 'opacity 0.3s ease-out',
          filter: 'brightness(0.8)', // Reduce brightness slightly
        }}
      >
        <img 
          src={microphoneImage} 
          alt="Professional microphone"
          className="w-96 h-auto"
          draggable={false}
          style={{ mixBlendMode: 'normal' }} // Ensure PNG transparency works well
        />
      </div>

      {/* Text Content */}
      <div className="absolute left-8 md:left-16 lg:left-24 top-1/2 -translate-y-1/2 z-10">
        <div className="space-y-6">
          {/* Elevate */}
          <div 
            className="overflow-hidden"
            style={{
              opacity: elevateOpacity,
              transform: `translateY(${(1 - Math.min(1, elevateOpacity * 2)) * 30}px)`,
              transition: 'opacity 0.2s ease-out, transform 0.2s ease-out',
            }}
          >
            <h2 className="text-6xl md:text-7xl lg:text-8xl font-bold text-foreground tracking-tight gradient-text">
              elevate
            </h2>
          </div>

          {/* Book Shows */}
          <div 
            className="overflow-hidden"
            style={{
              opacity: bookShowsOpacity,
              transform: `translateY(${(1 - Math.min(1, bookShowsOpacity * 2)) * 30}px)`,
              transition: 'opacity 0.2s ease-out, transform 0.2s ease-out',
            }}
          >
            <h2 className="text-6xl md:text-7xl lg:text-8xl font-bold text-foreground tracking-tight gradient-text">
              book shows
            </h2>
          </div>

          {/* Build Your Brand */}
          <div 
            className="overflow-hidden"
            style={{
              opacity: buildBrandOpacity,
              transform: `translateY(${(1 - Math.min(1, buildBrandOpacity * 2)) * 30}px)`,
              transition: 'opacity 0.2s ease-out, transform 0.2s ease-out',
            }}
          >
            <h2 className="text-6xl md:text-7xl lg:text-8xl font-bold text-foreground tracking-tight gradient-text">
              build your brand
            </h2>
          </div>
        </div>
      </div>

      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-background/40 pointer-events-none" />
    </section>
  );
};

export default ActionsSection;