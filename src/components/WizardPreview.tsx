import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Camera, 
  FileText, 
  Music, 
  Calendar, 
  Users, 
  Settings,
  CheckCircle2,
  ArrowRight,
  Sparkles
} from "lucide-react";

const wizardSteps = [
  {
    icon: Camera,
    title: "Photos & Media",
    description: "Upload hero image and press photos",
    status: "completed" as const,
    color: "text-primary"
  },
  {
    icon: FileText,
    title: "Artist Bio",
    description: "AI-enhanced biography creation",
    status: "current" as const,
    color: "text-accent"
  },
  {
    icon: Music,
    title: "Streaming & Audio",
    description: "Connect platforms and playlists",
    status: "upcoming" as const,
    color: "text-muted-foreground"
  },
  {
    icon: Calendar,
    title: "Tour Dates",
    description: "Past shows and upcoming dates",
    status: "upcoming" as const,
    color: "text-muted-foreground"
  },
  {
    icon: Users,
    title: "Press & Quotes",
    description: "Media mentions and testimonials",
    status: "upcoming" as const,
    color: "text-muted-foreground"
  },
  {
    icon: Settings,
    title: "Customize & Publish",
    description: "Theme selection and final review",
    status: "upcoming" as const,
    color: "text-muted-foreground"
  }
];

const WizardPreview = () => {
  return (
    <section className="py-24 px-6 bg-gradient-to-b from-secondary/20 to-background">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
            Simple Step-by-Step Process
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Our guided wizard makes creating professional press kits effortless. 
            Complete each step at your own pace with AI assistance throughout.
          </p>
        </div>

        {/* Step Progress */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {wizardSteps.map((step, index) => (
            <Card 
              key={index} 
              className={`group transition-all duration-300 border-glass bg-gradient-card backdrop-blur-sm
                ${step.status === 'current' ? 'ring-2 ring-primary/50 shadow-glow' : ''}
                ${step.status === 'completed' ? 'border-primary/30' : ''}
              `}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-glass border border-glass flex items-center justify-center 
                    ${step.status === 'current' ? 'shadow-glow' : ''}`}>
                    {step.status === 'completed' ? (
                      <CheckCircle2 className="w-6 h-6 text-primary" />
                    ) : (
                      <step.icon className={`w-6 h-6 ${step.color}`} />
                    )}
                  </div>
                  <Badge 
                    variant={step.status === 'current' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    Step {index + 1}
                  </Badge>
                </div>
                
                <h3 className={`text-lg font-semibold mb-2 
                  ${step.status === 'current' ? 'text-primary' : 'text-foreground'}`}>
                  {step.title}
                </h3>
                
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {step.description}
                </p>

                {step.status === 'current' && (
                  <div className="flex items-center text-primary text-sm font-medium">
                    <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                    AI Assistance Available
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Demo Action */}
        <div className="text-center">
          <Card className="bg-gradient-card backdrop-blur-glass border border-glass max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Ready to Create Your Press Kit?
              </h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Join thousands of artists who've already created professional press kits with our platform. 
                Start with our free plan and upgrade when you're ready.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button variant="hero" size="lg" className="group">
                  Start Building Now
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button variant="glass" size="lg">
                  Watch Demo Video
                </Button>
              </div>

              <div className="mt-6 p-4 bg-glass border border-glass rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Note:</strong> Authentication, file storage, and payment features require{" "}
                  <strong className="text-primary">Supabase integration</strong>.{" "}
                  Click the green Supabase button to connect your backend.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default WizardPreview;