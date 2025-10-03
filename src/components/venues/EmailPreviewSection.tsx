import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { Copy, RefreshCw, Send, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface EmailPreviewSectionProps {
  emailSubject: string;
  emailBody: string;
  onRegenerate: () => void;
  onMarkAsSent: (editedEmailBody: string) => Promise<void>;
  venueEmail: string;
}

export default function EmailPreviewSection({
  emailSubject,
  emailBody,
  onRegenerate,
  onMarkAsSent,
  venueEmail,
}: EmailPreviewSectionProps) {
  const [editedBody, setEditedBody] = useState(emailBody);
  const [isEdited, setIsEdited] = useState(false);
  const [showRegenerateDialog, setShowRegenerateDialog] = useState(false);
  const [showMarkAsSentDialog, setShowMarkAsSentDialog] = useState(false);
  const [confirmSent, setConfirmSent] = useState(false);
  const [copying, setCopying] = useState(false);
  const [markingAsSent, setMarkingAsSent] = useState(false);

  const handleBodyChange = (value: string) => {
    setEditedBody(value);
    if (value !== emailBody) {
      setIsEdited(true);
    } else {
      setIsEdited(false);
    }
  };

  const handleCopyEmail = async () => {
    setCopying(true);
    try {
      const fullEmail = `To: ${venueEmail}\n\nSubject: ${emailSubject}\n\n${editedBody}`;
      await navigator.clipboard.writeText(fullEmail);
      toast({
        title: "Email copied to clipboard!",
        description: "You can now paste it into your email client.",
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please try again or manually copy the text.",
        variant: "destructive",
      });
    } finally {
      setCopying(false);
    }
  };

  const handleRegenerateConfirm = () => {
    setShowRegenerateDialog(false);
    onRegenerate();
  };

  const handleMarkAsSentConfirm = async () => {
    if (!confirmSent) {
      toast({
        title: "Confirmation required",
        description: "Please confirm that you sent the email.",
        variant: "destructive",
      });
      return;
    }

    setMarkingAsSent(true);
    try {
      await onMarkAsSent(editedBody);
      setShowMarkAsSentDialog(false);
      setConfirmSent(false);
    } catch (error) {
      // Error handled in parent component
    } finally {
      setMarkingAsSent(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Your Personalized Pitch</h2>
        <p className="text-gray-400">Review and edit before sending</p>
      </div>

      {/* Email Preview Card */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Email Preview</span>
            {isEdited && (
              <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                Modified
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* To Field */}
          <div>
            <div className="text-sm text-gray-400 mb-1">To:</div>
            <div className="text-white bg-gray-900 px-3 py-2 rounded-md border border-gray-700">
              {venueEmail}
            </div>
          </div>

          {/* Subject Field */}
          <div>
            <div className="text-sm text-gray-400 mb-1">Subject:</div>
            <div className="text-white bg-gray-900 px-3 py-2 rounded-md border border-gray-700">
              {emailSubject}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-700" />

          {/* Body Field */}
          <div>
            <div className="text-sm text-gray-400 mb-1">Message:</div>
            <Textarea
              value={editedBody}
              onChange={(e) => handleBodyChange(e.target.value)}
              className="min-h-[300px] bg-gray-900 border-gray-700 text-white resize-none font-sans"
              placeholder="Email body..."
            />
            <div className="text-xs text-gray-500 mt-1 text-right">
              {editedBody.length} characters
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="outline"
          onClick={() => setShowRegenerateDialog(true)}
          className="bg-gray-800 border-gray-700 hover:bg-gray-700"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Regenerate
        </Button>

        <Button
          variant="outline"
          onClick={handleCopyEmail}
          disabled={copying}
          className="bg-gray-800 border-gray-700 hover:bg-gray-700"
        >
          {copying ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Copy className="h-4 w-4 mr-2" />
          )}
          Copy Email
        </Button>

        <Button
          className="flex-1 sm:ml-auto"
          size="lg"
          onClick={() => setShowMarkAsSentDialog(true)}
        >
          <Send className="h-4 w-4 mr-2" />
          Mark as Sent
        </Button>
      </div>

      {/* Regenerate Confirmation Dialog */}
      <AlertDialog open={showRegenerateDialog} onOpenChange={setShowRegenerateDialog}>
        <AlertDialogContent className="bg-gray-900 border-gray-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Regenerate Email?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              This will use another AI generation. Continue?
              {isEdited && (
                <span className="block mt-2 text-yellow-500">
                  Warning: Your edits will be lost.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-800 border-gray-700 hover:bg-gray-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRegenerateConfirm}
              className="bg-primary hover:bg-primary/90"
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Mark as Sent Confirmation Dialog */}
      <AlertDialog open={showMarkAsSentDialog} onOpenChange={setShowMarkAsSentDialog}>
        <AlertDialogContent className="bg-gray-900 border-gray-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Did you send this email?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              <div className="space-y-4">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="confirm-sent"
                    checked={confirmSent}
                    onCheckedChange={(checked) => setConfirmSent(checked as boolean)}
                    className="mt-1"
                  />
                  <label
                    htmlFor="confirm-sent"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Yes, I sent this email manually
                  </label>
                </div>
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 text-yellow-300 text-sm">
                  <strong>Warning:</strong> This will count toward your monthly application limit and start the cooldown period for this venue.
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="bg-gray-800 border-gray-700 hover:bg-gray-700"
              onClick={() => setConfirmSent(false)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleMarkAsSentConfirm}
              disabled={markingAsSent || !confirmSent}
              className="bg-primary hover:bg-primary/90 disabled:opacity-50"
            >
              {markingAsSent ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Confirm'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
