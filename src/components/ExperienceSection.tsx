import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, Video, Music, Calendar, Users, Globe, Phone, Sparkles, Zap } from "lucide-react";
import { useOptimizedScrollExperience } from "@/hooks/useOptimizedScrollExperience";
import microphoneImage from "@/assets/microphone.png";

const features = [
  {
    icon: Camera,
    title: "Photo Management",
    description: "Upload background images and up to 7 press photos. Our system optimizes them for both web and print.",
    badge: "Visual",
    color: "text-primary"
  },
  {
    icon: Video,
    title: "Video Integration",
    description: "Embed up to 3 performance videos from YouTube, Vimeo, or direct uploads.",
    badge: "Media",
    color: "text-accent"
  },
  {
    icon: Sparkles,
    title: "AI Bio Enhancement",
    description: "Transform bullet points into compelling artist bios. Choose from professional, casual, or edgy tones.",
    badge: "AI Powered",
    color: "text-primary"
  },
  {
    icon: Music,
    title: "Streaming Links",
    description: "Connect Spotify, Apple Music, SoundCloud, and Bandcamp. Auto-embed playlists and latest releases.",
    badge: "Integration",
    color: "text-accent"
  },
  {
    icon: Calendar,
    title: "Tour Management",
    description: "Showcase past achievements and upcoming dates. Link directly to ticket sales.",
    badge: "Professional",
    color: "text-primary"
  },
  {
    icon: Users,
    title: "Press & Quotes",
    description: "Highlight media mentions, reviews, and testimonials that build credibility.",
    badge: "Social Proof",
    color: "text-accent"
  },
  {
    icon: Globe,
    title: "Custom Landing Pages",
    description: "Get a unique URL (shocase.xyz/artist) with customizable themes and branding.",
    badge: "Hosting",
    color: "text-primary"
  },
  {
    icon: Phone,
    title: "Booking Contacts",
    description: "One-click communication with booking agents via email or phone.",
    badge: "Professional",
    color: "text-accent"
  }
];

const NewExperienceSection = () => {
  const { 
    scrollProgress, 
    currentPhase,
    isLocked, 
    elementRef, 
    getActionsAnimation,
    getMessageAnimation,
    getFeatureAnimation,
    getHeaderFadeAnimation
  } = useOptimizedScrollExperience();

  const actionsAnim = getActionsAnimation();
  const messageAnim = getMessageAnimation();
  const headerAnim = getHeaderFadeAnimation();

  return (
    <section 
      ref={elementRef}
      className="relative min-h-screen bg-gradient-dark"
    >
      {/* Ambient floating elements for visual continuity */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-24 h-24 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 right-1/3 w-20 h-20 bg-primary/3 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '4s' }} />
        
        {/* Subtle gradient overlays */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/2 via-transparent to-accent/2 opacity-50" />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tl from-muted/5 via-transparent to-transparent" />
      </div>

      {/* Scroll Progress Indicator */}
      {isLocked && (
        <div className="fixed top-4 right-4 z-50 bg-primary/10 backdrop-blur-sm rounded-full px-3 py-1 text-sm text-primary border border-primary/20">
          {Math.round(scrollProgress * 100)}%
        </div>
      )}

      {/* Single sticky container with phase switching */}
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* PHASE 1: Actions Section */}
        {currentPhase === 0 && (
          <div className="absolute inset-0 flex items-center">
            {/* Microphone - Better sized, bottom-right positioned with bottom cropped */}
            <div 
              className="absolute -bottom-10 -right-20 pointer-events-none transition-opacity duration-300 overflow-hidden"
              style={{
                opacity: actionsAnim.microphoneOpacity,
                transform: 'rotate(10deg) scale(1.2)',
                width: '600px',
                height: '800px',
              }}
            >
              <img 
                src={microphoneImage} 
                alt="Professional microphone"
                className="w-full h-auto object-cover opacity-70"
                draggable={false}
              />
            </div>

            {/* Action Text - Can overlap with microphone image */}
            <div className="absolute left-8 md:left-16 lg:left-24 top-1/2 -translate-y-1/2 z-10">
              <div className="space-y-12">
                <div 
                  className="transform transition-all duration-300"
                  style={{
                    opacity: actionsAnim.elevateOpacity,
                    transform: `translateY(${(1 - actionsAnim.elevateOpacity) * 20}px)`,
                  }}
                >
                  <h2 className="text-8xl lg:text-9xl xl:text-[10rem] font-bold bg-gradient-primary bg-clip-text text-transparent">
                    elevate
                  </h2>
                </div>

                <div 
                  className="transform transition-all duration-300"
                  style={{
                    opacity: actionsAnim.bookShowsOpacity,
                    transform: `translateY(${(1 - actionsAnim.bookShowsOpacity) * 20}px)`,
                  }}
                >
                  <h2 className="text-8xl lg:text-9xl xl:text-[10rem] font-bold bg-gradient-primary bg-clip-text text-transparent">
                    book shows
                  </h2>
                </div>

                <div 
                  className="transform transition-all duration-300"
                  style={{
                    opacity: actionsAnim.buildBrandOpacity,
                    transform: `translateY(${(1 - actionsAnim.buildBrandOpacity) * 20}px)`,
                  }}
                >
                  <h2 className="text-8xl lg:text-9xl xl:text-[10rem] font-bold bg-gradient-primary bg-clip-text text-transparent">
                    build your brand
                  </h2>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PHASE 2: Message Section */}
        {currentPhase === 1 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div 
              className="text-center transition-all duration-500 ease-out"
              style={{
                transform: `translateX(${messageAnim.horizontalPosition}%)`,
                opacity: messageAnim.opacity,
              }}
            >
              {/* Desktop: Single line */}
              <h2 className="hidden md:block text-7xl lg:text-8xl xl:text-9xl font-bold bg-gradient-primary bg-clip-text text-transparent whitespace-nowrap">
                shocase your music
              </h2>
              
              {/* Mobile: Stacked */}
              <div className="block md:hidden text-6xl sm:text-7xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                <div>shocase</div>
                <div>your</div>
                <div>music</div>
              </div>
            </div>
          </div>
        )}

        {/* PHASE 3: Features Grid Section */}
        {currentPhase === 2 && (
          <div className="absolute inset-0 py-24 px-6">
            <div className="max-w-7xl mx-auto h-full flex flex-col justify-center">
              <div 
                className="text-center mb-16 transition-all duration-500"
                style={{
                  opacity: headerAnim.opacity,
                  transform: `translateY(${headerAnim.transform}px)`,
                }}
              >
                <div className="flex items-center justify-center">
                  <Zap className="w-10 h-10 text-primary mr-4" />
                  <h2 className="text-6xl md:text-7xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                    Everything You Need
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {features.map((feature, index) => {
                  const cardAnim = getFeatureAnimation(index);
                  
                  return (
                    <Card 
                      key={index}
                      className="group hover:shadow-card transition-all duration-300 border-glass bg-gradient-card backdrop-blur-sm"
                      style={{
                        opacity: cardAnim.opacity,
                        transform: `translateY(-${cardAnim.transform}px)`, // Move UP not down
                      }}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-12 h-12 rounded-xl bg-glass border border-glass flex items-center justify-center group-hover:shadow-glow transition-all duration-300">
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
          </div>
        )}
      </div>
    </section>
  );
};

export default NewExperienceSection;