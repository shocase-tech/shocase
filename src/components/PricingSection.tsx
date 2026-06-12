import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    description: "Get started",
    features: [
      "Create EPK",
      "Share landing page",
      "Basic analytics",
      "Browse venues"
    ],
    buttonText: "Start free",
    popular: false
  },
  {
    name: "Pro",
    price: "$9.99",
    period: "/month",
    description: "For growing artists",
    features: [
      "Everything in Free",
      "AI email generation (10/month)",
      "Outreach tracking",
      "Priority support"
    ],
    buttonText: "Start Pro trial",
    popular: true
  },
  {
    name: "Elite",
    price: "$29.99",
    period: "/month",
    description: "For serious artists",
    features: [
      "Everything in Pro",
      "Unlimited AI emails",
      "Advanced analytics",
      "Featured on venue discovery",
      "Direct venue contacts"
    ],
    buttonText: "Go Elite",
    popular: false
  }
];

const PricingSection = () => {
  const navigate = useNavigate();

  return (
    <section
      id="pricing-section"
      className="relative py-24 px-6 bg-background"
    >
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="mb-14 text-center"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="eyebrow mb-4">Pricing</p>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">
            Start free. Upgrade to get booked.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 0.5,
                delay: index * 0.08,
                ease: [0.22, 1, 0.36, 1]
              }}
              className={`relative flex flex-col rounded-xl p-8 bg-card border ${
                tier.popular
                  ? "border-primary/60"
                  : "border-white/[0.06]"
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                  Most popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-1">{tier.name}</h3>
                <p className="text-sm text-muted-foreground mb-5">{tier.description}</p>
                <div className="flex items-baseline gap-1">
                  <span className="font-display text-4xl font-bold">{tier.price}</span>
                  <span className="text-sm text-muted-foreground">{tier.period}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground/90">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant={tier.popular ? "default" : "secondary"}
                className="w-full"
                size="lg"
                onClick={() => navigate('/auth')}
              >
                {tier.buttonText}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
