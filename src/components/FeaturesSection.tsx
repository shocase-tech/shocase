import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, Video, Music, FileText, Calendar, Users, Download, Globe, Sparkles, Zap, Shield, Palette } from "lucide-react";
const features = [{
  icon: Camera,
  title: "Photo Management",
  description: "Upload hero images and up to 7 press photos. Our system optimizes them for both web and print.",
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
  description: "Get a unique URL (artistname.myepk.app) with customizable themes and branding.",
  badge: "Hosting",
  color: "text-primary"
}, {
  icon: Download,
  title: "PDF Export",
  description: "One-click generation of print-ready press kits formatted for email attachments.",
  badge: "Export",
  color: "text-accent"
}];
const FeaturesSection = () => {
  return <section className="py-24 px-6 bg-gradient-to-b from-background to-secondary/20">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature, index) => <Card key={index} className="group hover:shadow-card transition-all duration-300 border-glass bg-gradient-card backdrop-blur-sm">
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
            </Card>)}
        </div>

        {/* Pricing Preview */}
        <div className="text-center">
          <div className="bg-gradient-card backdrop-blur-glass border border-glass rounded-2xl p-8 max-w-2xl mx-auto">
            <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-foreground mb-4">Simple, Transparent Pricing</h3>
            <div className="flex items-center justify-center gap-8 mb-6">
              <div className="text-center">
                <div className="text-lg font-semibold text-muted-foreground">Free Plan</div>
                <div className="text-sm text-muted-foreground/80">1 basic EPK with watermark</div>
              </div>
              <div className="h-12 w-px bg-border"></div>
              <div className="text-center">
                <div className="text-lg font-semibold text-primary">Pro Plan</div>
                <div className="text-sm text-muted-foreground/80">No Usage Limits, custom branding, 
artist database, and gig matching

              </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Start with our free EPK generator and upgrade when you're ready to take your music career to new heights</p>
          </div>
        </div>
      </div>
    </section>;
};
export default FeaturesSection;