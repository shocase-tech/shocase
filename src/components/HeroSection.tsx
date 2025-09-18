import { Button } from "@/components/ui/button";
import { Music, Sparkles, Phone, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import heroImage from "@/assets/hero-musician.jpg";
import showcaseLogo from "@/assets/shocase-logo-new.png";

const HeroSection = () => {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const iconRefs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-dark">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{
        backgroundImage: `url(${heroImage})`
      }}>
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/95"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/60"></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-48 h-48 bg-accent/20 rounded-full blur-2xl animate-pulse delay-1000"></div>

      {/* Main Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
        <div className="flex items-center justify-center mb-8">
          <Music className="w-16 h-16 text-primary mr-4" />
          <Sparkles className="w-12 h-12 text-accent animate-pulse" />
        </div>
        
        <img src={showcaseLogo} alt="SHOCASE Logo" className="h-32 md:h-40 mx-auto mb-6" />
        
        <p className="text-xl md:text-2xl text-muted-foreground mb-4 max-w-4xl mx-auto leading-relaxed">Professional artist materials in minutes, not hours</p>
        
        <div className="flex justify-center items-center mb-16">
          <Button variant="hero" size="lg" className="group" onClick={() => navigate("/auth")}>
            Create Your EPK
            <Sparkles className="w-5 h-5 ml-2 group-hover:animate-spin" />
          </Button>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          {[
            { icon: Globe, title: "Shareable Landing Pages", ref: iconRefs[0] },
            { icon: Phone, title: "One-Click Booking", ref: iconRefs[1] },
            { icon: Sparkles, title: "AI-Enhanced Bios", ref: iconRefs[2] }
          ].map((item, index) => {
            const iconRef = item.ref;
            const getIconTransform = () => {
              if (!iconRef.current) return 'translate(0, 0)';
              
              const rect = iconRef.current.getBoundingClientRect();
              const iconCenterX = rect.left + rect.width / 2;
              const iconCenterY = rect.top + rect.height / 2;
              
              const distance = Math.sqrt(
                Math.pow(mousePosition.x - iconCenterX, 2) + 
                Math.pow(mousePosition.y - iconCenterY, 2)
              );
              
              if (distance < 100) {
                const attraction = Math.max(0, 1 - distance / 100);
                const deltaX = (mousePosition.x - iconCenterX) * attraction * 0.3;
                const deltaY = (mousePosition.y - iconCenterY) * attraction * 0.3;
                return `translate(${deltaX}px, ${deltaY}px)`;
              }
              
              return 'translate(0, 0)';
            };

            return (
              <div key={index} className="text-center group">
                <div 
                  ref={iconRef}
                  className="w-16 h-16 bg-glass border border-glass rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-glow transition-all duration-200"
                  style={{
                    transform: getIconTransform(),
                  }}
                >
                  <item.icon className={`w-8 h-8 ${index === 1 ? 'text-accent' : 'text-primary'}`} />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{item.title}</h3>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;