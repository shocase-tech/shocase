import { useEffect, useRef, useState } from "react";
import { FileText, Search, Calendar } from "lucide-react";

const steps = [
  {
    number: "1",
    icon: FileText,
    title: "Build Your EPK",
    description: "Create a professional press kit with AI-powered bio writing, photos, videos, and streaming links"
  },
  {
    number: "2",
    icon: Search,
    title: "Discover Venues",
    description: "Browse 100+ venues filtered by genre, city, and capacity that match your sound"
  },
  {
    number: "3",
    icon: Calendar,
    title: "Book Shows",
    description: "Send AI-crafted outreach emails to verified booking contacts and track your applications to land more gigs"
  }
];

const HowItWorksSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="relative py-24 px-6 bg-gradient-to-b from-background via-background/95 to-background overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 gradient-text">
          How It Works
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className={`glass-card p-8 relative group transition-all duration-500 hover:-translate-y-2 hover:shadow-glow ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{
                  transitionDelay: isVisible ? `${index * 150}ms` : '0ms'
                }}
              >
                <div className="absolute -top-6 left-8 w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl font-bold text-primary-foreground shadow-glow">
                  {step.number}
                </div>
                
                <div className="mt-8 mb-4 w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto">
                  <Icon className="w-8 h-8 text-primary" />
                </div>
                
                <h3 className="text-2xl font-semibold text-center mb-4">
                  {step.title}
                </h3>
                
                <p className="text-muted-foreground text-center">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
