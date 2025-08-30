import { useCallback, useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Check } from 'lucide-react';

interface UseAutoSaveInputOptions {
  onSave: (value: string) => Promise<void>;
  delay?: number;
  showSuccessIndicator?: boolean;
}

export function useAutoSaveInput({ 
  onSave, 
  delay = 500,
  showSuccessIndicator = true 
}: UseAutoSaveInputOptions) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const successTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleKeyDown = useCallback(async (event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>, value: string) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      
      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Clear existing success timeout
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }

      try {
        setIsSaving(true);
        await onSave(value);
        
        if (showSuccessIndicator) {
          setShowSuccess(true);
          successTimeoutRef.current = setTimeout(() => {
            setShowSuccess(false);
          }, 2000);
        }
      } catch (error) {
        toast({
          title: "Save failed",
          description: "Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsSaving(false);
      }
    }
  }, [onSave, showSuccessIndicator, toast]);

  // Cleanup timeouts on unmount
  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current);
    }
  }, []);

  return {
    handleKeyDown,
    isSaving,
    showSuccess,
    cleanup
  };
}