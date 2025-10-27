import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    description: "Get Started",
    features: [
      "Create EPK",
      "Share landing page",
      "Basic analytics",
      "Browse venues"
    ],
    buttonText: "Start Free",
    buttonVariant: "outline" as const,
    popular: false
  },
  {
    name: "Pro",
    price: "$9.99",
    period: "/month",
    description: "For Growing Artists",
    features: [
      "Everything in Free",
      "AI email generation (10/month)",
      "Outreach tracking",
      "Priority support"
    ],
    buttonText: "Start Pro Trial",
    buttonVariant: "default" as const,
    popular: true
  },
  {
    name: "Elite",
    price: "$29.99",
    period: "/month",
    description: "For Serious Artists",
    features: [
      "Everything in Pro",
      "Unlimited AI emails",
      "Advanced analytics",
      "Featured on venue discovery",
      "Direct venue contacts"
    ],
    buttonText: "Go Elite",
    buttonVariant: "outline" as const,
    popular: false
  }
];

const PricingSection = () => {
  const navigate = useNavigate();
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
      id="pricing-section"
      ref={sectionRef}
      className="relative py-24 px-6 bg-gradient-to-b from-background via-background/95 to-background overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 gradient-text">
          Choose Your Plan
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tiers.map((tier, index) => (
            <div
              key={tier.name}
              className={`glass-card rounded-2xl p-8 relative group hover:-translate-y-2 hover:shadow-glow transition-all duration-500 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{
                transitionDelay: isVisible ? `${index * 150}ms` : '0ms'
              }}
            >
              {tier.popular && (
                <div className="absolute -top-4 right-4 bg-gradient-to-r from-primary to-accent text-primary-foreground text-xs font-bold px-4 py-1 rounded-full shadow-glow">
                  Most Popular
                </div>
              )}
              
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{tier.description}</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold">{tier.price}</span>
                  <span className="text-muted-foreground">{tier.period}</span>
                </div>
              </div>
              
              <ul className="space-y-3 mb-8">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button 
                variant={tier.name === "Pro" ? "default" : "text-arrow"}
                className="w-full"
                size="lg"
                onClick={() => navigate('/auth')}
              >
                {tier.buttonText}
                {tier.name !== "Pro" && <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
