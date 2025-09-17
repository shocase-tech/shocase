import { Button } from "@/components/ui/button";
import { Music, Sparkles, Download, Globe, Play, Pause, Volume2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useScrollPosition } from "@/hooks/useScrollPosition";
import heroImage from "@/assets/hero-musician.jpg";
import showcaseLogo from "@/assets/shocase-logo-new.png";

const HeroSection = () => {
  const navigate = useNavigate();
  const { scrollY } = useScrollPosition();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [cursorVariant, setCursorVariant] = useState('default');
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseEnter = () => setCursorVariant('hover');
    const handleMouseLeave = () => setCursorVariant('default');

    document.addEventListener('mousemove', handleMouseMove);
    
    // Add cursor effects to buttons
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
      button.addEventListener('mouseenter', handleMouseEnter);
      button.addEventListener('mouseleave', handleMouseLeave);
    });

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      buttons.forEach(button => {
        button.removeEventListener('mouseenter', handleMouseEnter);
        button.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, []);

  return (
    <>
      {/* Custom Cursor */}
      <div 
        className={`fixed w-8 h-8 pointer-events-none z-50 transition-all duration-200 ${
          cursorVariant === 'hover' ? 'scale-150 bg-primary/30' : 'scale-100 bg-accent/20'
        } rounded-full blur-sm`}
        style={{
          left: mousePosition.x - 16,
          top: mousePosition.y - 16,
          transform: `translate(${scrollY * 0.02}px, ${scrollY * 0.01}px)`
        }}
      />
      
      <section 
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-dark"
      >
        {/* Parallax Background Layers */}
        <div className="absolute inset-0">
          {/* Layer 1 - Deepest background */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40"
            style={{
              backgroundImage: `url(${heroImage})`,
              transform: `translateY(${scrollY * 0.5}px) scale(1.1)`
            }}
          />
          
          {/* Layer 2 - Studio equipment silhouettes */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              transform: `translateY(${scrollY * 0.3}px)`,
              background: `radial-gradient(circle at 20% 80%, hsl(var(--primary) / 0.1) 0%, transparent 50%),
                          radial-gradient(circle at 80% 20%, hsl(var(--accent) / 0.1) 0%, transparent 50%),
                          radial-gradient(circle at 40% 40%, hsl(var(--primary) / 0.05) 0%, transparent 50%)`
            }}
          />
          
          {/* Layer 3 - Moving particles */}
          <div className="absolute inset-0">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-primary/30 rounded-full animate-pulse"
                style={{
                  left: `${10 + (i * 7)}%`,
                  top: `${20 + (i * 5)}%`,
                  animationDelay: `${i * 0.5}s`,
                  transform: `translateY(${scrollY * (0.1 + i * 0.02)}px)`
                }}
              />
            ))}
          </div>
          
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-background/98 via-background/85 to-background/98" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/70" />
        </div>

        {/* 3D Floating Vinyl Records */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-spin"
              style={{
                left: `${15 + i * 20}%`,
                top: `${10 + i * 15}%`,
                animationDuration: `${8 + i * 2}s`,
                animationDirection: i % 2 === 0 ? 'normal' : 'reverse',
                transform: `
                  perspective(1000px) 
                  rotateX(${45 + i * 10}deg) 
                  rotateY(${scrollY * 0.1}deg)
                  translateZ(${i * 50}px)
                `
              }}
            >
              <div className={`w-${12 + i * 4} h-${12 + i * 4} rounded-full bg-gradient-to-br from-background/10 to-background/30 border border-primary/20 backdrop-blur-sm`}>
                <div className="w-full h-full rounded-full border-4 border-primary/10 flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-primary/30" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content with Scroll Animations */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          {/* Animated Music Icons */}
          <div 
            className="flex items-center justify-center mb-8"
            style={{
              transform: `translateY(${Math.max(0, scrollY * 0.2)}px) scale(${Math.max(0.8, 1 - scrollY * 0.0005)})`
            }}
          >
            <Music className="w-16 h-16 text-primary mr-4 animate-pulse" />
            <div className="relative">
              <Sparkles className="w-12 h-12 text-accent animate-spin" style={{ animationDuration: '3s' }} />
              <div className="absolute inset-0 w-12 h-12 bg-accent/20 rounded-full animate-ping" />
            </div>
          </div>
          
          {/* SHOCASE Logo with Neon Glow */}
          <div 
            className="relative mb-8"
            style={{
              transform: `translateY(${Math.max(0, scrollY * 0.15)}px)`
            }}
          >
            <div className="absolute inset-0 blur-2xl">
              <img 
                src={showcaseLogo} 
                alt="SHOCASE Logo Glow" 
                className="h-32 md:h-40 mx-auto opacity-30 animate-pulse"
                style={{ filter: 'hue-rotate(180deg) saturate(200%)' }}
              />
            </div>
            <img 
              src={showcaseLogo} 
              alt="SHOCASE Logo" 
              className="relative h-32 md:h-40 mx-auto drop-shadow-2xl"
              style={{
                filter: `drop-shadow(0 0 20px hsl(var(--primary) / 0.5)) drop-shadow(0 0 40px hsl(var(--accent) / 0.3))`,
                animation: 'pulse 4s infinite'
              }}
            />
          </div>
          
          <p 
            className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-4xl mx-auto leading-relaxed"
            style={{
              transform: `translateY(${Math.max(0, scrollY * 0.1)}px)`,
              opacity: Math.max(0.3, 1 - scrollY * 0.001)
            }}
          >
            Create professional Electronic Press Kits in minutes, not hours
          </p>

          {/* Interactive EPK Mockups */}
          <div 
            className="flex flex-wrap justify-center gap-4 mb-12"
            style={{
              transform: `translateY(${Math.max(0, scrollY * 0.05)}px)`
            }}
          >
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="group relative"
                style={{
                  transform: `perspective(1000px) rotateY(${-15 + i * 15}deg) rotateX(5deg)`,
                  transition: 'all 0.6s cubic-bezier(0.23, 1, 0.320, 1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = `
                    perspective(1000px) 
                    rotateY(${-10 + i * 10}deg) 
                    rotateX(-5deg) 
                    translateZ(20px) 
                    scale(1.05)
                  `;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = `
                    perspective(1000px) 
                    rotateY(${-15 + i * 15}deg) 
                    rotateX(5deg) 
                    translateZ(0px) 
                    scale(1)
                  `;
                }}
              >
                <div className="w-32 h-48 bg-gradient-card backdrop-blur-glass border border-glass rounded-lg overflow-hidden shadow-2xl">
                  <div className="p-3 space-y-2">
                    <div className="h-3 bg-primary/30 rounded w-full" />
                    <div className="h-2 bg-muted/50 rounded w-3/4" />
                    <div className="h-2 bg-muted/30 rounded w-1/2" />
                    <div className="h-16 bg-accent/20 rounded mt-3" />
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
              </div>
            ))}
          </div>

          {/* CTA Buttons with Enhanced Effects */}
          <div 
            className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
            style={{
              transform: `translateY(${Math.max(0, scrollY * 0.03)}px)`
            }}
          >
            <Button 
              variant="hero" 
              size="lg" 
              className="group relative overflow-hidden"
              onClick={() => navigate("/auth")}
              onMouseEnter={() => setCursorVariant('button')}
              onMouseLeave={() => setCursorVariant('default')}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
              <span className="relative z-10">Get Started Free</span>
              <Sparkles className="w-5 h-5 ml-2 group-hover:animate-spin relative z-10" />
            </Button>
            
            <Button 
              variant="glass" 
              size="lg" 
              className="group relative overflow-hidden"
              onMouseEnter={() => setCursorVariant('button')}
              onMouseLeave={() => setCursorVariant('default')}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-accent/20 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Globe className="w-5 h-5 mr-2 relative z-10" />
              <span className="relative z-10">View Sample EPK</span>
            </Button>
          </div>

          {/* Enhanced Feature Highlights with Build Animation */}
          <div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16"
            style={{
              transform: `translateY(${Math.min(100, Math.max(0, scrollY * 0.02))}px)`,
              opacity: Math.max(0, Math.min(1, (scrollY - 200) / 300))
            }}
          >
            {[
              { icon: Globe, title: "Shareable Landing Pages", desc: "Custom URLs for instant sharing with promoters and press", color: "primary" },
              { icon: Download, title: "PDF Downloads", desc: "Professional formatted press kits ready for email attachments", color: "accent" },
              { icon: Sparkles, title: "AI-Enhanced Bios", desc: "Let AI help you polish and perfect your artist biography", color: "primary" }
            ].map(({ icon: Icon, title, desc, color }, i) => (
              <div 
                key={i}
                className="text-center group"
                style={{
                  transform: `translateY(${Math.max(0, (scrollY - 400 - i * 100) * 0.1)}px)`,
                  opacity: Math.max(0, Math.min(1, (scrollY - 300 - i * 100) / 200))
                }}
              >
                <div className={`w-16 h-16 bg-glass border border-glass rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-${color} transition-all duration-500 group-hover:scale-110 group-hover:rotate-6`}>
                  <Icon className={`w-8 h-8 text-${color} group-hover:animate-pulse`} />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
                  {title}
                </h3>
                <p className="text-muted-foreground group-hover:text-muted-foreground/80 transition-colors duration-300">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Audio-Visual Elements */}
        <div className="absolute bottom-10 left-10 flex items-center space-x-4 opacity-60">
          <div className="flex items-center space-x-2">
            <Volume2 className="w-5 h-5 text-primary animate-pulse" />
            <div className="flex space-x-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`w-1 bg-primary/60 rounded-full animate-pulse`}
                  style={{
                    height: `${8 + Math.sin(Date.now() * 0.01 + i) * 8}px`,
                    animationDelay: `${i * 0.1}s`
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HeroSection;