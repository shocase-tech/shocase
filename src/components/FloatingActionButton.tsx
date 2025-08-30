import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Save, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingActionButtonProps {
  onSave: () => Promise<void>;
  hasUnsavedChanges: boolean;
  isVisible?: boolean;
  className?: string;
}

export default function FloatingActionButton({ 
  onSave, 
  hasUnsavedChanges, 
  isVisible = true,
  className 
}: FloatingActionButtonProps) {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (isSaving) return;
    
    setIsSaving(true);
    try {
      await onSave();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className={cn(
        "fixed bottom-5 right-5 z-40 transition-all duration-300 transform",
        isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full pointer-events-none",
        className
      )}
    >
      <Button
        onClick={handleSave}
        disabled={isSaving || !hasUnsavedChanges}
        size="lg"
        className={cn(
          "shadow-lg hover:shadow-xl transition-all duration-300 h-14 px-6",
          "bg-gradient-primary border border-glass backdrop-blur-glass",
          hasUnsavedChanges && "animate-pulse shadow-glow"
        )}
      >
        {isSaving ? (
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
        ) : (
          <Save className="w-5 h-5 mr-2" />
        )}
        {isSaving ? "Saving..." : hasUnsavedChanges ? "Save Profile" : "Saved"}
      </Button>
      
      {hasUnsavedChanges && (
        <div className="absolute -top-2 -right-2">
          <div className="w-4 h-4 bg-destructive rounded-full animate-pulse" />
        </div>
      )}
    </div>
  );
}