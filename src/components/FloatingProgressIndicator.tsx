import { useState, useEffect, useRef } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { CheckCircle, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

type FloatingPosition = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
type DisplayMode = 'corner' | 'banner';

interface FloatingProgressIndicatorProps {
  completionPercentage: number;
  milestones: Array<{ label: string; completed: boolean }>;
  isVisible: boolean;
  profile?: any;
  onTogglePublish?: () => void;
  onShowPreview?: () => void;
}

export default function FloatingProgressIndicator({ 
  completionPercentage, 
  milestones, 
  isVisible,
  profile,
  onTogglePublish,
  onShowPreview
}: FloatingProgressIndicatorProps) {
  const [position, setPosition] = useState<FloatingPosition>('bottom-right');
  const [displayMode, setDisplayMode] = useState<DisplayMode>('corner');
  const positionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMobile = useIsMobile();
  const completedCount = milestones.filter(m => m.completed).length;

  // Calculate safe corner areas
  const getCornerBounds = (corner: FloatingPosition) => {
    const width = 320; // indicator width
    const height = 200; // indicator height
    const margin = 24; // margin from edges
    
    switch (corner) {
      case 'bottom-right':
        return {
          left: window.innerWidth - width - margin,
          top: window.innerHeight - height - margin,
          right: window.innerWidth - margin,
          bottom: window.innerHeight - margin
        };
      case 'bottom-left':
        return {
          left: margin,
          top: window.innerHeight - height - margin,
          right: margin + width,
          bottom: window.innerHeight - margin
        };
      case 'top-right':
        return {
          left: window.innerWidth - width - margin,
          top: margin,
          right: window.innerWidth - margin,
          bottom: margin + height
        };
      case 'top-left':
        return {
          left: margin,
          top: margin,
          right: margin + width,
          bottom: margin + height
        };
    }
  };

  // Check if corner position is blocked by editing elements
  const isCornerBlocked = (corner: FloatingPosition): boolean => {
    const cornerBounds = getCornerBounds(corner);
    
    // Query for active editing elements that might block the indicator
    const obstructions = document.querySelectorAll([
      '[data-editor-active="true"]',
      '.inline-editor-active', 
      '.gallery-editor-active', 
      '.mentions-editor-active', 
      '.shows-editor-active',
      '[role="dialog"]:not([data-state="closed"])',
      '.sheet-content',
      '.popover-content',
      '.dropdown-content',
      '.toast-viewport'
    ].join(', '));

    for (const obstruction of obstructions) {
      const rect = obstruction.getBoundingClientRect();
      
      // Check for overlap
      if (rect.right > cornerBounds.left && 
          rect.bottom > cornerBounds.top &&
          rect.left < cornerBounds.right &&
          rect.top < cornerBounds.bottom) {
        return true;
      }
    }
    return false;
  };

  // Determine optimal display mode and position
  const getOptimalDisplay = (): { mode: DisplayMode; position: FloatingPosition } => {
    const screenWidth = window.innerWidth;
    
    // Mobile: Always use banner mode
    if (screenWidth < 768) {
      return { mode: 'banner', position: 'bottom-right' };
    }

    // Check available corner space - priority order
    const cornerPriority: FloatingPosition[] = ['bottom-right', 'bottom-left', 'top-right', 'top-left'];
    
    for (const corner of cornerPriority) {
      if (!isCornerBlocked(corner)) {
        return { mode: 'corner', position: corner };
      }
    }

    // If all corners blocked or narrow screen, use banner
    if (screenWidth < 900) {
      return { mode: 'banner', position: 'bottom-right' };
    }

    // Fallback to top-right corner even if partially blocked
    return { mode: 'corner', position: 'top-right' };
  };

  // Dynamic positioning and mode logic
  useEffect(() => {
    if (!isVisible) return;

    const updateDisplay = () => {
      const { mode, position } = getOptimalDisplay();
      setDisplayMode(mode);
      setPosition(position);
      
      // Add/remove body padding for banner mode
      const mainContent = document.querySelector('main');
      if (mainContent) {
        if (mode === 'banner') {
          mainContent.style.paddingBottom = '80px';
        } else {
          mainContent.style.paddingBottom = '';
        }
      }
    };

    updateDisplay();
    
    // Re-evaluate on resize with debouncing
    const handleResize = () => {
      if (positionTimeoutRef.current) {
        clearTimeout(positionTimeoutRef.current);
      }
      positionTimeoutRef.current = setTimeout(updateDisplay, 150);
    };

    // Monitor DOM changes for editing states
    const observer = new MutationObserver(() => {
      if (positionTimeoutRef.current) {
        clearTimeout(positionTimeoutRef.current);
      }
      positionTimeoutRef.current = setTimeout(updateDisplay, 100);
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
      
      // Clean up body padding
      const mainContent = document.querySelector('main');
      if (mainContent) {
        mainContent.style.paddingBottom = '';
      }
    };
  }, [isVisible]);

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
            strokeDashoffset={percentage >= 100 ? 0 : strokeDashoffset}
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
    
    if (displayMode === 'banner') {
      return `${baseClasses} bottom-0 left-0 right-0`;
    }
    
    const positions = {
      'bottom-right': 'bottom-6 right-6',
      'bottom-left': 'bottom-6 left-6', 
      'top-right': 'top-6 right-6',
      'top-left': 'top-6 left-6'
    };
    
    return `${baseClasses} ${positions[position]}`;
  };

  const getTransformClasses = () => {
    if (!isVisible) {
      if (displayMode === 'banner') {
        return "opacity-0 scale-95 pointer-events-none translate-y-8";
      }
      return "opacity-0 scale-95 pointer-events-none " + 
        (position.includes('right') ? 'translate-x-8' : '-translate-x-8');
    }
    return "opacity-100 scale-100 translate-x-0 translate-y-0";
  };

  // Bottom banner mode for mobile and constrained layouts
  if (displayMode === 'banner') {
    return (
      <div className={cn(getPositionClasses(), getTransformClasses())}>
        <div className="backdrop-blur-md bg-background/95 border-t border-border/50 shadow-lg">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between gap-4">
              {/* Progress Info */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <ProgressRing size={36} strokeWidth={3} percentage={completionPercentage} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">
                    EPK Progress
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {completedCount}/{milestones.length} complete
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {/* Preview Button - only show if unpublished */}
                {profile && !profile.is_published && onShowPreview && (
                  <Button
                    onClick={onShowPreview}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 text-xs px-3 py-2 transition-all duration-200 flex-shrink-0"
                  >
                    <Eye className="w-3 h-3" />
                    <span className="hidden sm:inline">Preview</span>
                  </Button>
                )}
                
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
                    <span className="hidden sm:inline">
                      {profile.is_published ? "Unpublish" : "Publish"}
                    </span>
                  </Button>
                )}
              </div>
            </div>
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

        {completionPercentage === 100 && (
          <div className="flex items-center gap-2 text-xs text-accent mb-3">
            <CheckCircle className="w-3 h-3" />
            <span>EPK Complete!</span>
          </div>
        )}

        {/* Action Buttons */}
        {profile && onTogglePublish && (
          <div className="border-t border-border/30 pt-3 space-y-2">
            {/* Preview Button - only show if unpublished */}
            {!profile.is_published && onShowPreview && (
              <Button
                onClick={onShowPreview}
                variant="outline"
                size="sm"
                className="w-full flex items-center gap-2 text-xs transition-all duration-200"
              >
                <Eye className="w-3 h-3" />
                Preview
              </Button>
            )}
            
            {/* Publish Button */}
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