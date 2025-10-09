import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
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

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const y = useTransform(smoothProgress, [0, 1], [100, -100]);
  const opacity = useTransform(smoothProgress, [0, 0.2, 0.8, 1], [0.5, 1, 1, 0.5]);
  const scale = useTransform(smoothProgress, [0, 0.2, 0.8, 1], [0.95, 1, 1, 0.95]);

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
      {/* Animated background gradient blobs */}
      <motion.div 
        className="absolute top-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl"
        style={{ y }}
      />
      <motion.div 
        className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"
        style={{ y: useTransform(y, (value) => -value) }}
      />

      <motion.div 
        className="max-w-7xl mx-auto"
        style={{ opacity, scale }}
      >
        <motion.h2 
          className="text-4xl md:text-5xl font-bold text-center mb-16 gradient-text"
          style={{ y: useTransform(smoothProgress, [0, 1], [30, -30]) }}
        >
          Everything You Need to Grow
        </motion.h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isVisible = visibleCards.includes(index);
            
            // Create unique parallax effect for each card based on its position
            const cardY = useTransform(
              smoothProgress, 
              [0, 0.5, 1], 
              [50 + (index % 4) * 10, 0, -50 - (index % 4) * 10]
            );
            
            return (
              <motion.div
                key={feature.title}
                style={{ y: cardY }}
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
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
};

export default FeaturesSection;
