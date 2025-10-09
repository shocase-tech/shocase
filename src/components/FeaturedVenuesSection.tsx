import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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
  const [isHovered, setIsHovered] = useState(false);

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


  return (
    <section className="relative min-h-screen py-24 px-6 bg-gradient-to-b from-background via-background/95 to-background overflow-hidden">
      <div className="max-w-7xl mx-auto h-full">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center min-h-[600px]">
          {/* Left - Interactive Text */}
          <div className="lg:col-span-2 flex items-center justify-center">
            <h2 className="text-6xl md:text-8xl lg:text-9xl font-bold leading-tight gradient-text">
              shocase<br />
              your<br />
              music
            </h2>
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
              <div 
                className="relative w-full max-w-md h-full"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                {venues.map((venue, index) => {
                  const rotation = isHovered ? index * 8 - 16 : index * 2 - 4;
                  const translateX = isHovered ? index * 40 - 80 : 0;
                  const translateY = index * -80;

                  return (
                    <motion.div
                      key={venue.id}
                      className="absolute top-1/2 left-1/2 w-full max-w-sm glass-card overflow-hidden cursor-pointer hover:shadow-glow"
                      initial={{
                        rotate: 0,
                        translateX: 0,
                        translateY,
                        x: '-50%',
                        y: '-50%',
                        opacity: 0
                      }}
                      animate={{
                        rotate: rotation,
                        translateX,
                        translateY,
                        x: '-50%',
                        y: '-50%',
                        opacity: 1
                      }}
                      transition={{
                        duration: 0.5,
                        delay: index * 0.1,
                        type: "spring",
                        stiffness: 100
                      }}
                      style={{
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
