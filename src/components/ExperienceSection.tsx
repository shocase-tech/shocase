import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Camera, Video, Music, Calendar, Users, Globe, Phone, Sparkles, Zap, ArrowRight } from "lucide-react";
import { useOptimizedScrollExperience } from "@/hooks/useOptimizedScrollExperience";
import { useNavigate } from "react-router-dom";
import microphoneImage from "@/assets/microphone.png";
import showcaseLogo from "@/assets/shocase-logo-new.png";

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
  const navigate = useNavigate();
  const { 
    scrollProgress, 
    currentPhase,
    isLocked, 
    elementRef, 
    getActionsAnimation,
    getMessageAnimation,
    getFeatureAnimation,
    getHeaderFadeAnimation,
    getCTAAnimation
  } = useOptimizedScrollExperience();

  const actionsAnim = getActionsAnimation();
  const messageAnim = getMessageAnimation();
  const headerAnim = getHeaderFadeAnimation();
  const ctaAnim = getCTAAnimation();

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

      {/* Progress Indicators */}
      {isLocked && (
        <>
          {/* Existing percentage indicator */}
          <div className="fixed top-4 right-4 z-50 bg-primary/10 backdrop-blur-sm rounded-full px-3 py-1 text-sm text-primary border border-primary/20">
            {Math.round(scrollProgress * 100)}%
          </div>

          {/* Vertical Progress Bar - Right Edge */}
          <div className="fixed top-0 right-0 z-40 w-1 bg-gradient-to-b from-primary/20 to-primary/10">
            <div 
              className="w-full bg-primary transition-all duration-150 ease-out shadow-[0_0_8px_2px] shadow-primary/30"
              style={{ height: `${scrollProgress * 100}%` }}
            />
          </div>

          {/* Vinyl Record Progress Indicator */}
          <div className="fixed top-6 right-16 z-50">
            <div 
              className="w-12 h-12 rounded-full border-2 border-muted-foreground/30 transition-all duration-150 ease-out"
              style={{
                background: `conic-gradient(from 0deg, hsl(var(--primary)) 0deg, hsl(var(--primary)) ${scrollProgress * 360}deg, transparent ${scrollProgress * 360}deg, transparent 360deg)`,
                boxShadow: scrollProgress > 0 ? '0 0 12px 2px hsl(var(--primary) / 0.3)' : 'none'
              }}
            >
              {/* Inner circle for vinyl record appearance */}
              <div className="absolute inset-2 rounded-full bg-background/80 border border-muted-foreground/20">
                <div className="absolute inset-1/2 w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-muted-foreground/40" />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Single sticky container with phase switching */}
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* PHASE 0: Actions Section */}
        {currentPhase === 0 && (
          <div className="absolute inset-0 flex items-center">
            {/* Microphone - Better sized, bottom-right positioned with bottom cropped */}
            <div 
              className="absolute -bottom-10 -right-20 pointer-events-none transition-all duration-300 overflow-hidden"
              style={{
                opacity: actionsAnim.microphoneOpacity,
                transform: `rotate(10deg) scale(1.2) translateY(${actionsAnim.microphoneTransform || 0}px)`,
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
            <div 
              className="absolute left-8 md:left-16 lg:left-24 top-1/2 -translate-y-1/2 z-10 transition-transform duration-300 ease-out"
              style={{
                transform: `translateY(-50%) translateY(${actionsAnim.textTransform || 0}px)`,
              }}
            >
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

        {/* PHASE 1: Message Section */}
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

        {/* PHASE 2: Features Grid Section */}
        {currentPhase === 2 && (
          <div className="absolute inset-0 py-24 px-6">
            <div className="max-w-7xl mx-auto h-full flex flex-col justify-center">
              <div 
                className="text-center mb-16 transition-all duration-300 ease-out"
                style={{
                  opacity: headerAnim.opacity,
                  transform: `translateY(${headerAnim.transform + (headerAnim.panUpTransform || 0)}px)`,
                }}
              >
                <div className="flex items-center justify-center">
                  <Zap className="w-10 h-10 text-primary mr-4" />
                  <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                    Everything You Need
                  </h2>
                </div>
              </div>

              {/* Desktop Grid: 4x2 */}
              <div className="hidden md:grid grid-cols-4 gap-8">
                {features.map((feature, index) => {
                  const cardAnim = getFeatureAnimation(index);
                  
                  return (
                    <Card 
                      key={index}
                      className="group hover:shadow-card transition-all duration-300 border-glass bg-gradient-card backdrop-blur-sm"
                      style={{
                        opacity: cardAnim.opacity,
                        transform: `translateY(-${cardAnim.transform + (cardAnim.panUpTransform || 0)}px)`,
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

              {/* Mobile Grid: 2x4 - Compact version */}
              <div className="md:hidden grid grid-cols-2 gap-4">
                {features.map((feature, index) => {
                  const cardAnim = getFeatureAnimation(index);
                  
                  return (
                    <Card 
                      key={index}
                      className="group hover:shadow-card transition-all duration-300 border-glass bg-gradient-card backdrop-blur-sm"
                      style={{
                        opacity: cardAnim.opacity,
                        transform: `translateY(-${cardAnim.transform + (cardAnim.panUpTransform || 0)}px)`,
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="w-10 h-10 rounded-xl bg-glass border border-glass flex items-center justify-center group-hover:shadow-glow transition-all duration-300">
                            <feature.icon className={`w-5 h-5 ${feature.color}`} />
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {feature.badge}
                          </Badge>
                        </div>
                        <h3 className="text-sm font-semibold text-foreground">
                          {feature.title}
                        </h3>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* PHASE 3: CTA/Footer Section */}
        {currentPhase === 3 && (
          <div className="absolute inset-0 flex flex-col justify-center">
            {/* CTA Section */}
            <div 
              className="flex-1 flex items-center justify-center px-6"
              style={{
                opacity: ctaAnim.opacity,
                transform: `translateY(${ctaAnim.transform}px)`,
              }}
            >
              <div className="max-w-2xl mx-auto text-center">
                <Card className="bg-gradient-card backdrop-blur-glass border border-glass">
                  <CardContent className="p-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                      Ready to Create Your Press Kit?
                    </h2>
                    <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                      Join thousands of artists who've already created professional press kits with our platform. 
                      Start with our free plan and upgrade when you're ready.
                    </p>
                    
                    <div className="flex justify-center">
                      <Button 
                        variant="hero" 
                        size="lg" 
                        className="group"
                        onClick={() => navigate("/auth")}
                      >
                        Start Building Now
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Footer Section */}
            <div 
              className="border-t border-glass bg-background/50 backdrop-blur-sm"
              style={{
                opacity: ctaAnim.opacity,
                transform: `translateY(${ctaAnim.transform}px)`,
              }}
            >
              <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  {/* Left - Logo */}
                  <div className="flex items-center">
                    <img 
                      src={showcaseLogo} 
                      alt="Shocase" 
                      className="h-8 w-auto opacity-80"
                    />
                  </div>

                  {/* Center - Copyright */}
                  <div className="text-center">
                    <p className="text-muted-foreground text-sm">
                      © 2025 Shocase. All rights reserved.
                    </p>
                  </div>

                  {/* Right - Contact */}
                  <div className="text-center md:text-right">
                    <a 
                      href="mailto:shocase.artists@gmail.com"
                      className="text-foreground text-sm font-medium hover:text-primary transition-colors duration-200"
                    >
                      Contact
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default NewExperienceSection;