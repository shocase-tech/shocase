import { useState, useEffect } from "react";
import { CheckCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { VinylSpinner } from "@/components/ui/vinyl-spinner";

interface SaveIndicatorProps {
  isSaving: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
  className?: string;
}

export default function SaveIndicator({ 
  isSaving, 
  lastSaved, 
  hasUnsavedChanges, 
  className 
}: SaveIndicatorProps) {
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    if (!isSaving && lastSaved && !hasUnsavedChanges) {
      setShowSaved(true);
      const timer = setTimeout(() => setShowSaved(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isSaving, lastSaved, hasUnsavedChanges]);

  if (isSaving) {
    return (
      <div className={cn("flex items-center gap-1 text-xs text-muted-foreground", className)}>
        <VinylSpinner size={12} />
        <span>Saving...</span>
      </div>
    );
  }

  if (showSaved) {
    return (
      <div className={cn("flex items-center gap-1 text-xs text-green-600 animate-fade-in", className)}>
        <CheckCircle className="w-3 h-3" />
        <span>Saved</span>
      </div>
    );
  }

  return null;
}