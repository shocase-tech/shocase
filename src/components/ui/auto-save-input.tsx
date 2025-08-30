import * as React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useAutoSaveInput } from "@/hooks/useAutoSaveInput";
import { Loader2, Check } from "lucide-react";

interface AutoSaveInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onAutoSave: (value: string) => Promise<void>;
  showSuccessIndicator?: boolean;
}

interface AutoSaveTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  onAutoSave: (value: string) => Promise<void>;
  showSuccessIndicator?: boolean;
}

const AutoSaveInput = React.forwardRef<HTMLInputElement, AutoSaveInputProps>(
  ({ className, onAutoSave, showSuccessIndicator = true, ...props }, ref) => {
    const { handleKeyDown, isSaving, showSuccess } = useAutoSaveInput({
      onSave: onAutoSave,
      showSuccessIndicator,
    });

    return (
      <div className="relative">
        <Input
          className={cn(
            "pr-8", // Add padding for the icon
            className
          )}
          ref={ref}
          onKeyDown={(e) => handleKeyDown(e, e.currentTarget.value)}
          {...props}
        />
        
        {/* Success/Loading indicator */}
        {(isSaving || showSuccess) && (
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            ) : showSuccess ? (
              <Check className="w-4 h-4 text-green-500 animate-in fade-in duration-200" />
            ) : null}
          </div>
        )}
      </div>
    );
  }
);
AutoSaveInput.displayName = "AutoSaveInput";

const AutoSaveTextarea = React.forwardRef<HTMLTextAreaElement, AutoSaveTextareaProps>(
  ({ className, onAutoSave, showSuccessIndicator = true, ...props }, ref) => {
    const { handleKeyDown, isSaving, showSuccess } = useAutoSaveInput({
      onSave: onAutoSave,
      showSuccessIndicator,
    });

    return (
      <div className="relative">
        <Textarea
          className={cn(
            "pr-8", // Add padding for the icon
            className
          )}
          ref={ref}
          onKeyDown={(e) => handleKeyDown(e, e.currentTarget.value)}
          {...props}
        />
        
        {/* Success/Loading indicator */}
        {(isSaving || showSuccess) && (
          <div className="absolute right-2 top-2">
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            ) : showSuccess ? (
              <Check className="w-4 h-4 text-green-500 animate-in fade-in duration-200" />
            ) : null}
          </div>
        )}
      </div>
    );
  }
);
AutoSaveTextarea.displayName = "AutoSaveTextarea";

export { AutoSaveInput, AutoSaveTextarea };