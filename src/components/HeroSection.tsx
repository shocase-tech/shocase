import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import newLogo from "@/assets/newlogo.svg";
import stageLightingBackground from "@/assets/stage-lighting-background.svg";

const HeroSection = () => {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [logoTransform, setLogoTransform] = useState("translate(0px, 0px)");

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleLogoMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = (e.clientX - centerX) * 0.03;
    const deltaY = (e.clientY - centerY) * 0.03;
    
    setLogoTransform(`translate(${deltaX}px, ${deltaY}px)`);
  };

  const handleLogoMouseLeave = () => {
    setLogoTransform("translate(0px, 0px)");
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 md:pt-0" style={{ backgroundColor: '#000000' }}>
      {/* Stage Lighting Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${stageLightingBackground})`,
          opacity: 0.8
        }}
      />
      
      {/* Gradient fade to background at bottom */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-background" />

      {/* Main Content - Centered */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 space-y-8">
        {/* Logo with hover effect */}
        <div
          className="cursor-pointer transition-transform duration-700 ease-out"
          style={{
            transform: logoTransform,
          }}
          onMouseMove={handleLogoMouseMove}
          onMouseLeave={handleLogoMouseLeave}
        >
          <img 
            src={newLogo} 
            alt="SHOCASE Logo" 
            className="w-full max-w-[644px] h-auto"
            style={{ maxHeight: '155px' }}
          />
        </div>
        
        {/* Subheader */}
        <p className="text-xl md:text-2xl text-gray-300 max-w-2xl leading-relaxed">
          Professional artist materials in minutes, not hours
        </p>
        
        {/* CTA Button */}
        <Button 
          variant="pill-hero" 
          size="lg" 
          className="px-8 py-3 text-lg"
          onClick={() => navigate("/auth")}
        >
          Create Your EPK
        </Button>
      </div>
    </section>
  );
};

export default HeroSection;