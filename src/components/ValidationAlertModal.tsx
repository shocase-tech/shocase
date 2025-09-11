import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface ValidationError {
  showIndex: number;
  missingFields: string[];
}

interface ValidationAlertModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  validationErrors: ValidationError[];
}

export function ValidationAlertModal({ open, onOpenChange, validationErrors }: ValidationAlertModalProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Complete Required Fields</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p>Please fill in all required fields before saving:</p>
              <ul className="space-y-2">
                {validationErrors.map((error) => (
                  <li key={error.showIndex} className="flex items-start gap-2">
                    <span className="font-medium">Show {error.showIndex + 1}:</span>
                    <span className="text-muted-foreground">
                      Missing {error.missingFields.join(", ")}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={() => onOpenChange(false)}>
            OK
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}