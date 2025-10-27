import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Save, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import InlineEditor from "@/components/InlineEditor";
import { User } from "@supabase/supabase-js";

interface MobileEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectionId: string;
  profile: any;
  user: User | null;
  onSave: (updatedData?: any) => void;
  isInitialSetup?: boolean;
  initialFormData?: Record<string, any>;
  onFormDataChange?: (data: Record<string, any>) => void;
}

const getSectionTitle = (sectionId: string) => {
  const titles: Record<string, string> = {
    basic: "Artist Details",
    bio: "Biography",
    background: "Background Image", 
    gallery: "Photo Gallery",
    videos: "Show Videos",
    streaming: "Streaming Links",
    social: "Social Media",
    contact: "Contact Information",
    shows: "Shows & Events",
    mentions: "Press Mentions",
    quotes: "Press Quotes"
  };
  return titles[sectionId] || "Edit Section";
};

export default function MobileEditorModal({
  isOpen,
  onClose,
  sectionId,
  profile,
  user,
  onSave,
  isInitialSetup = false,
  initialFormData,
  onFormDataChange
}: MobileEditorModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleSave = async (updatedData?: any) => {
    try {
      setIsSaving(true);
      await onSave(updatedData);
      setHasChanges(false);
      onClose();
    } catch (error) {
      // Error is already handled in the parent component
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      // You could add a confirmation dialog here if needed
    }
    onClose();
  };

  const handleFormDataChange = (data: Record<string, any>) => {
    setHasChanges(true);
    onFormDataChange?.(data);
  };

  const handleOpenChange = (open: boolean) => {
    // Prevent closing if saving or if there are unsaved changes
    if (!open && !isSaving) {
      handleCancel();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-full w-full h-full m-0 p-0 max-h-screen overflow-hidden">
        {/* Header with title and close button */}
        <DialogHeader className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex-row items-center justify-between space-y-0">
          <DialogTitle className="text-lg font-semibold">
            {getSectionTitle(sectionId)}
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            disabled={isSaving}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogHeader>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-4 pb-20">
          <InlineEditor
            sectionId={sectionId}
            profile={profile}
            user={user}
            onSave={handleSave}
            onCancel={handleCancel}
            isInitialSetup={isInitialSetup}
            initialFormData={initialFormData}
            onFormDataChange={handleFormDataChange}
            isInMobileModal={true}
          />
        </div>

        {/* Sticky bottom banner with save/cancel buttons */}
        <div className="sticky bottom-0 left-0 right-0 bg-background border-t px-4 py-3 flex gap-3">
          <Button
            variant="minimal"
            onClick={handleCancel}
            disabled={isSaving}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleSave()}
            disabled={isSaving}
            className={cn(
              "flex-1 bg-primary hover:bg-primary/90",
              hasChanges && "bg-green-600 hover:bg-green-700"
            )}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}