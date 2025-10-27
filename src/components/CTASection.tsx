import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef } from "react";

const CTASection = () => {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const y = useTransform(smoothProgress, [0, 1], [100, -100]);
  const opacity = useTransform(smoothProgress, [0, 0.2, 0.8, 1], [0.5, 1, 1, 0.5]);
  const scale = useTransform(smoothProgress, [0, 0.2, 0.8, 1], [0.95, 1, 1, 0.95]);

  return (
    <section 
      ref={sectionRef}
      className="relative pt-44 pb-24 md:pt-24 px-6 bg-gradient-to-b from-background via-background/95 to-background overflow-hidden"
    >
      {/* Animated background gradient blobs */}
      <motion.div 
        className="absolute top-1/2 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
        style={{ y }}
      />
      <motion.div 
        className="absolute top-1/2 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl"
        style={{ y: useTransform(y, (value) => -value) }}
      />

      <motion.div 
        className="max-w-4xl mx-auto text-center relative z-10"
        style={{ opacity, scale }}
      >
        {/* Icon accent */}
        <motion.div 
          className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/20 mb-8"
          animate={{ 
            rotate: [0, 5, -5, 0],
            scale: [1, 1.05, 1]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Sparkles className="w-8 h-8 text-primary" />
        </motion.div>

        <motion.h2 
          className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 gradient-text"
          style={{ y: useTransform(smoothProgress, [0, 1], [30, -30]) }}
        >
          Ready to Create Your Press Kit?
        </motion.h2>
        
        <motion.p 
          className="text-lg md:text-xl text-muted-foreground mb-12 leading-relaxed max-w-2xl mx-auto"
          style={{ y: useTransform(smoothProgress, [0, 1], [20, -20]) }}
        >
          Join thousands of artists who've already created professional press kits with our platform. 
          Start with our free plan and upgrade when you're ready.
        </motion.p>
        
        <motion.div 
          className="flex justify-center"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button 
            variant="pill-hero" 
            size="lg" 
            className="group px-8 py-3 text-lg"
            onClick={() => navigate("/auth")}
          >
            Start Building Now
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default CTASection;