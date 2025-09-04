import { useState, useEffect, useRef } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { CheckCircle, Circle, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

type FloatingPosition = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'bottom-center';
type ScreenSize = 'mobile' | 'tablet' | 'desktop';

interface FloatingProgressIndicatorProps {
  completionPercentage: number;
  milestones: Array<{ label: string; completed: boolean }>;
  isVisible: boolean;
  profile?: any;
  onTogglePublish?: () => void;
}

export default function FloatingProgressIndicator({ 
  completionPercentage, 
  milestones, 
  isVisible,
  profile,
  onTogglePublish
}: FloatingProgressIndicatorProps) {
  const [position, setPosition] = useState<FloatingPosition>('bottom-right');
  const [screenSize, setScreenSize] = useState<ScreenSize>('desktop');
  const positionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMobile = useIsMobile();
  const incompleteMilestones = milestones.filter(m => !m.completed).slice(0, 2);
  const completedCount = milestones.filter(m => m.completed).length;

  // Detect screen size
  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setScreenSize('mobile');
      } else if (width < 1024) {
        setScreenSize('tablet');
      } else {
        setScreenSize('desktop');
      }
    };

    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  // Smart collision detection for editing interfaces
  const getOptimalPosition = (): FloatingPosition => {
    // Mobile: Always use bottom-center banner
    if (screenSize === 'mobile') {
      return 'bottom-center';
    }

    // Check for actual obstructions
    const isBottomRightBlocked = () => {
      const bottomRightArea = {
        left: window.innerWidth - 320,
        top: window.innerHeight - 200,
        right: window.innerWidth - 24,
        bottom: window.innerHeight - 24
      };

      const obstructions = document.querySelectorAll(
        '[data-editor-active="true"], .inline-editor-active, .gallery-editor-active, .mentions-editor-active, .shows-editor-active, [role="dialog"]:not([data-state="closed"]), .sheet-content'
      );

      for (const obstruction of obstructions) {
        const rect = obstruction.getBoundingClientRect();
        if (rect.right > bottomRightArea.left && 
            rect.bottom > bottomRightArea.top &&
            rect.left < bottomRightArea.right &&
            rect.top < bottomRightArea.bottom) {
          return true;
        }
      }
      return false;
    };

    const isBottomLeftBlocked = () => {
      const bottomLeftArea = {
        left: 24,
        top: window.innerHeight - 200,
        right: 344,
        bottom: window.innerHeight - 24
      };

      const obstructions = document.querySelectorAll(
        '[data-editor-active="true"], .inline-editor-active, .gallery-editor-active, .mentions-editor-active, .shows-editor-active, [role="dialog"]:not([data-state="closed"]), .sheet-content'
      );

      for (const obstruction of obstructions) {
        const rect = obstruction.getBoundingClientRect();
        if (rect.right > bottomLeftArea.left && 
            rect.bottom > bottomLeftArea.top &&
            rect.left < bottomLeftArea.right &&
            rect.top < bottomLeftArea.bottom) {
          return true;
        }
      }
      return false;
    };

    // For tablets, prefer bottom-center if space is limited
    if (screenSize === 'tablet' && window.innerWidth < 900) {
      return 'bottom-center';
    }

    // Optimal position priority: bottom-right > bottom-left > top-right > top-left
    if (!isBottomRightBlocked()) return 'bottom-right';
    if (!isBottomLeftBlocked()) return 'bottom-left';
    return 'top-right'; // Fallback to top-right
  };

  // Dynamic positioning logic
  useEffect(() => {
    if (!isVisible) return;

    const updatePosition = () => {
      const newPosition = getOptimalPosition();
      setPosition(newPosition);
    };

    updatePosition();
    
    // Re-evaluate position on resize with debouncing
    const handleResize = () => {
      if (positionTimeoutRef.current) {
        clearTimeout(positionTimeoutRef.current);
      }
      positionTimeoutRef.current = setTimeout(updatePosition, 150);
    };

    // Monitor for DOM changes that might affect positioning
    const observer = new MutationObserver(() => {
      if (positionTimeoutRef.current) {
        clearTimeout(positionTimeoutRef.current);
      }
      positionTimeoutRef.current = setTimeout(updatePosition, 100);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'data-editor-active', 'role', 'data-state']
    });

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
      if (positionTimeoutRef.current) {
        clearTimeout(positionTimeoutRef.current);
      }
    };
  }, [isVisible, screenSize]);

  // SVG Progress Ring Component
  const ProgressRing = ({ size, strokeWidth, percentage }: { size: number; strokeWidth: number; percentage: number }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;
    
    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          className="transform -rotate-90"
          width={size}
          height={size}
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-muted/20"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="text-primary transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold text-primary">{percentage}%</span>
        </div>
      </div>
    );
  };

  const getPositionClasses = () => {
    const baseClasses = "fixed z-50 transition-all duration-300 ease-in-out";
    
    if (position === 'bottom-center') {
      return `${baseClasses} bottom-4 left-1/2 transform -translate-x-1/2`;
    }
    
    const positions = {
      'bottom-right': 'bottom-6 right-6',
      'bottom-left': 'bottom-6 left-6', 
      'top-right': 'top-6 right-6',
      'top-left': 'top-6 left-6'
    };
    
    return `${baseClasses} ${positions[position as keyof typeof positions]}`;
  };

  const getTransformClasses = () => {
    if (!isVisible) {
      if (position === 'bottom-center') {
        return "opacity-0 scale-95 pointer-events-none translate-y-8";
      }
      return "opacity-0 scale-95 pointer-events-none " + 
        (position.includes('right') ? 'translate-x-8' : '-translate-x-8');
    }
    return "opacity-100 scale-100 translate-x-0 translate-y-0";
  };

  // Mobile banner design
  if (screenSize === 'mobile' && position === 'bottom-center') {
    return (
      <div 
        className={cn(
          getPositionClasses(), 
          getTransformClasses(),
          "pb-safe" // Account for mobile browser UI
        )}
      >
        <div className="backdrop-blur-md bg-background/90 border border-border/50 rounded-lg shadow-lg mx-4 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            {/* Progress Circle - Smaller for mobile */}
            <ProgressRing size={32} strokeWidth={2} percentage={completionPercentage} />
            
            {/* Progress Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                EPK Progress ({completedCount}/{milestones.length})
              </p>
              {completionPercentage === 100 ? (
                <p className="text-xs text-accent">Complete!</p>
              ) : (
                <p className="text-xs text-muted-foreground truncate">
                  {incompleteMilestones[0]?.label || 'Keep going!'}
                </p>
              )}
            </div>

            {/* Publish Button */}
            {profile && onTogglePublish && (
              <Button
                onClick={onTogglePublish}
                variant={profile.is_published ? "outline" : "default"}
                size="sm"
                className={cn(
                  "flex items-center gap-1 text-xs px-3 py-2 transition-all duration-200 flex-shrink-0",
                  profile.is_published 
                    ? "border-orange-500/50 text-orange-600 hover:bg-orange-500/10" 
                    : "bg-green-600 hover:bg-green-700 text-white"
                )}
              >
                {profile.is_published ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                <span className="hidden xs:inline">
                  {profile.is_published ? "Unpublish" : "Publish"}
                </span>
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Tablet horizontal bar design
  if (screenSize === 'tablet' && position === 'bottom-center') {
    return (
      <div className={cn(getPositionClasses(), getTransformClasses())}>
        <div className="backdrop-blur-md bg-background/85 border border-border/40 rounded-xl shadow-elegant mx-6 p-4">
          <div className="flex items-center gap-4">
            {/* Progress Circle */}
            <ProgressRing size={40} strokeWidth={3} percentage={completionPercentage} />
            
            {/* Progress Details */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-foreground">EPK Progress</p>
                <p className="text-xs text-muted-foreground">{completedCount} of {milestones.length} complete</p>
              </div>
              
              {completionPercentage === 100 ? (
                <div className="flex items-center gap-2 text-xs text-accent">
                  <CheckCircle className="w-3 h-3" />
                  <span>EPK Complete!</span>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Next: {incompleteMilestones[0]?.label || 'Finish remaining steps'}
                </p>
              )}
            </div>

            {/* Publish Button */}
            {profile && onTogglePublish && (
              <Button
                onClick={onTogglePublish}
                variant={profile.is_published ? "outline" : "default"}
                size="sm"
                className={cn(
                  "flex items-center gap-2 text-xs px-4 py-2 transition-all duration-200 flex-shrink-0",
                  profile.is_published 
                    ? "border-orange-500/50 text-orange-600 hover:bg-orange-500/10" 
                    : "bg-green-600 hover:bg-green-700 text-white"
                )}
              >
                {profile.is_published ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                {profile.is_published ? "Unpublish" : "Publish"}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Desktop corner design (default)
  return (
    <div className={cn(getPositionClasses(), getTransformClasses())}>
      <div className="backdrop-blur-md bg-background/80 border border-border/30 rounded-xl shadow-elegant min-w-[280px] p-4">
        <div className="flex items-center gap-3 mb-3">
          {/* Circular Progress Ring */}
          <ProgressRing size={48} strokeWidth={4} percentage={completionPercentage} />
          
          <div>
            <p className="text-sm font-medium text-foreground">
              EPK Progress
            </p>
            <p className="text-xs text-muted-foreground">
              {completedCount} of {milestones.length} complete
            </p>
          </div>
        </div>

        {incompleteMilestones.length > 0 && (
          <div className="space-y-1.5 mb-3">
            <p className="text-xs text-muted-foreground">Next steps:</p>
            {incompleteMilestones.map((milestone, index) => (
              <div key={index} className="flex items-center gap-2 text-xs">
                <Circle className="w-3 h-3 text-muted-foreground/60 flex-shrink-0" />
                <span className="text-muted-foreground truncate">{milestone.label}</span>
              </div>
            ))}
          </div>
        )}

        {completionPercentage === 100 && (
          <div className="flex items-center gap-2 text-xs text-accent mb-3">
            <CheckCircle className="w-3 h-3" />
            <span>EPK Complete!</span>
          </div>
        )}

        {/* Compact Publish Toggle */}
        {profile && onTogglePublish && (
          <div className="border-t border-border/30 pt-3">
            <Button
              onClick={onTogglePublish}
              variant={profile.is_published ? "outline" : "default"}
              size="sm"
              className={cn(
                "w-full flex items-center gap-2 text-xs transition-all duration-200",
                profile.is_published 
                  ? "border-orange-500/50 text-orange-600 hover:bg-orange-500/10 hover:border-orange-500/70" 
                  : "bg-green-600 hover:bg-green-700 text-white shadow-sm hover:shadow-md"
              )}
            >
              {profile.is_published ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              {profile.is_published ? "Unpublish" : "Publish"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}