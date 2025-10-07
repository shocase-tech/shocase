import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User, Users, Music, CheckCircle, ArrowRight, Sparkles } from "lucide-react";
import GenreInput from "./GenreInput";
import { cn } from "@/lib/utils";

interface OnboardingWizardProps {
  user: any;
  onComplete: (profile: any) => void;
  userEmail?: string;
  userPhone?: string;
  userLocation?: string;
}

const STEPS = [
  { id: 1, title: "Artist Name", subtitle: "What should we call you?" },
  { id: 2, title: "Performance Type", subtitle: "How do you perform?" },
  { id: 3, title: "Your Sound", subtitle: "What genres define your music?" },
];

export default function OnboardingWizard({ user, onComplete, userEmail, userPhone, userLocation }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [artistName, setArtistName] = useState("");
  const [performanceType, setPerformanceType] = useState<"Solo" | "Duo" | "Full Band" | "">("");
  const [genres, setGenres] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [slideDirection, setSlideDirection] = useState<"left" | "right">("right");
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const artistNameRef = useRef<HTMLInputElement>(null);

  // Auto-focus artist name input
  useEffect(() => {
    if (currentStep === 1 && artistNameRef.current) {
      artistNameRef.current.focus();
    }
  }, [currentStep]);

  const performanceOptions = [
    {
      type: "Solo" as const,
      icon: User,
      title: "Solo Artist"
    },
    {
      type: "Duo" as const,
      icon: Users,
      title: "Duo"
    },
    {
      type: "Full Band" as const,
      icon: Music,
      title: "Full Band"
    }
  ];

  const saveProgress = async (stepData: any) => {
    try {
      const currentData = {
        user_id: user.id,
        artist_name: artistName,
        performance_type: performanceType,
        genre: JSON.stringify(genres),
        contact_info: {
          email: userEmail,
          phone: userPhone
        },
        ...stepData
      };

      const { data: existingProfile } = await supabase
        .from("artist_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existingProfile) {
        await supabase
          .from("artist_profiles")
          .update(currentData)
          .eq("user_id", user.id);
      } else {
        await supabase
          .from("artist_profiles")
          .insert([currentData]);
      }
    } catch (error) {
      console.error("Failed to save progress:", error);
    }
  };

  const handleNext = async () => {
    if (currentStep === 1 && !artistName.trim()) {
      toast({
        title: "Artist name required",
        description: "Please enter your artist name to continue",
        variant: "destructive"
      });
      return;
    }

    if (currentStep === 2 && !performanceType) {
      toast({
        title: "Performance type required",
        description: "Please select how you perform",
        variant: "destructive"
      });
      return;
    }

    // Save current step data
    await saveProgress({
      artist_name: artistName,
      performance_type: performanceType,
      genre: JSON.stringify(genres)
    });

    if (currentStep < STEPS.length) {
      setSlideDirection("right");
      setCurrentStep(currentStep + 1);
    } else {
      await handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setSlideDirection("left");
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    navigate("/epk");
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      // Final save with all data including location from signup
      const finalData = {
        user_id: user.id,
        artist_name: artistName || "New Artist",
        performance_type: performanceType || "Solo",
        genre: JSON.stringify(genres),
        location: userLocation || "",
        contact_info: {
          email: userEmail,
          phone: userPhone
        }
      };

      const { data: existingProfile } = await supabase
        .from("artist_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      let profileData;
      if (existingProfile) {
        const { data } = await supabase
          .from("artist_profiles")
          .update(finalData)
          .eq("user_id", user.id)
          .select()
          .single();
        profileData = data;
      } else {
        const { data } = await supabase
          .from("artist_profiles")
          .insert([finalData])
          .select()
          .single();
        profileData = data;
      }

      // Show success animation
      setShowSuccess(true);

      // Wait for animation, then complete
      setTimeout(() => {
        onComplete(profileData);
      }, 2000);

    } catch (error: any) {
      toast({
        title: "Setup failed",
        description: error.message || "Failed to complete setup. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const progress = (currentStep / STEPS.length) * 100;

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-4">
        <Card className="glass-card border-white/20 max-w-md w-full">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="relative mb-6">
              <div className="w-20 h-20 mx-auto bg-gradient-primary rounded-full flex items-center justify-center animate-pulse">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <div className="absolute inset-0 w-20 h-20 mx-auto bg-gradient-primary rounded-full animate-ping opacity-25"></div>
            </div>
            <h1 className="text-2xl font-bold mb-2 gradient-text">Welcome to Shocase!</h1>
            <p className="text-muted-foreground">Your artist profile is ready to build. Let's create something amazing!</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Skip Button */}
        <div className="flex justify-end mb-4">
          <Button 
            variant="ghost" 
            onClick={handleSkip}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip to Dashboard →
          </Button>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Step {currentStep} of {STEPS.length}</span>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        <Card className="glass-card border-white/20 overflow-hidden">
          <CardContent className="p-0">
            <div className="relative h-96">
              {/* Step 1: Artist Name */}
              <div className={cn(
                "absolute inset-0 p-8 flex flex-col items-center justify-center transition-all duration-500 ease-in-out",
                currentStep === 1 
                  ? "translate-x-0 opacity-100" 
                  : slideDirection === "right" 
                    ? "-translate-x-full opacity-0" 
                    : "translate-x-full opacity-0"
              )}>
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mb-6">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold mb-2 text-center">{STEPS[0].title}</h2>
                <p className="text-muted-foreground text-center mb-8">{STEPS[0].subtitle}</p>
                <div className="w-full max-w-sm">
                  <Input
                    ref={artistNameRef}
                    value={artistName}
                    onChange={(e) => setArtistName(e.target.value)}
                    placeholder="Enter your artist name"
                    className="text-center text-lg h-12"
                    onKeyDown={(e) => e.key === "Enter" && handleNext()}
                  />
                </div>
              </div>

              {/* Step 2: Performance Type */}
              <div className={cn(
                "absolute inset-0 p-4 md:p-8 flex flex-col items-center justify-center transition-all duration-500 ease-in-out overflow-y-auto",
                currentStep === 2 
                  ? "translate-x-0 opacity-100" 
                  : currentStep < 2 
                    ? "translate-x-full opacity-0" 
                    : "-translate-x-full opacity-0"
              )}>
                <div className="flex flex-col items-center w-full max-w-2xl">
                  <h2 className="text-3xl font-bold mb-2 text-center">{STEPS[1].title}</h2>
                  <p className="text-muted-foreground text-center mb-8">{STEPS[1].subtitle}</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                    {performanceOptions.map((option) => {
                      const Icon = option.icon;
                      return (
                        <Button
                          key={option.type}
                          variant={performanceType === option.type ? "default" : "outline"}
                          className={cn(
                            "h-auto p-8 flex flex-col items-center gap-4 transition-all duration-200",
                            performanceType === option.type 
                              ? "bg-gradient-primary border-primary/50 shadow-glow" 
                              : "hover:border-primary/30"
                          )}
                          onClick={() => setPerformanceType(option.type)}
                        >
                          <Icon className="w-12 h-12" />
                          <div className="text-lg font-semibold">{option.title}</div>
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Step 3: Genres */}
              <div className={cn(
                "absolute inset-0 p-8 flex flex-col items-center justify-center transition-all duration-500 ease-in-out",
                currentStep === 3 
                  ? "translate-x-0 opacity-100" 
                  : "translate-x-full opacity-0"
              )}>
                <div className="w-16 h-16 bg-gradient-accent rounded-full flex items-center justify-center mb-6">
                  <Music className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold mb-2 text-center">{STEPS[2].title}</h2>
                <p className="text-muted-foreground text-center mb-8">{STEPS[2].subtitle}</p>
                <div className="w-full max-w-md">
                  <GenreInput
                    genres={genres}
                    onChange={(newGenres) => setGenres(newGenres.slice(0, 5))}
                    placeholder="Type genre and press Enter"
                    maxGenres={5}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <Button 
            variant="outline" 
            onClick={handleBack}
            disabled={currentStep === 1}
            className={cn(
              "transition-all duration-200",
              currentStep === 1 ? "opacity-50" : "hover:border-primary/50"
            )}
          >
            Back
          </Button>
          
          <Button 
            onClick={handleNext}
            disabled={isLoading}
            className="bg-gradient-primary hover:shadow-glow transition-all duration-200 px-6"
          >
            {isLoading ? (
              "Setting up..."
            ) : currentStep === STEPS.length ? (
              <>Complete Setup <Sparkles className="w-4 h-4 ml-2" /></>
            ) : (
              <>Next <ArrowRight className="w-4 h-4 ml-2" /></>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}