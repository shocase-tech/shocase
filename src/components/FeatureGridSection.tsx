import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, Video, Music, Calendar, Users, Globe, Phone, Sparkles, Zap } from "lucide-react";
import { useScrollGrid } from "@/hooks/useScrollGrid";

const features = [{
  icon: Camera,
  title: "Photo Management",
  description: "Upload background images and up to 7 press photos. Our system optimizes them for both web and print.",
  badge: "Visual",
  color: "text-primary"
}, {
  icon: Video,
  title: "Video Integration",
  description: "Embed up to 3 performance videos from YouTube, Vimeo, or direct uploads.",
  badge: "Media",
  color: "text-accent"
}, {
  icon: Sparkles,
  title: "AI Bio Enhancement",
  description: "Transform bullet points into compelling artist bios. Choose from professional, casual, or edgy tones.",
  badge: "AI Powered",
  color: "text-primary"
}, {
  icon: Music,
  title: "Streaming Links",
  description: "Connect Spotify, Apple Music, SoundCloud, and Bandcamp. Auto-embed playlists and latest releases.",
  badge: "Integration",
  color: "text-accent"
}, {
  icon: Calendar,
  title: "Tour Management",
  description: "Showcase past achievements and upcoming dates. Link directly to ticket sales.",
  badge: "Professional",
  color: "text-primary"
}, {
  icon: Users,
  title: "Press & Quotes",
  description: "Highlight media mentions, reviews, and testimonials that build credibility.",
  badge: "Social Proof",
  color: "text-accent"
}, {
  icon: Globe,
  title: "Custom Landing Pages",
  description: "Get a unique URL (shocase.xyz/artist) with customizable themes and branding.",
  badge: "Hosting",
  color: "text-primary"
}, {
  icon: Phone,
  title: "Booking Contacts",
  description: "One-click communication with booking agents via email or phone.",
  badge: "Professional",
  color: "text-accent"
}];

const FeatureGridSection = () => {
  const { elementRef, isLocked, getCardProgress } = useScrollGrid({ totalCards: 8 });

  return (
    <section 
      ref={elementRef}
      className="py-24 px-6 bg-gradient-to-b from-background to-secondary/20 min-h-screen"
    >
      {/* Scroll Lock Indicator */}
      {isLocked && (
        <div className="fixed top-4 right-4 z-50 bg-primary/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm text-primary border border-primary/30">
          Scroll to reveal features
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <Zap className="w-8 h-8 text-primary mr-3" />
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Everything You Need
            </h2>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Professional press kit tools designed specifically for musicians, bands, and music industry professionals
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const cardProgress = getCardProgress(index);
            const opacity = cardProgress;
            const translateY = (1 - cardProgress) * 50; // Slide up from 50px below

            return (
              <Card 
                key={index} 
                className="group hover:shadow-card transition-all duration-300 border-glass bg-gradient-card backdrop-blur-sm"
                style={{
                  opacity,
                  transform: `translateY(${translateY}px)`,
                  transition: isLocked ? 'none' : 'opacity 0.3s ease-out, transform 0.3s ease-out',
                }}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-glass border border-glass flex items-center justify-center group-hover:shadow-glow transition-all duration-300`}>
                      <feature.icon className={`w-6 h-6 ${feature.color}`} />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {feature.badge}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeatureGridSection;