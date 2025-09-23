import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, Copy, ExternalLink, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useClickOutside } from "@/hooks/useClickOutside";

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isPublished: boolean;
  publicUrl?: string;
  onCopyLink?: () => void;
  onViewEPK?: () => void;
}

type ModalState = 'confirm' | 'loading' | 'success';

export function PublishModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  isPublished, 
  publicUrl,
  onCopyLink,
  onViewEPK 
}: PublishModalProps) {
  const [modalState, setModalState] = useState<ModalState>('confirm');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const { toast } = useToast();

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setModalState('confirm');
      setLoadingProgress(0);
    }
  }, [isOpen]);

  // Animate loading progress
  useEffect(() => {
    if (modalState === 'loading') {
      const duration = 2000; // 2 seconds
      const steps = 60; // 60fps
      const increment = 100 / steps;
      let currentProgress = 0;

      const timer = setInterval(() => {
        currentProgress += increment;
        if (currentProgress >= 100) {
          setLoadingProgress(100);
          setTimeout(() => {
            setModalState('success');
          }, 200);
          clearInterval(timer);
        } else {
          setLoadingProgress(currentProgress);
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [modalState]);

  const handleConfirm = async () => {
    try {
      setModalState('loading');
      await onConfirm();
    } catch (error) {
      setModalState('confirm');
      toast({
        title: "Error",
        description: "Failed to publish EPK. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCopyLink = () => {
    if (onCopyLink) {
      onCopyLink();
    } else if (publicUrl) {
      navigator.clipboard.writeText(publicUrl);
      toast({
        title: "Link copied!",
        description: "Your EPK link has been copied to clipboard.",
      });
    }
  };

  const modalRef = useClickOutside<HTMLDivElement>(() => {
    if (modalState === 'confirm' || modalState === 'success') {
      onClose();
    }
  });

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 border-0 bg-transparent shadow-none">
        <Card ref={modalRef} className="glass-card border-white/10 relative">
          {/* Close button - only show in confirm and success states */}
          {(modalState === 'confirm' || modalState === 'success') && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 z-10 text-muted-foreground hover:text-foreground"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
          )}

          <CardContent className="p-8">
            {/* CONFIRM STATE */}
            {modalState === 'confirm' && (
              <div className="text-center space-y-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-foreground">
                    {isPublished ? "Unpublish EPK?" : "Publish Your EPK?"}
                  </h2>
                  <p className="text-muted-foreground">
                    {isPublished 
                      ? "Your EPK will no longer be publically accessible."
                      : "Your EPK will be accessible to anyone with the link."
                    }
                  </p>
                </div>

                <div className="flex gap-3 justify-center">
                  <Button variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleConfirm}
                    className={isPublished 
                      ? "bg-orange-600 hover:bg-orange-700 text-white" 
                      : "bg-green-600 hover:bg-green-700 text-white"
                    }
                  >
                    {isPublished ? "Unpublish EPK" : "Publish EPK"}
                  </Button>
                </div>
              </div>
            )}

            {/* LOADING STATE */}
            {modalState === 'loading' && (
              <div className="text-center space-y-8">
                {/* Vinyl Record Animation */}
                <div className="flex justify-center">
                  <div className="relative">
                    <div 
                      className="w-24 h-24 rounded-full border-2 border-muted-foreground/30 transition-all duration-150 ease-out"
                      style={{
                        background: `conic-gradient(from 0deg, hsl(var(--primary)) 0deg, hsl(var(--primary)) ${loadingProgress * 3.6}deg, transparent ${loadingProgress * 3.6}deg, transparent 360deg)`,
                        boxShadow: loadingProgress > 0 ? '0 0 20px 4px hsl(var(--primary) / 0.3)' : 'none'
                      }}
                    >
                      {/* Inner circle for vinyl record appearance */}
                      <div className="absolute inset-2 rounded-full bg-background/80 border border-muted-foreground/20">
                        <div className="absolute inset-1/2 w-3 h-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-muted-foreground/40" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h2 className="text-xl font-semibold text-foreground">
                    {isPublished ? "Unpublishing your EPK..." : "Publishing your EPK..."}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {Math.round(loadingProgress)}%
                  </p>
                </div>
              </div>
            )}

            {/* SUCCESS STATE */}
            {modalState === 'success' && !isPublished && (
              <div className="text-center space-y-6">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-foreground">
                    Congratulations on Publishing your EPK!
                  </h2>
                  <p className="text-muted-foreground">
                    Get ready to start booking more shows.
                  </p>
                </div>

                <div className="flex gap-3 justify-center">
                  <Button variant="outline" onClick={handleCopyLink}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Link
                  </Button>
                  <Button onClick={onViewEPK} className="bg-green-600 hover:bg-green-700 text-white">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View EPK
                  </Button>
                </div>
              </div>
            )}

            {/* UNPUBLISH SUCCESS STATE */}
            {modalState === 'success' && isPublished && (
              <div className="text-center space-y-6">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-gray-500/10 border border-gray-500/20 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-gray-500" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-foreground">
                    Your EPK has been unpublished
                  </h2>
                </div>

                <div className="flex gap-3 justify-center">
                  <Button onClick={onClose} className="bg-primary hover:bg-primary/90 text-white">
                    Return to Dashboard
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}