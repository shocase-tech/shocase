import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface Venue {
  id: string;
  name: string;
  slug: string;
  city: string;
  hero_image_url: string | null;
  logo_url: string | null;
  capacity: number | null;
}

const FeaturedVenuesSection = () => {
  const navigate = useNavigate();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const sectionRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  useEffect(() => {
    const fetchVenues = async () => {
      const { data } = await supabase
        .from('venues')
        .select('id, name, slug, city, hero_image_url, logo_url, capacity')
        .eq('featured', true)
        .eq('is_active', true)
        .limit(5);

      if (data) setVenues(data);
      setLoading(false);
    };

    fetchVenues();
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (textRef.current) {
        const rect = textRef.current.getBoundingClientRect();
        setMousePos({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    };

    const textElement = textRef.current;
    if (textElement) {
      textElement.addEventListener('mousemove', handleMouseMove);
      return () => textElement.removeEventListener('mousemove', handleMouseMove);
    }
  }, []);

  const getLetterStyle = (rect: DOMRect) => {
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distance = Math.sqrt(
      Math.pow(mousePos.x - centerX, 2) + Math.pow(mousePos.y - centerY, 2)
    );
    const effectRadius = 100;
    
    if (distance < effectRadius) {
      const intensity = 1 - distance / effectRadius;
      return {
        transform: `scale(${1 + intensity * 0.2})`,
        textShadow: `0 0 ${intensity * 20}px hsl(var(--primary))`,
        transition: 'all 0.15s ease'
      };
    }
    
    return {
      transition: 'all 0.15s ease'
    };
  };

  return (
    <section 
      ref={sectionRef}
      className="relative min-h-screen py-24 px-6 bg-gradient-to-b from-background via-background/95 to-background overflow-hidden"
    >
      <div className="max-w-7xl mx-auto h-full">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center min-h-[600px]">
          {/* Left - Interactive Text */}
          <div className="lg:col-span-2 flex items-center justify-center">
            <div 
              ref={textRef}
              className="text-6xl md:text-8xl lg:text-9xl font-bold leading-none gradient-text cursor-default select-none"
            >
              {['shocase', 'your', 'music'].map((word, wordIndex) => (
                <div key={wordIndex} className="relative">
                  {word.split('').map((letter, letterIndex) => (
                    <span
                      key={`${wordIndex}-${letterIndex}`}
                      className="inline-block"
                      style={getLetterStyle(
                        document.getElementById(`letter-${wordIndex}-${letterIndex}`)?.getBoundingClientRect() || new DOMRect()
                      )}
                      id={`letter-${wordIndex}-${letterIndex}`}
                    >
                      {letter}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Right - Stacked Venue Cards */}
          <div className="lg:col-span-3 relative h-[500px] flex items-center justify-center">
            {loading ? (
              <div className="space-y-4 w-full max-w-md">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-48 w-full rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="relative w-full max-w-md h-full">
                {venues.map((venue, index) => {
                  const progress = useTransform(
                    scrollYProgress,
                    [0.3, 0.8],
                    [0, 1]
                  );
                  const rotation = useTransform(progress, [0, 1], [0, index * 6 - 12]);
                  const translateX = useTransform(progress, [0, 1], [0, index * 30 - 60]);
                  const translateY = useTransform(progress, [0, 1], [index * -80, index * 20 - 40]);

                  return (
                    <motion.div
                      key={venue.id}
                      className="absolute top-1/2 left-1/2 w-full max-w-sm glass-card overflow-hidden cursor-pointer hover:shadow-glow transition-shadow"
                      style={{
                        rotate: rotation,
                        translateX,
                        translateY,
                        x: '-50%',
                        y: '-50%',
                        zIndex: venues.length - index
                      }}
                      onClick={() => navigate(`/venues/${venue.slug}`)}
                    >
                      <div className="relative h-48">
                        {venue.hero_image_url || venue.logo_url ? (
                          <img 
                            src={venue.hero_image_url || venue.logo_url || ''} 
                            alt={venue.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
                        
                        <div className="absolute bottom-4 left-4 right-4">
                          <h3 className="text-xl font-bold mb-1">{venue.name}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{venue.city}</p>
                          {venue.capacity && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Users className="w-3 h-3" />
                              <span>{venue.capacity}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="text-center mt-12">
          <Button 
            size="lg" 
            onClick={() => navigate('/venues')}
            className="px-8"
          >
            View All Venues
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedVenuesSection;
