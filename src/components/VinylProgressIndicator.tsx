import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface VinylProgressIndicatorProps {
  isLoading: boolean;
  size?: number;
  className?: string;
}

export const VinylProgressIndicator: React.FC<VinylProgressIndicatorProps> = ({
  isLoading,
  size = 48,
  className
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      setProgress(0);
      return;
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          return 100;
        }
        // Faster fill in the beginning, slower towards the end
        const increment = prev < 70 ? 3 : prev < 90 ? 1.5 : 0.5;
        return Math.min(prev + increment, 100);
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isLoading]);

  const circumference = 2 * Math.PI * (size / 2 - 6);
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <div 
        className={cn(
          "relative rounded-full border-4 border-foreground/20 bg-gradient-to-br from-background to-muted",
          isLoading && "animate-spin"
        )}
        style={{ 
          width: size, 
          height: size,
          animationDuration: isLoading ? "2s" : "0s"
        }}
      >
        {/* Vinyl record grooves */}
        <div className="absolute inset-2 rounded-full border border-foreground/10" />
        <div className="absolute inset-3 rounded-full border border-foreground/10" />
        <div className="absolute inset-4 rounded-full border border-foreground/10" />
        
        {/* Center hole */}
        <div 
          className="absolute bg-foreground/30 rounded-full" 
          style={{
            width: size * 0.2,
            height: size * 0.2,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        />

        {/* Progress fill overlay */}
        <svg
          className="absolute inset-0 transform -rotate-90"
          width={size}
          height={size}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={size / 2 - 6}
            stroke="hsl(var(--primary))"
            strokeWidth="4"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-300 ease-out opacity-80"
            style={{
              filter: 'drop-shadow(0 0 6px hsla(var(--primary), 0.4))'
            }}
          />
        </svg>
      </div>
    </div>
  );
};