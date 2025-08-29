import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 px-6 bg-gradient-to-b from-secondary/20 to-background">
      <div className="max-w-6xl mx-auto">
        <div className="text-center">
          <Card className="bg-gradient-card backdrop-blur-glass border border-glass max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Ready to Create Your Press Kit?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Join thousands of artists who've already created professional press kits with our platform. 
                Start with our free plan and upgrade when you're ready.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button 
                  variant="hero" 
                  size="lg" 
                  className="group"
                  onClick={() => navigate("/auth")}
                >
                  Start Building Now
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button variant="glass" size="lg">
                  Watch Demo Video
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default CTASection;