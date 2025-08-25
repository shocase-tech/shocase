import { Button } from "@/components/ui/button";
import { Music, Sparkles, Download, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-musician.jpg";

const HeroSection = () => {
  const navigate = useNavigate();
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-dark">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
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
        
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
          AI Press Kit Generator
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground mb-4 max-w-4xl mx-auto leading-relaxed">
          Create professional Electronic Press Kits in minutes, not hours
        </p>
        
        <p className="text-lg text-muted-foreground/80 mb-12 max-w-2xl mx-auto">
          Upload photos, add your bio, streaming links, and tour dates. 
          Our AI helps you craft the perfect press kit with both shareable landing pages and downloadable PDFs.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
          <Button variant="hero" size="lg" className="group" onClick={() => navigate("/auth")}>
            Get Started Free
            <Sparkles className="w-5 h-5 ml-2 group-hover:animate-spin" />
          </Button>
          
          <Button variant="glass" size="lg" className="group">
            <Globe className="w-5 h-5 mr-2" />
            View Sample EPK
          </Button>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="text-center group">
            <div className="w-16 h-16 bg-glass border border-glass rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-glow transition-all duration-300">
              <Globe className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Shareable Landing Pages</h3>
            <p className="text-muted-foreground">Custom URLs for instant sharing with promoters and press</p>
          </div>

          <div className="text-center group">
            <div className="w-16 h-16 bg-glass border border-glass rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-accent transition-all duration-300">
              <Download className="w-8 h-8 text-accent" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">PDF Downloads</h3>
            <p className="text-muted-foreground">Professional formatted press kits ready for email attachments</p>
          </div>

          <div className="text-center group">
            <div className="w-16 h-16 bg-glass border border-glass rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-glow transition-all duration-300">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">AI-Enhanced Bios</h3>
            <p className="text-muted-foreground">Let AI help you polish and perfect your artist biography</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;