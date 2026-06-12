import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import stageLightingBackground from "@/assets/stage-lighting-background.svg";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 md:pt-0 bg-black">
      {/* Stage Lighting Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60"
        style={{ backgroundImage: `url(${stageLightingBackground})` }}
      />

      {/* Subtle darkening for text legibility */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Gradient fade to background at bottom */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-background" />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-4xl mx-auto">
        <p className="eyebrow mb-6 animate-fade-up">
          For independent artists
        </p>

        <h1 className="text-5xl md:text-7xl font-bold text-white leading-[1.05] mb-6 animate-fade-up [animation-delay:100ms]">
          Press kits that
          <br />
          book shows.
        </h1>

        <p className="text-lg md:text-xl text-white/70 max-w-xl leading-relaxed mb-10 animate-fade-up [animation-delay:200ms]">
          Build a professional EPK, find the right venues, and send outreach
          that gets answered — all in one place.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 animate-fade-up [animation-delay:300ms]">
          <Button
            variant="pill-hero"
            size="lg"
            className="px-8 py-3 text-base"
            onClick={() => navigate("/auth")}
          >
            Create your EPK
          </Button>
          <Button
            variant="pill"
            size="lg"
            className="px-8 py-3 text-base"
            onClick={() => navigate("/venues")}
          >
            Browse venues
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
