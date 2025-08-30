import { useEffect, useCallback, useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseAutoSaveOptions {
  data: any;
  onSave: (data: any) => Promise<void>;
  delay?: number;
  enabled?: boolean;
}

interface UseAutoSaveReturn {
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  triggerSave: () => Promise<void>;
  setUnsavedChanges: (hasChanges: boolean) => void;
}

export function useAutoSave({ 
  data, 
  onSave, 
  delay = 500, 
  enabled = true 
}: UseAutoSaveOptions): UseAutoSaveReturn {
  const { toast } = useToast();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousDataRef = useRef<any>(null);
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  const performSave = useCallback(async (dataToSave: any, isManual = false) => {
    if (isSaving) return;
    
    setIsSaving(true);
    
    try {
      await onSave(dataToSave);
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
      retryCountRef.current = 0;
      
      if (isManual) {
        toast({
          title: "Profile saved",
          description: "Your changes have been saved successfully.",
        });
      }
    } catch (error: any) {
      console.error('Auto-save failed:', error);
      
      if (retryCountRef.current < maxRetries) {
        retryCountRef.current++;
        
        // Exponential backoff retry
        setTimeout(() => {
          performSave(dataToSave, isManual);
        }, Math.pow(2, retryCountRef.current) * 1000);
        
        toast({
          title: "Save failed, retrying...",
          description: `Attempt ${retryCountRef.current} of ${maxRetries}`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Save failed",
          description: "Failed to save after multiple attempts. Please save manually.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSaving(false);
    }
  }, [onSave, isSaving, toast]);

  const triggerSave = useCallback(async () => {
    if (hasUnsavedChanges && data) {
      await performSave(data, true);
    }
  }, [hasUnsavedChanges, data, performSave]);

  const setUnsavedChanges = useCallback((hasChanges: boolean) => {
    setHasUnsavedChanges(hasChanges);
  }, []);

  // Auto-save effect
  useEffect(() => {
    if (!enabled || !data) return;

    const dataString = JSON.stringify(data);
    const hasChanged = previousDataRef.current && previousDataRef.current !== dataString;
    
    if (hasChanged) {
      setHasUnsavedChanges(true);
      
      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Set new timeout for auto-save
      timeoutRef.current = setTimeout(() => {
        performSave(data);
      }, delay);
    }
    
    previousDataRef.current = dataString;
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, delay, enabled, performSave]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    hasUnsavedChanges,
    isSaving,
    lastSaved,
    triggerSave,
    setUnsavedChanges,
  };
}