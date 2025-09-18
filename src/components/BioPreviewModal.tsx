import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Lightbulb } from 'lucide-react';
import { VinylSpinner } from '@/components/ui/vinyl-spinner';

interface BioPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  generatedBio: string;
  onUseBio: (bio: string) => void;
  onRegenerate: () => void;
  isRegenerating: boolean;
}

export const BioPreviewModal = ({
  isOpen,
  onClose,
  generatedBio,
  onUseBio,
  onRegenerate,
  isRegenerating
}: BioPreviewModalProps) => {
  const [editableBio, setEditableBio] = useState(generatedBio);
  const bioWordCount = editableBio.trim().split(/\s+/).filter(word => word.length > 0).length;

  // Update editableBio when generatedBio changes (for regeneration)
  useEffect(() => {
    setEditableBio(generatedBio);
  }, [generatedBio]);

  const handleUseBio = () => {
    onUseBio(editableBio);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Generated Bio Preview</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="bio-preview">Edit your generated bio</Label>
            <div className="text-xs text-muted-foreground">
              <span className={bioWordCount < 150 || bioWordCount > 300 ? "text-orange-500" : "text-green-500"}>
                {bioWordCount} words
              </span>
              <span className="ml-2 text-muted-foreground">
                (Recommended: 150-300 words)
              </span>
            </div>
          </div>
          
          <Textarea
            id="bio-preview"
            value={editableBio}
            onChange={(e) => setEditableBio(e.target.value)}
            rows={12}
            className="text-sm leading-relaxed resize-none"
            placeholder="Your generated bio will appear here..."
          />
          
          <p className="text-xs text-muted-foreground">
            You can edit the generated bio above before using it. The text will preserve paragraph formatting when saved.
          </p>
        </div>

        <DialogFooter className="flex gap-3 sm:gap-3">
          <Button 
            variant="outline" 
            onClick={onRegenerate}
            disabled={isRegenerating}
            className="flex-1 sm:flex-none"
          >
            {isRegenerating ? <VinylSpinner size={16} className="mr-2" /> : <Lightbulb className="w-4 h-4 mr-2" />}
            {isRegenerating ? "Regenerating..." : "Regenerate"}
          </Button>
          <Button 
            onClick={handleUseBio}
            disabled={!editableBio.trim()}
            className="flex-1 sm:flex-none"
          >
            Use This Bio
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};