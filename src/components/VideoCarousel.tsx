import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface VideoCarouselProps {
  videos: string[];
  artistName: string;
}

export const VideoCarousel: React.FC<VideoCarouselProps> = ({ videos, artistName }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const changeVideo = useCallback((newIndex: number) => {
    if (newIndex === activeIndex || isTransitioning) return;
    
    setIsTransitioning(true);
    setActiveIndex(newIndex);
    
    // Reset transition state after animation
    setTimeout(() => setIsTransitioning(false), 300);
  }, [activeIndex, isTransitioning]);

  const nextVideo = useCallback(() => {
    const newIndex = (activeIndex + 1) % videos.length;
    changeVideo(newIndex);
  }, [activeIndex, videos.length, changeVideo]);

  const prevVideo = useCallback(() => {
    const newIndex = activeIndex === 0 ? videos.length - 1 : activeIndex - 1;
    changeVideo(newIndex);
  }, [activeIndex, videos.length, changeVideo]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        nextVideo();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        prevVideo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextVideo, prevVideo]);

  // Touch/swipe support
  useEffect(() => {
    let startX = 0;
    let endX = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
    };

    const handleTouchMove = (e: TouchEvent) => {
      endX = e.touches[0].clientX;
    };

    const handleTouchEnd = () => {
      if (!startX || !endX) return;
      
      const difference = startX - endX;
      const threshold = 50;

      if (Math.abs(difference) > threshold) {
        if (difference > 0) {
          nextVideo();
        } else {
          prevVideo();
        }
      }
      
      startX = 0;
      endX = 0;
    };

    const carousel = document.getElementById('video-carousel');
    if (carousel) {
      carousel.addEventListener('touchstart', handleTouchStart);
      carousel.addEventListener('touchmove', handleTouchMove);
      carousel.addEventListener('touchend', handleTouchEnd);

      return () => {
        carousel.removeEventListener('touchstart', handleTouchStart);
        carousel.removeEventListener('touchmove', handleTouchMove);
        carousel.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [nextVideo, prevVideo]);

  if (!videos.length) return null;

  return (
    <div id="video-carousel" className="w-full space-y-4">
      {/* Main Video Display */}
      <div className="relative group">
        <div 
          className={cn(
            "aspect-video rounded-lg overflow-hidden bg-black/20 shadow-2xl transition-all duration-300",
            "transform-gpu perspective-1000",
            isTransitioning && "scale-[0.98] opacity-90"
          )}
          style={{
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)'
          }}
        >
          <iframe
            key={activeIndex} // Force re-render when video changes
            src={videos[activeIndex].replace('watch?v=', 'embed/')}
            className="w-full h-full"
            frameBorder="0"
            allowFullScreen
            title={`${artistName} performance ${activeIndex + 1}`}
            loading="lazy"
          />
        </div>

        {/* Navigation Arrows */}
        {videos.length > 1 && (
          <>
            <Button
              variant="outline"
              size="icon"
              className={cn(
                "absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full",
                "bg-black/50 border-white/20 text-white hover:bg-black/70 hover:scale-110",
                "opacity-0 group-hover:opacity-100 transition-all duration-300",
                "backdrop-blur-sm shadow-lg transform-gpu"
              )}
              onClick={prevVideo}
              disabled={isTransitioning}
              aria-label="Previous video"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              className={cn(
                "absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full",
                "bg-black/50 border-white/20 text-white hover:bg-black/70 hover:scale-110",
                "opacity-0 group-hover:opacity-100 transition-all duration-300",
                "backdrop-blur-sm shadow-lg transform-gpu"
              )}
              onClick={nextVideo}
              disabled={isTransitioning}
              aria-label="Next video"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </>
        )}

        {/* Video Counter */}
        {videos.length > 1 && (
          <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
            {activeIndex + 1} / {videos.length}
          </div>
        )}
      </div>

      {/* Thumbnail Strip */}
      {videos.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
          
          {videos.map((video, index) => (
            <button
              key={index}
              onClick={() => changeVideo(index)}
              disabled={isTransitioning}
              className={cn(
                "relative flex-shrink-0 w-24 h-14 md:w-32 md:h-18 rounded-md overflow-hidden",
                "transition-all duration-300 transform-gpu",
                "hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary",
                index === activeIndex 
                  ? "ring-2 ring-primary scale-105 shadow-lg opacity-100" 
                  : "opacity-70 hover:opacity-90",
                isTransitioning && "pointer-events-none"
              )}
              style={{
                perspective: '1000px'
              }}
              aria-label={`Play video ${index + 1}`}
            >
              <div 
                className={cn(
                  "w-full h-full bg-black/40 border border-white/10 rounded-md",
                  "transition-transform duration-300",
                  index === activeIndex && "rotateY-0",
                  index !== activeIndex && "hover:rotateY-2"
                )}
                style={{
                  backgroundImage: `url(https://img.youtube.com/vi/${video.split('v=')[1]?.split('&')[0] || ''}/mqdefault.jpg)`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <Play className={cn(
                    "w-4 h-4 md:w-5 md:h-5 text-white transition-all duration-300",
                    index === activeIndex ? "scale-110" : "scale-100 opacity-80"
                  )} />
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};