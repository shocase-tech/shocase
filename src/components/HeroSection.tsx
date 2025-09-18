import { Button } from "@/components/ui/button";
import { Music, Sparkles, Phone, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-musician.jpg";
import showcaseLogo from "@/assets/shocase-logo-new.png";
import { useState, useEffect } from "react";

const HeroSection = () => {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hoveredIcon, setHoveredIcon] = useState<number | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-dark">
      {/* Background Image with Darker Overlay */}
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{
        backgroundImage: `url(${heroImage})`
      }}>
        <div className="absolute inset-0 bg-gradient-to-r from-background/98 via-background/95 to-background/98"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background/80"></div>
      </div>

      {/* Floating Vinyl Records */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Vinyl Record 1 */}
        <div 
          className="absolute w-24 h-24 opacity-5 animate-spin"
          style={{
            top: '20%',
            left: '10%',
            transform: `translate(${mousePosition.x * 0.01}px, ${mousePosition.y * 0.01}px)`,
            animationDuration: '20s',
            background: 'radial-gradient(circle, transparent 30%, hsl(var(--primary)) 31%, hsl(var(--primary)) 32%, transparent 33%)',
            borderRadius: '50%'
          }}
        >
          <div className="w-full h-full rounded-full border-2 border-primary/20 relative">
            <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-primary/40 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
          </div>
        </div>

        {/* Vinyl Record 2 */}
        <div 
          className="absolute w-32 h-32 opacity-3 animate-spin"
          style={{
            top: '60%',
            right: '15%',
            transform: `translate(${mousePosition.x * -0.015}px, ${mousePosition.y * -0.015}px)`,
            animationDuration: '25s',
            animationDirection: 'reverse',
            background: 'radial-gradient(circle, transparent 30%, hsl(var(--accent)) 31%, hsl(var(--accent)) 32%, transparent 33%)',
            borderRadius: '50%'
          }}
        >
          <div className="w-full h-full rounded-full border-2 border-accent/20 relative">
            <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-accent/40 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
          </div>
        </div>

        {/* Vinyl Record 3 */}
        <div 
          className="absolute w-20 h-20 opacity-4 animate-spin"
          style={{
            top: '40%',
            right: '5%',
            transform: `translate(${mousePosition.x * 0.008}px, ${mousePosition.y * 0.008}px)`,
            animationDuration: '30s',
            background: 'radial-gradient(circle, transparent 30%, hsl(var(--primary)) 31%, hsl(var(--primary)) 32%, transparent 33%)',
            borderRadius: '50%'
          }}
        >
          <div className="w-full h-full rounded-full border border-primary/20 relative">
            <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-primary/40 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
          </div>
        </div>

        {/* Floating musical notes */}
        <div className="absolute top-1/4 left-1/4 text-primary/10 animate-pulse text-2xl" style={{ animationDelay: '1s' }}>♪</div>
        <div className="absolute top-3/4 right-1/3 text-accent/10 animate-pulse text-3xl" style={{ animationDelay: '3s' }}>♫</div>
        <div className="absolute top-1/2 left-1/6 text-primary/10 animate-pulse text-xl" style={{ animationDelay: '2s' }}>♪</div>
      </div>

      {/* Interactive floating orbs */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-primary/20 rounded-full blur-xl animate-pulse transition-all duration-500 hover:scale-110 hover:bg-primary/30 cursor-pointer"></div>
      <div className="absolute bottom-20 right-20 w-48 h-48 bg-accent/20 rounded-full blur-2xl animate-pulse delay-1000 transition-all duration-500 hover:scale-110 hover:bg-accent/30 cursor-pointer"></div>

      {/* Main Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
        <div className="flex items-center justify-center mb-8 group">
          <Music className="w-16 h-16 text-primary mr-4 transition-all duration-300 group-hover:animate-bounce" />
          <Sparkles className="w-12 h-12 text-accent animate-pulse transition-all duration-300 group-hover:rotate-180" />
        </div>
        
        <img 
          src={showcaseLogo} 
          alt="SHOCASE Logo" 
          className="h-32 md:h-40 mx-auto mb-6 transition-all duration-300 hover:scale-105 cursor-pointer" 
          onClick={() => {
            // Easter egg: spin the logo
            const logo = document.querySelector('img[alt="SHOCASE Logo"]') as HTMLElement;
            if (logo) {
              logo.style.transition = 'transform 0.5s ease-in-out';
              logo.style.transform = 'rotate(360deg) scale(1.1)';
              setTimeout(() => {
                logo.style.transform = 'scale(1)';
              }, 500);
            }
          }}
        />
        
        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-4xl mx-auto leading-relaxed">Create professional Electronic Press Kits in minutes, not hours</p>
        
        {/* Centered Button */}
        <div className="flex justify-center items-center mb-16">
          <Button variant="hero" size="lg" className="group relative overflow-hidden" onClick={() => navigate("/auth")}>
            <span className="relative z-10">Get Started Free</span>
            <Sparkles className="w-5 h-5 ml-2 group-hover:animate-spin relative z-10" />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </Button>
        </div>

        {/* Feature Highlights - Headers Only */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div 
            className="text-center group cursor-pointer"
            onMouseEnter={() => setHoveredIcon(0)}
            onMouseLeave={() => setHoveredIcon(null)}
          >
            <div className={`w-16 h-16 bg-glass border border-glass rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all duration-300 ${hoveredIcon === 0 ? 'shadow-glow scale-110 rotate-12' : 'group-hover:shadow-glow group-hover:scale-105'}`}>
              <Globe className="w-8 h-8 text-primary transition-all duration-300 group-hover:animate-pulse" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">Shareable Landing Pages</h3>
          </div>

          <div 
            className="text-center group cursor-pointer"
            onMouseEnter={() => setHoveredIcon(1)}
            onMouseLeave={() => setHoveredIcon(null)}
          >
            <div className={`w-16 h-16 bg-glass border border-glass rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all duration-300 ${hoveredIcon === 1 ? 'shadow-accent scale-110 rotate-12' : 'group-hover:shadow-accent group-hover:scale-105'}`}>
              <Phone className="w-8 h-8 text-accent transition-all duration-300 group-hover:animate-bounce" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">One-Click Booking</h3>
          </div>

          <div 
            className="text-center group cursor-pointer"
            onMouseEnter={() => setHoveredIcon(2)}
            onMouseLeave={() => setHoveredIcon(null)}
          >
            <div className={`w-16 h-16 bg-glass border border-glass rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all duration-300 ${hoveredIcon === 2 ? 'shadow-glow scale-110 rotate-12' : 'group-hover:shadow-glow group-hover:scale-105'}`}>
              <Sparkles className="w-8 h-8 text-primary transition-all duration-300 group-hover:animate-spin" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">AI-Enhanced Bios</h3>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;