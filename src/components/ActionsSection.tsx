import { useScrollProgress } from "@/hooks/useScrollProgress";
import microphoneImage from "@/assets/microphone.png";

const ActionsSection = () => {
  const { scrollProgress, elementRef } = useScrollProgress();

  // Calculate individual animation progress points
  const microphoneProgress = scrollProgress;
  const elevateProgress = Math.max(0, (scrollProgress - 0.33) / 0.67) * (scrollProgress >= 0.33 ? 1 : 0);
  const bookShowsProgress = Math.max(0, (scrollProgress - 0.66) / 0.34) * (scrollProgress >= 0.66 ? 1 : 0);
  const buildBrandProgress = scrollProgress >= 1 ? 1 : 0;

  // Microphone transforms based on scroll progress
  const microphoneScale = 0.5 + (microphoneProgress * 0.5); // Scale from 0.5 to 1
  const microphoneX = 100 - (microphoneProgress * 50); // Move from right edge to center
  const microphoneY = 100 - (microphoneProgress * 50); // Move from bottom to center-top
  const microphoneRotation = 10; // Base 10 degree rotation as specified

  return (
    <section 
      ref={elementRef} 
      className="relative h-screen bg-gradient-to-br from-background via-background/95 to-muted/20 overflow-hidden"
    >
      {/* Microphone Image */}
      <div 
        className="absolute pointer-events-none"
        style={{
          right: `${microphoneX}%`,
          bottom: `${microphoneY}%`,
          transform: `translate(50%, 50%) scale(${microphoneScale}) rotate(${microphoneRotation}deg)`,
          transformOrigin: 'center center',
          transition: 'none', // Smooth scroll-based animation
        }}
      >
        <img 
          src={microphoneImage} 
          alt="Professional microphone"
          className="w-96 h-auto opacity-80"
          draggable={false}
        />
      </div>

      {/* Text Content */}
      <div className="absolute left-8 md:left-16 lg:left-24 top-1/2 -translate-y-1/2 z-10">
        <div className="space-y-8">
          {/* Elevate */}
          <div 
            className="overflow-hidden"
            style={{
              opacity: Math.min(1, elevateProgress * 2),
              transform: `translateY(${(1 - elevateProgress) * 50}px)`,
            }}
          >
            <h2 className="text-6xl md:text-7xl lg:text-8xl font-bold text-foreground tracking-tight">
              elevate
            </h2>
          </div>

          {/* Book Shows */}
          <div 
            className="overflow-hidden"
            style={{
              opacity: Math.min(1, bookShowsProgress * 2),
              transform: `translateY(${(1 - bookShowsProgress) * 50}px)`,
            }}
          >
            <h3 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-muted-foreground tracking-tight">
              book shows
            </h3>
          </div>

          {/* Build Your Brand */}
          <div 
            className="overflow-hidden"
            style={{
              opacity: Math.min(1, buildBrandProgress * 2),
              transform: `translateY(${(1 - buildBrandProgress) * 50}px)`,
            }}
          >
            <h3 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-muted-foreground tracking-tight">
              build your brand
            </h3>
          </div>
        </div>
      </div>

      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-background/40 pointer-events-none" />
    </section>
  );
};

export default ActionsSection;