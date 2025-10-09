import { motion } from "framer-motion";
import showcaseIcon from "@/assets/newicon.svg";

const MarqueeBanner = () => {
  const items = Array(12).fill(null);

  return (
    <section className="relative py-8 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 overflow-hidden border-y border-primary/10">
      <div className="flex">
        <motion.div
          className="flex items-center gap-8 whitespace-nowrap"
          animate={{
            x: [0, -1920]
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 25,
              ease: "linear"
            }
          }}
        >
          {items.map((_, index) => (
            <div key={index} className="flex items-center gap-8">
              <span className="text-2xl md:text-3xl font-bold gradient-text">
                shocase
              </span>
              <img 
                src={showcaseIcon} 
                alt="shocase icon" 
                className="h-8 w-8 opacity-80"
              />
            </div>
          ))}
        </motion.div>
        
        {/* Duplicate for seamless loop */}
        <motion.div
          className="flex items-center gap-8 whitespace-nowrap"
          animate={{
            x: [0, -1920]
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 25,
              ease: "linear"
            }
          }}
        >
          {items.map((_, index) => (
            <div key={`duplicate-${index}`} className="flex items-center gap-8">
              <span className="text-2xl md:text-3xl font-bold gradient-text">
                shocase
              </span>
              <img 
                src={showcaseIcon} 
                alt="shocase icon" 
                className="h-8 w-8 opacity-80"
              />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default MarqueeBanner;
