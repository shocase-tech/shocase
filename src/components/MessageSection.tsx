import { useScrollHorizontal } from "@/hooks/useScrollHorizontal";

const MessageSection = () => {
  const { scrollProgress, elementRef, isLocked } = useScrollHorizontal();

  // Calculate horizontal position
  // 0 = off-screen left (-100%), 0.5 = center (0%), 1 = off-screen right (100%)
  const getHorizontalPosition = () => {
    if (scrollProgress <= 0.5) {
      // Moving from left (-100%) to center (0%)
      return -100 + (scrollProgress * 2 * 100);
    } else {
      // Moving from center (0%) to right (100%)
      return (scrollProgress - 0.5) * 2 * 100;
    }
  };

  const horizontalPosition = getHorizontalPosition();

  return (
    <section 
      ref={elementRef} 
      className="relative h-screen bg-black overflow-hidden flex items-center justify-center"
    >
      {/* Scroll Lock Indicator */}
      {isLocked && (
        <div className="fixed top-4 right-4 z-50 bg-primary/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm text-primary border border-primary/30">
          Scroll to move text
        </div>
      )}

      {/* Text Content */}
      <div 
        className="text-center"
        style={{
          transform: `translateX(${horizontalPosition}%)`,
          transition: isLocked ? 'none' : 'transform 0.3s ease-out',
        }}
      >
        {/* Desktop Layout - Single Line */}
        <h2 className="hidden md:block text-8xl lg:text-9xl xl:text-[12rem] font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary-glow to-accent tracking-tight whitespace-nowrap">
          shocase your music
        </h2>

        {/* Mobile Layout - Stacked Words */}
        <div className="block md:hidden space-y-2">
          <h2 className="text-6xl sm:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary-glow to-accent tracking-tight">
            shocase
          </h2>
          <h2 className="text-6xl sm:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary-glow to-accent tracking-tight">
            your
          </h2>
          <h2 className="text-6xl sm:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary-glow to-accent tracking-tight">
            music
          </h2>
        </div>
      </div>
    </section>
  );
};

export default MessageSection;