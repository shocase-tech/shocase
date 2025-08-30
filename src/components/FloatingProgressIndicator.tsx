import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { CheckCircle, Circle, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const incompleteMilestones = milestones.filter(m => !m.completed).slice(0, 2);
  const completedCount = milestones.filter(m => m.completed).length;

  // Debug logging
  console.log('🌊 FloatingProgressIndicator render:', {
    isVisible,
    completionPercentage,
    completedCount,
    totalMilestones: milestones.length,
    hasProfile: !!profile,
    hasToggleFunction: !!onTogglePublish
  });

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-50 transition-all duration-300 transform",
        // Add a temporary bright border for testing visibility
        "border-4 border-red-500 bg-red-100",
        isVisible ? "opacity-100 translate-x-0 scale-100" : "opacity-0 translate-x-full scale-95 pointer-events-none"
      )}
      style={{
        // Force visibility for initial testing
        display: 'block'
      }}
    >
      <div className="glass-card border-glass backdrop-blur-glass p-4 rounded-lg shadow-card min-w-[280px] bg-background/95 border border-white/20">
        <div className="flex items-center gap-3 mb-3">
          {/* Circular Progress Ring */}
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-4 border-muted"></div>
            <div 
              className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent transform transition-transform duration-500"
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
          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground">Next milestones:</p>
            {incompleteMilestones.map((milestone, index) => (
              <div key={index} className="flex items-center gap-2 text-xs">
                <Circle className="w-3 h-3 text-muted-foreground flex-shrink-0" />
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
                "w-full flex items-center gap-2 text-xs",
                profile.is_published 
                  ? "border-orange-500/50 text-orange-600 hover:bg-orange-500/10" 
                  : "bg-green-600 hover:bg-green-700 text-white"
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