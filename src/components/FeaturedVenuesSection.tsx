import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Users, ArrowRight } from "lucide-react";
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
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const y = useTransform(smoothProgress, [0, 1], [100, -100]);
  const opacity = useTransform(smoothProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const scale = useTransform(smoothProgress, [0, 0.2, 0.8, 1], [0.8, 1, 1, 0.8]);

  useEffect(() => {
    const fetchVenues = async () => {
      const { data } = await supabase
        .from('venues')
        .select('id, name, slug, city, hero_image_url, logo_url, capacity')
        .eq('featured', true)
        .eq('is_active', true)
        .limit(4);

      if (data) setVenues(data);
      setLoading(false);
    };

    fetchVenues();
  }, []);


  return (
    <section 
      ref={containerRef}
      className="relative min-h-screen py-32 px-6 bg-gradient-to-b from-background via-background/95 to-background overflow-hidden"
    >
      {/* Animated background gradient blobs */}
      <motion.div 
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"
        style={{ y }}
      />
      <motion.div 
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl"
        style={{ y: useTransform(y, (value) => -value) }}
      />

      <motion.div 
        className="max-w-7xl mx-auto"
        style={{ opacity, scale }}
      >
        {/* Header Text with parallax */}
        <motion.div 
          className="text-center mb-20"
          style={{ y: useTransform(smoothProgress, [0, 1], [50, -50]) }}
        >
          <motion.h2 
            className="text-5xl md:text-7xl lg:text-8xl font-bold gradient-text mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            shocase<br />your music
          </motion.h2>
          <motion.p
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Featured venues waiting to hear from you
          </motion.p>
        </motion.div>

        {/* Venue Cards - Horizontal Scroll Effect */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-80 w-full rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-16">
            {venues.map((venue, index) => (
              <motion.div
                key={venue.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ 
                  duration: 0.5, 
                  delay: index * 0.1,
                  ease: [0.22, 1, 0.36, 1]
                }}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
                className="group"
              >
                <motion.div
                  className="relative h-80 rounded-2xl overflow-hidden glass-card"
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  {/* Image */}
                  <div className="absolute inset-0">
                    {venue.hero_image_url || venue.logo_url ? (
                      <img 
                        src={venue.hero_image_url || venue.logo_url || ''} 
                        alt={venue.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20" />
                    )}
                  </div>

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent opacity-90 group-hover:opacity-95 transition-opacity duration-300" />

                  {/* Hover glow effect */}
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    initial={false}
                    animate={{
                      opacity: hoveredCard === index ? 1 : 0
                    }}
                  />

                  {/* Content */}
                  <div className="absolute inset-0 p-6 flex flex-col justify-end">
                    <motion.div
                      initial={false}
                      animate={{
                        y: hoveredCard === index ? -8 : 0
                      }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <h3 className="text-2xl font-bold mb-2 text-foreground">
                        {venue.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {venue.city}
                      </p>
                      {venue.capacity && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="w-4 h-4" />
                          <span>Capacity: {venue.capacity}</span>
                        </div>
                      )}
                    </motion.div>
                  </div>

                  {/* Border glow on hover */}
                  <div className="absolute inset-0 border-2 border-primary/0 group-hover:border-primary/20 rounded-2xl transition-colors duration-300" />
                </motion.div>
              </motion.div>
            ))}
          </div>
        )}

        {/* CTA Button with animation */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Button 
            variant="pill-hero"
            size="lg" 
            onClick={() => navigate('/venues')}
            className="group px-8 py-6 text-base"
          >
            Explore All Venues
            <motion.span
              className="inline-block ml-2"
              initial={{ x: 0 }}
              whileHover={{ x: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <ArrowRight className="w-5 h-5" />
            </motion.span>
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default FeaturedVenuesSection;
