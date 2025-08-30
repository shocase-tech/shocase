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
  const detectEditingInterferences = () => {
    const activeEditors = [
      document.querySelector('[data-editor-active="true"]'),
      document.querySelector('.inline-editor-active'),
      document.querySelector('.gallery-editor-active'),
      document.querySelector('.mentions-editor-active'),
      document.querySelector('.shows-editor-active'),
      document.querySelector('[role="dialog"]'),
      document.querySelector('.sheet-content'),
    ].filter(Boolean);

    const rightSideInterferences = document.querySelectorAll(
      '[class*="right-"], [class*="fixed"][class*="right"], .sheet-content'
    );

    return {
      hasActiveEditors: activeEditors.length > 0,
      hasRightSideInterferences: rightSideInterferences.length > 0,
      activeEditors,
      rightSideInterferences
    };
  };

  // Dynamic positioning logic
  useEffect(() => {
    if (!isVisible) return;

    const findOptimalPosition = () => {
      const interferences = detectEditingInterferences();
      
      // Mobile: Always use bottom-center banner
      if (screenSize === 'mobile') {
        setPosition('bottom-center');
        return;
      }

      // Tablet positioning logic
      if (screenSize === 'tablet') {
        if (interferences.hasActiveEditors || interferences.hasRightSideInterferences) {
          setPosition('bottom-center'); // Use horizontal bar when corners blocked
        } else {
          setPosition('bottom-right'); // Default corner position
        }
        return;
      }

      // Desktop positioning logic
      const positions: Array<{pos: FloatingPosition, priority: number}> = [
        { pos: 'bottom-right', priority: 1 },
        { pos: 'bottom-left', priority: 2 },
        { pos: 'top-right', priority: 3 },
        { pos: 'top-left', priority: 4 }
      ];

      let optimalPosition: FloatingPosition = 'bottom-right';

      // Check for right-side obstructions
      if (interferences.hasRightSideInterferences) {
        optimalPosition = 'bottom-left';
      }
      
      // If active editors are detected, use fallback positions
      if (interferences.hasActiveEditors) {
        // Check if bottom-right area is actually obstructed
        const bottomRightRect = {
          left: window.innerWidth - 320, // Account for indicator width + margin
          top: window.innerHeight - 200, // Account for indicator height + margin
          right: window.innerWidth,
          bottom: window.innerHeight
        };

        // Check if any active editor intersects with bottom-right area
        let isBottomRightObstructed = false;
        interferences.activeEditors.forEach(editor => {
          if (editor instanceof Element) {
            const editorRect = editor.getBoundingClientRect();
            if (editorRect.right > bottomRightRect.left && 
                editorRect.bottom > bottomRightRect.top) {
              isBottomRightObstructed = true;
            }
          }
        });

        if (isBottomRightObstructed) {
          optimalPosition = 'bottom-left';
        }
      }

      setPosition(optimalPosition);
    };

    findOptimalPosition();
    
    // Re-evaluate position on resize with debouncing
    const handleResize = () => {
      if (positionTimeoutRef.current) {
        clearTimeout(positionTimeoutRef.current);
      }
      positionTimeoutRef.current = setTimeout(findOptimalPosition, 150);
    };

    // Monitor for DOM changes that might affect positioning
    const observer = new MutationObserver(() => {
      if (positionTimeoutRef.current) {
        clearTimeout(positionTimeoutRef.current);
      }
      positionTimeoutRef.current = setTimeout(findOptimalPosition, 100);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'data-editor-active', 'role']
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

  const getPositionClasses = () => {
    const baseClasses = "fixed z-50 transition-all duration-500 ease-out";
    
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
            <div className="relative w-8 h-8 flex-shrink-0">
              <div className="absolute inset-0 rounded-full border-2 border-muted/30"></div>
              <div 
                className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent transition-transform duration-700 ease-out"
                style={{ 
                  transform: `rotate(${(completionPercentage / 100) * 360}deg)`,
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-primary">{completionPercentage}%</span>
              </div>
            </div>
            
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
            <div className="relative w-10 h-10 flex-shrink-0">
              <div className="absolute inset-0 rounded-full border-3 border-muted/20"></div>
              <div 
                className="absolute inset-0 rounded-full border-3 border-primary border-t-transparent transition-transform duration-700 ease-out"
                style={{ 
                  transform: `rotate(${(completionPercentage / 100) * 360}deg)`,
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-primary">{completionPercentage}%</span>
              </div>
            </div>
            
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
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-4 border-muted/20"></div>
            <div 
              className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent transition-transform duration-700 ease-out"
              style={{ 
                transform: `rotate(${(completionPercentage / 100) * 360}deg)`,
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-primary">{completionPercentage}%</span>
            </div>
          </div>
          
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