import { motion } from "framer-motion";
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
  return (
    <section className="relative py-24 px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="mb-14"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="eyebrow mb-4">Features</p>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground max-w-xl">
            Everything you need to grow
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  duration: 0.5,
                  delay: (index % 4) * 0.06,
                  ease: [0.22, 1, 0.36, 1]
                }}
                className="surface-card p-6 transition-colors duration-300 hover:border-white/[0.14]"
              >
                <Icon className="w-5 h-5 text-primary mb-4" />

                <h3 className="text-base font-semibold mb-2 text-foreground">
                  {feature.title}
                </h3>

                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
