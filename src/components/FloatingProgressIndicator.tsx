import { useState, useEffect, useRef } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { CheckCircle, Circle, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

type FloatingPosition = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';

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
  const positionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const incompleteMilestones = milestones.filter(m => !m.completed).slice(0, 2);
  const completedCount = milestones.filter(m => m.completed).length;

  // Dynamic positioning logic to avoid obstructions
  useEffect(() => {
    if (!isVisible) return;

    const findOptimalPosition = () => {
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      
      // Check for potential obstructions in different areas
      const positions = [
        { pos: 'bottom-right' as FloatingPosition, priority: 1 },
        { pos: 'bottom-left' as FloatingPosition, priority: 2 },
        { pos: 'top-right' as FloatingPosition, priority: 3 },
        { pos: 'top-left' as FloatingPosition, priority: 4 }
      ];

      // On mobile, prefer bottom positions for thumb accessibility
      if (viewportWidth < 768) {
        positions.sort((a, b) => {
          if (a.pos.includes('bottom') && !b.pos.includes('bottom')) return -1;
          if (!a.pos.includes('bottom') && b.pos.includes('bottom')) return 1;
          return a.priority - b.priority;
        });
      }

      // Check for editor panels or modals that might obstruct
      const activeEditor = document.querySelector('[data-editor-active]');
      const rightSideElements = document.querySelectorAll('[class*="right-"], [class*="fixed"][class*="right"]');
      
      let optimalPosition = positions[0].pos;

      // If there are right-side elements, prefer left positions
      if (rightSideElements.length > 0 || activeEditor) {
        optimalPosition = positions.find(p => p.pos.includes('left'))?.pos || 'bottom-left';
      }

      setPosition(optimalPosition);
    };

    findOptimalPosition();
    
    // Re-evaluate position on resize or scroll
    const handleResize = () => findOptimalPosition();
    const handleScroll = () => {
      // Slight delay to avoid too frequent updates during scroll
      if (positionTimeoutRef.current) {
        clearTimeout(positionTimeoutRef.current);
      }
      positionTimeoutRef.current = setTimeout(findOptimalPosition, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      if (positionTimeoutRef.current) {
        clearTimeout(positionTimeoutRef.current);
      }
    };
  }, [isVisible]);

  const getPositionClasses = (pos: FloatingPosition) => {
    const baseClasses = "fixed z-50 transition-all duration-500 ease-out transform";
    const positions = {
      'bottom-right': 'bottom-6 right-6',
      'bottom-left': 'bottom-6 left-6', 
      'top-right': 'top-6 right-6',
      'top-left': 'top-6 left-6'
    };
    return `${baseClasses} ${positions[pos]}`;
  };

  const getTransformClasses = () => {
    if (!isVisible) {
      return "opacity-0 scale-95 pointer-events-none " + 
        (position.includes('right') ? 'translate-x-8' : '-translate-x-8');
    }
    return "opacity-100 scale-100 translate-x-0";
  };

  return (
    <div className={cn(getPositionClasses(position), getTransformClasses())}>
      <div className="glass-card backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-elegant min-w-[280px] bg-background/80">
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
          <div className="border-t border-white/10 pt-3">
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