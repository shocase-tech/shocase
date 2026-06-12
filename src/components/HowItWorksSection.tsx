import { motion } from "framer-motion";
import { FileText, Search, Calendar } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: FileText,
    title: "Build your EPK",
    description: "Create a professional press kit with AI-powered bio writing, photos, videos, and streaming links"
  },
  {
    number: "02",
    icon: Search,
    title: "Discover venues",
    description: "Browse 100+ venues filtered by genre, city, and capacity that match your sound"
  },
  {
    number: "03",
    icon: Calendar,
    title: "Book shows",
    description: "Send AI-crafted outreach emails to verified booking contacts and track your applications"
  }
];

const HowItWorksSection = () => {
  return (
    <section className="relative py-24 px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="mb-14"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="eyebrow mb-4">How it works</p>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground max-w-xl">
            From press kit to booked show
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.08,
                  ease: [0.22, 1, 0.36, 1]
                }}
                className="surface-card p-8 transition-colors duration-300 hover:border-white/[0.14]"
              >
                <div className="flex items-center justify-between mb-8">
                  <span className="font-display text-sm font-semibold text-muted-foreground tracking-widest">
                    {step.number}
                  </span>
                  <Icon className="w-5 h-5 text-primary" />
                </div>

                <h3 className="text-xl font-semibold mb-3 text-foreground">
                  {step.title}
                </h3>

                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
