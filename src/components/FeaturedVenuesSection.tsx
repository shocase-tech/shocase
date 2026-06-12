import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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

  useEffect(() => {
    const fetchVenues = async () => {
      const { data } = await supabase
        .from('venues')
        .select('id, name, slug, city, hero_image_url, logo_url, capacity')
        .eq('featured', true)
        .eq('is_active', true)
        .limit(3);

      if (data) setVenues(data);
      setLoading(false);
    };

    fetchVenues();
  }, []);

  return (
    <section className="relative py-24 px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          className="mb-14"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="eyebrow mb-4">Venue directory</p>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground max-w-xl">
              Stages waiting to hear from you
            </h2>
            <Button
              variant="pill"
              size="lg"
              onClick={() => navigate('/venues')}
              className="group shrink-0 px-6"
            >
              Explore all venues
              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </motion.div>

        {/* Venue Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-80 w-full rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {venues.map((venue, index) => (
              <motion.div
                key={venue.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.08,
                  ease: [0.22, 1, 0.36, 1]
                }}
                className="group cursor-pointer"
                onClick={() => navigate(`/venues/${venue.slug}`)}
              >
                <div className="relative h-80 rounded-xl overflow-hidden border border-white/[0.06] transition-colors duration-300 group-hover:border-white/[0.14]">
                  {/* Image */}
                  <div className="absolute inset-0">
                    {venue.hero_image_url || venue.logo_url ? (
                      <img
                        src={venue.hero_image_url || venue.logo_url || ''}
                        alt={venue.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-secondary" />
                    )}
                  </div>

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                  {/* Content */}
                  <div className="absolute inset-0 p-6 flex flex-col justify-end">
                    <h3 className="text-2xl font-bold mb-1 text-white">
                      {venue.name}
                    </h3>
                    <p className="text-sm text-white/60 mb-2">
                      {venue.city}
                    </p>
                    {venue.capacity && (
                      <div className="flex items-center gap-2 text-sm text-white/60">
                        <Users className="w-4 h-4" />
                        <span>Capacity: {venue.capacity}</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedVenuesSection;
