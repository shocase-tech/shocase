import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative py-32 px-6 bg-background overflow-hidden">
      {/* Single quiet background accent */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[640px] h-[640px] bg-primary/[0.07] rounded-full blur-3xl pointer-events-none" />

      <motion.div
        className="max-w-3xl mx-auto text-center relative z-10"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <h2 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">
          Ready to get booked?
        </h2>

        <p className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed max-w-xl mx-auto">
          Build your press kit free. Upgrade when you're ready to start
          applying to venues.
        </p>

        <Button
          variant="pill-hero"
          size="lg"
          className="group px-8 py-3 text-base"
          onClick={() => navigate("/auth")}
        >
          Create your EPK
          <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </motion.div>
    </section>
  );
};

export default CTASection;
