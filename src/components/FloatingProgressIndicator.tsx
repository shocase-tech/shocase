import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingProgressIndicatorProps {
  completionPercentage: number;
  milestones: Array<{ label: string; completed: boolean }>;
  isVisible: boolean;
}

export default function FloatingProgressIndicator({ 
  completionPercentage, 
  milestones, 
  isVisible 
}: FloatingProgressIndicatorProps) {
  const incompleteMilestones = milestones.filter(m => !m.completed).slice(0, 2);
  const completedCount = milestones.filter(m => m.completed).length;

  return (
    <div
      className={cn(
        "fixed bottom-5 right-5 z-50 transition-all duration-300 transform",
        isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full pointer-events-none"
      )}
    >
      <div className="glass-card border-glass backdrop-blur-glass p-4 rounded-lg shadow-card min-w-[280px]">
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
          <div className="flex items-center gap-2 text-xs text-accent">
            <CheckCircle className="w-3 h-3" />
            <span>EPK Complete!</span>
          </div>
        )}
      </div>
    </div>
  );
}