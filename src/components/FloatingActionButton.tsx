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
        "fixed bottom-6 right-6 z-50 transition-all duration-300 transform",
        isVisible ? "opacity-100 translate-x-0 scale-100" : "opacity-0 translate-x-full scale-95 pointer-events-none",
        className
      )}
    >
      <Button
        onClick={handleSave}
        disabled={isSaving || !hasUnsavedChanges}
        size="lg"
        className={cn(
          "h-16 w-16 rounded-full shadow-2xl hover:shadow-glow transition-all duration-300 p-0",
          "bg-gradient-primary border-2 border-primary/20 backdrop-blur-glass",
          "hover:scale-110 hover:border-primary/40",
          hasUnsavedChanges && "animate-pulse shadow-glow ring-4 ring-primary/20"
        )}
      >
        {isSaving ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : (
          <Save className="w-6 h-6" />
        )}
      </Button>
      
      {hasUnsavedChanges && (
        <div className="absolute -top-1 -right-1">
          <div className="w-5 h-5 bg-destructive rounded-full animate-pulse border-2 border-background" />
        </div>
      )}
      
      {/* Tooltip */}
      <div
        className={cn(
          "absolute bottom-full right-0 mb-2 px-3 py-1 bg-background/90 backdrop-blur-sm rounded-md shadow-lg transition-all duration-200",
          "text-sm whitespace-nowrap border border-white/10",
          isVisible && hasUnsavedChanges ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
        )}
      >
        {isSaving ? "Saving..." : hasUnsavedChanges ? "Save Profile" : "Saved"}
        <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-background/90" />
      </div>
    </div>
  );
}