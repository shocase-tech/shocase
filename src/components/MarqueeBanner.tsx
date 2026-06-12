import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const MarqueeBanner = () => {
  const [venueNames, setVenueNames] = useState<string[]>([]);

  useEffect(() => {
    const fetchVenues = async () => {
      const { data } = await supabase
        .from('venues')
        .select('name')
        .eq('is_active', true)
        .limit(14);

      if (data && data.length > 0) {
        setVenueNames(data.map((v) => v.name));
      }
    };

    fetchVenues();
  }, []);

  if (venueNames.length === 0) return null;

  const row = venueNames.map((name, i) => (
    <span key={i} className="flex items-center gap-10 shrink-0">
      <span className="font-display text-lg md:text-xl font-medium text-white/40 whitespace-nowrap">
        {name}
      </span>
      <span className="w-1 h-1 rounded-full bg-white/20 shrink-0" />
    </span>
  ));

  return (
    <section className="relative py-10 overflow-hidden border-y border-white/[0.06] bg-background">
      <p className="eyebrow text-center mb-6">Featuring venues across New York</p>
      <div
        className="flex w-max gap-10 animate-marquee"
        style={{ animationDuration: `${venueNames.length * 4}s` }}
      >
        {row}
        {/* duplicate for seamless loop */}
        {venueNames.map((name, i) => (
          <span key={`dup-${i}`} className="flex items-center gap-10 shrink-0">
            <span className="font-display text-lg md:text-xl font-medium text-white/40 whitespace-nowrap">
              {name}
            </span>
            <span className="w-1 h-1 rounded-full bg-white/20 shrink-0" />
          </span>
        ))}
      </div>
    </section>
  );
};

export default MarqueeBanner;
