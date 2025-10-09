import { useEffect, useRef, useState } from "react";
import { 
  Sparkles, 
  Camera, 
  Music, 
  Calendar, 
  MapPin, 
  Phone, 
  Zap, 
  TrendingUp 
} from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "AI Bio Enhancement",
    description: "Transform bullet points into compelling artist bios with professional, casual, or edgy tones"
  },
  {
    icon: Camera,
    title: "Photo & Video Integration",
    description: "Upload press photos and performance videos optimized for web and print"
  },
  {
    icon: Music,
    title: "Streaming Integration",
    description: "Auto-embed Spotify, Apple Music, SoundCloud playlists and latest releases"
  },
  {
    icon: Calendar,
    title: "Tour Management",
    description: "Showcase past achievements and upcoming dates with direct ticket links"
  },
  {
    icon: MapPin,
    title: "Venue Discovery",
    description: "Browse venues by genre, city, and capacity to find your perfect match"
  },
  {
    icon: Phone,
    title: "Booking Contacts",
    description: "One-click communication with real venue booking agents via email or phone"
  },
  {
    icon: Zap,
    title: "AI-Powered Outreach",
    description: "Generate personalized venue pitch emails tailored to each venue's preferences"
  },
  {
    icon: TrendingUp,
    title: "Success Analytics",
    description: "Track application response rates, bookings secured, and career growth"
  }
];

const FeaturesSection = () => {
  const [visibleCards, setVisibleCards] = useState<number[]>([]);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          features.forEach((_, index) => {
            setTimeout(() => {
              setVisibleCards(prev => [...prev, index]);
            }, index * 50);
          });
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="relative py-24 px-6 bg-gradient-to-b from-background via-background/95 to-background overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 gradient-text">
          Everything You Need to Grow
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isVisible = visibleCards.includes(index);
            
            return (
              <div
                key={feature.title}
                className={`glass-card rounded-2xl p-6 group hover:-translate-y-2 hover:shadow-glow transition-all duration-500 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 backdrop-blur-sm border border-primary/20 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                
                <h3 className="text-lg font-semibold mb-2">
                  {feature.title}
                </h3>
                
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
