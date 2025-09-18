import { cn } from "@/lib/utils";

interface VinylSpinnerProps {
  size?: number;
  percentage?: number;
  className?: string;
  showPercentage?: boolean;
}

export function VinylSpinner({ 
  size = 40, 
  percentage = 0, 
  className,
  showPercentage = false 
}: VinylSpinnerProps) {
  const radius = (size - 4) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  return (
    <div className={cn("relative flex items-center justify-center", className)} style={{ width: size, height: size }}>
      {/* Vinyl Record */}
      <div 
        className="absolute animate-spin"
        style={{ width: size, height: size }}
      >
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Outer ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={size / 2 - 1}
            fill="hsl(var(--foreground))"
            stroke="hsl(var(--muted-foreground))"
            strokeWidth="2"
          />
          {/* Inner rings */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={size / 2 - 6}
            fill="transparent"
            stroke="hsl(var(--muted-foreground))"
            strokeWidth="0.5"
            opacity="0.3"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={size / 2 - 10}
            fill="transparent"
            stroke="hsl(var(--muted-foreground))"
            strokeWidth="0.5"
            opacity="0.3"
          />
          {/* Center hole */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={size / 8}
            fill="hsl(var(--background))"
            stroke="hsl(var(--muted-foreground))"
            strokeWidth="1"
          />
          {/* Center dot */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r="1"
            fill="hsl(var(--muted-foreground))"
          />
        </svg>
      </div>
      
      {/* Progress Ring */}
      {percentage > 0 && (
        <svg
          className="absolute transform -rotate-90"
          width={size}
          height={size}
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="hsl(var(--muted))"
            strokeWidth="2"
            fill="transparent"
            opacity="0.3"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-300 ease-out"
          />
        </svg>
      )}
      
      {/* Percentage Text */}
      {showPercentage && percentage > 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-medium text-foreground">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
    </div>
  );
}