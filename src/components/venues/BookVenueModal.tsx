import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { initiateGmailAuth, createGmailDraft } from "@/lib/gmail";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Mail, Loader2, Pencil, Check, Copy, RefreshCw, CheckCircle2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";

interface BookVenueModalProps {
  isOpen: boolean;
  onClose: () => void;
  venue: any;
  artistProfile: any;
  outreachComponents: any | null;
}

export default function BookVenueModal({
  isOpen,
  onClose,
  venue,
  artistProfile,
  outreachComponents,
}: BookVenueModalProps) {
  const [proposedDates, setProposedDates] = useState("");
  const [proposedBill, setProposedBill] = useState("");
  const [additionalContext, setAdditionalContext] = useState("");
  const [showFullBio, setShowFullBio] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [existingApplicationId, setExistingApplicationId] = useState<string | null>(null);
  
  // Email generation states
  const [generatedEmail, setGeneratedEmail] = useState<{ subject: string; body: string; to: string } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Gmail integration states
  const [gmailConnected, setGmailConnected] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [checkingGmailConnection, setCheckingGmailConnection] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && artistProfile) {
      loadExistingDraft();
      checkGmailConnection();
    }
  }, [isOpen, artistProfile, venue]);

  // Check Gmail connection status on mount
  const checkGmailConnection = async () => {
    if (!artistProfile?.user_id) return;

    setCheckingGmailConnection(true);
    try {
      const { data, error } = await supabase
        .from('gmail_tokens')
        .select('user_id')
        .eq('user_id', artistProfile.user_id)
        .maybeSingle();

      setGmailConnected(!error && !!data);
    } catch (error) {
      console.error('Error checking Gmail connection:', error);
      setGmailConnected(false);
    } finally {
      setCheckingGmailConnection(false);
    }
  };

  const loadExistingDraft = async () => {
    if (!artistProfile?.user_id || !venue?.id) return;

    try {
      const { data, error } = await supabase
        .from("venue_applications")
        .select("*")
        .eq("artist_id", artistProfile.user_id)
        .eq("venue_id", venue.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        setExistingApplicationId(data.id);
        setProposedDates(data.proposed_dates || "");
        setProposedBill(data.proposed_bill || "");
        setAdditionalContext(data.additional_context || "");
      }
    } catch (error: any) {
      console.error("Error loading draft:", error);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!proposedDates.trim()) {
      newErrors.proposedDates = "Please enter your proposed dates";
    }
    if (!proposedBill.trim()) {
      newErrors.proposedBill = "Please describe your proposed bill";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveDraft = async () => {
    if (!validateForm()) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!artistProfile?.user_id || !venue?.id) {
      toast({
        title: "Error",
        description: "Missing artist or venue information",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);

      const applicationData = {
        artist_id: artistProfile.user_id,
        venue_id: venue.id,
        proposed_dates: proposedDates,
        proposed_bill: proposedBill,
        additional_context: additionalContext,
        email_subject: "Draft - Email will be generated",
        email_body: "Placeholder - will be generated when ready",
        status: "sent",
      };

      if (existingApplicationId) {
        // Update existing draft
        const { error } = await supabase
          .from("venue_applications")
          .update(applicationData)
          .eq("id", existingApplicationId);

        if (error) throw error;
      } else {
        // Insert new draft
        const { error } = await supabase
          .from("venue_applications")
          .insert(applicationData);

        if (error) throw error;
      }

      toast({
        title: "Draft saved!",
        description: "Continue in Outreach Dashboard",
      });

      onClose();
    } catch (error: any) {
      console.error("Error saving draft:", error);
      toast({
        title: "Error",
        description: "Failed to save draft: " + error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getBioPreview = () => {
    if (!artistProfile?.bio) return "No bio available";
    if (showFullBio || artistProfile.bio.length <= 150) {
      return artistProfile.bio;
    }
    return artistProfile.bio.substring(0, 150) + "...";
  };

  const getPastShows = () => {
    if (!artistProfile?.past_shows || !Array.isArray(artistProfile.past_shows)) {
      return [];
    }
    return artistProfile.past_shows.slice(0, 3);
  };

  const getGenres = () => {
    if (!artistProfile?.genre) return "No genres listed";
    if (Array.isArray(artistProfile.genre)) {
      return artistProfile.genre.join(", ");
    }
    return artistProfile.genre;
  };

  const handleGenerateEmail = async () => {
    if (!proposedDates.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter proposed dates first",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        throw new Error("Not authenticated");
      }

      const { data, error } = await supabase.functions.invoke('generate-venue-email', {
        body: {
          venue_id: venue.id,
          artist_name: artistProfile.artist_name,
          artist_genre: artistProfile.genre,
          artist_location: artistProfile.location,
          performance_type: artistProfile.performance_type,
          artist_bio: artistProfile.bio,
          past_shows: artistProfile.past_shows,
          artist_epk_url: `${window.location.origin}/${artistProfile.url_slug}`,
          venue_name: venue.name,
          venue_city: venue.city,
          venue_genres: venue.genres,
          venue_booking_guidelines: venue.booking_guidelines,
          venue_requirements: venue.requirements,
          venue_booking_email: venue.booking_contact_email,
          proposed_dates: proposedDates,
          proposed_bill: proposedBill,
          additional_context: additionalContext,
        }
      });

      if (error) {
        // Handle specific error types
        if (error.message?.includes('upgrade_required')) {
          toast({
            title: "Upgrade Required",
            description: "Email generation requires a Pro or Elite subscription.",
            variant: "destructive",
          });
          return;
        }
        
        if (error.message?.includes('limit_reached')) {
          toast({
            title: "Monthly Limit Reached",
            description: "You've reached your monthly application limit. Upgrade to Elite for unlimited applications.",
            variant: "destructive",
          });
          return;
        }
        
        if (error.message?.includes('cooldown_active')) {
          const errorData = JSON.parse(error.message);
          toast({
            title: "Cooldown Period Active",
            description: errorData.message || "You need to wait before applying to this venue again.",
            variant: "destructive",
          });
          return;
        }

        throw error;
      }

      setGeneratedEmail(data);
      setIsEditing(false);
      
      toast({
        title: "Email Generated!",
        description: "Review and edit your personalized pitch below.",
      });
    } catch (error: any) {
      console.error("Error generating email:", error);
      setGenerationError(error.message || "Failed to generate email");
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyToClipboard = async () => {
    if (!generatedEmail) return;

    const fullEmail = `To: ${generatedEmail.to}\nSubject: ${generatedEmail.subject}\n\n${generatedEmail.body}`;
    
    try {
      await navigator.clipboard.writeText(fullEmail);
      toast({
        title: "Email copied!",
        description: "Email content copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleRegenerateEmail = () => {
    if (window.confirm("This will count as a new application. Are you sure you want to regenerate the email?")) {
      setGeneratedEmail(null);
      handleGenerateEmail();
    }
  };

  const saveToDraftInGmail = async () => {
    if (!generatedEmail) return;

    setSavingDraft(true);

    try {
      const result = await createGmailDraft({
        to: generatedEmail.to,
        subject: generatedEmail.subject,
        body: generatedEmail.body,
        venue_id: venue.id,
        proposed_dates: proposedDates,
        proposed_bill: proposedBill,
        additional_context: additionalContext,
      });

      if (result.error) {
        // Handle specific error types
        if (result.error === 'gmail_not_connected' || result.error === 'gmail_token_expired' || result.error === 'gmail_token_invalid') {
          toast({
            title: "Gmail connection expired",
            description: "Please reconnect your Gmail account.",
            variant: "destructive",
          });
          setGmailConnected(false);
          return;
        }

        if (result.error === 'rate_limited') {
          toast({
            title: "Rate limited",
            description: "Gmail API rate limit exceeded. Please wait and try again.",
            variant: "destructive",
          });
          return;
        }

        throw new Error(result.message || 'Failed to create draft');
      }

      // Show success with link to open draft
      toast({
        title: "Draft saved to Gmail!",
        description: (
          <div className="space-y-2">
            <p>Your email is ready in Gmail drafts.</p>
            <a 
              href={result.draftUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium flex items-center gap-1"
            >
              Open in Gmail →
            </a>
          </div>
        ),
      });

      // Close modal
      onClose();
      
      // Navigate to outreach dashboard
      setTimeout(() => {
        navigate('/outreach');
      }, 500);

    } catch (error: any) {
      console.error('Error saving draft to Gmail:', error);
      toast({
        title: "Failed to save draft",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setSavingDraft(false);
    }
  };

  const handleGmailConnect = async () => {
    try {
      await initiateGmailAuth();
    } catch (error: any) {
      console.error('Error initiating Gmail auth:', error);
      toast({
        title: "Connection failed",
        description: "Failed to connect Gmail. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDisconnectGmail = async () => {
    try {
      const { error } = await supabase
        .from('gmail_tokens')
        .delete()
        .eq('user_id', artistProfile.user_id);

      if (error) throw error;

      setGmailConnected(false);
      toast({
        title: "Gmail disconnected",
        description: "Your Gmail account has been disconnected.",
      });
    } catch (error: any) {
      console.error('Error disconnecting Gmail:', error);
      toast({
        title: "Disconnection failed",
        description: "Failed to disconnect Gmail. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-background border-white/10">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">
                Apply to {venue?.name}
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                {venue?.city}, {venue?.state}
              </p>
            </div>
            {!checkingGmailConnection && gmailConnected && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Gmail Connected
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleDisconnectGmail}>
                    Disconnect Gmail
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <Accordion type="single" collapsible defaultValue="venue-details">
            {/* Section 1: EPK Summary */}
            <AccordionItem value="epk-summary" className="border-white/10">
              <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                Your EPK Summary
              </AccordionTrigger>
              <AccordionContent>
                <Card className="bg-card/50 border-white/10">
                  <CardContent className="pt-6 space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-2">
                        {artistProfile?.artist_name || "Artist Name"}
                      </h3>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {getGenres().split(", ").map((genre: string, i: number) => (
                          <Badge key={i} variant="secondary">
                            {genre}
                          </Badge>
                        ))}
                      </div>
                      {artistProfile?.location && (
                        <p className="text-sm text-muted-foreground">
                          📍 {artistProfile.location}
                        </p>
                      )}
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Bio</h4>
                      <p className="text-sm text-muted-foreground">
                        {getBioPreview()}
                      </p>
                      {artistProfile?.bio && artistProfile.bio.length > 150 && (
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => setShowFullBio(!showFullBio)}
                          className="p-0 h-auto text-primary"
                        >
                          {showFullBio ? "Show less" : "Read full"}
                        </Button>
                      )}
                    </div>

                    {getPastShows().length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Recent Shows</h4>
                        <ul className="space-y-1">
                          {getPastShows().map((show: any, i: number) => (
                            <li key={i} className="text-sm text-muted-foreground">
                              • {show.venue} - {show.city}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate("/epk")}
                      className="w-full"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Edit EPK
                    </Button>
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>

            {/* Section 2: Outreach Components */}
            <AccordionItem value="outreach-components" className="border-white/10">
              <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                Outreach Components
              </AccordionTrigger>
              <AccordionContent>
                <Card className="bg-card/50 border-white/10">
                  <CardContent className="pt-6 space-y-4">
                    {outreachComponents &&
                    (outreachComponents.expected_draw ||
                      outreachComponents.social_proof ||
                      outreachComponents.notable_achievements?.length > 0) ? (
                      <>
                        {outreachComponents.expected_draw && (
                          <div>
                            <h4 className="font-medium mb-1 text-sm">Expected Draw</h4>
                            <p className="text-sm text-muted-foreground">
                              {outreachComponents.expected_draw}
                            </p>
                          </div>
                        )}

                        {outreachComponents.social_proof && (
                          <div>
                            <h4 className="font-medium mb-1 text-sm">Social Proof</h4>
                            <p className="text-sm text-muted-foreground">
                              {outreachComponents.social_proof}
                            </p>
                          </div>
                        )}

                        {outreachComponents.notable_achievements?.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-1 text-sm">
                              Notable Achievements
                            </h4>
                            <ul className="space-y-1">
                              {outreachComponents.notable_achievements
                                .slice(0, 3)
                                .map((achievement: string, i: number) => (
                                  <li key={i} className="text-sm text-muted-foreground">
                                    • {achievement}
                                  </li>
                                ))}
                              {outreachComponents.notable_achievements.length > 3 && (
                                <li className="text-sm text-muted-foreground italic">
                                  ...{outreachComponents.notable_achievements.length - 3}{" "}
                                  more
                                </li>
                              )}
                            </ul>
                          </div>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate("/outreach?tab=settings")}
                          className="w-full"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Edit Outreach Settings
                        </Button>
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-muted-foreground text-center py-4">
                          Want to strengthen your pitch? Add outreach details in
                          settings.
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate("/outreach?tab=settings")}
                          className="w-full"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Add Outreach Details
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>

            {/* Section 3: Venue-Specific Details */}
            <AccordionItem value="venue-details" className="border-white/10">
              <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                Venue-Specific Details *
              </AccordionTrigger>
              <AccordionContent>
                <Card className="bg-card/50 border-white/10">
                  <CardContent className="pt-6 space-y-4">
                    <div>
                      <Label htmlFor="proposed-dates" className="text-base">
                        Proposed Dates *
                      </Label>
                      <Textarea
                        id="proposed-dates"
                        placeholder="Example: Available Oct 15-20 or Nov 3-10"
                        value={proposedDates}
                        onChange={(e) => {
                          if (e.target.value.length <= 500) {
                            setProposedDates(e.target.value);
                            if (errors.proposedDates) {
                              setErrors({ ...errors, proposedDates: "" });
                            }
                          }
                        }}
                        maxLength={500}
                        rows={3}
                        className={`resize-none mt-2 ${
                          errors.proposedDates ? "border-destructive" : ""
                        }`}
                      />
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-xs text-muted-foreground">
                          {proposedDates.length}/500 characters
                        </p>
                        {errors.proposedDates && (
                          <p className="text-xs text-destructive">
                            {errors.proposedDates}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="proposed-bill" className="text-base">
                        Proposed Bill *
                      </Label>
                      <Textarea
                        id="proposed-bill"
                        placeholder="Example: Headlining or co-bill with similar indie rock acts"
                        value={proposedBill}
                        onChange={(e) => {
                          if (e.target.value.length <= 500) {
                            setProposedBill(e.target.value);
                            if (errors.proposedBill) {
                              setErrors({ ...errors, proposedBill: "" });
                            }
                          }
                        }}
                        maxLength={500}
                        rows={3}
                        className={`resize-none mt-2 ${
                          errors.proposedBill ? "border-destructive" : ""
                        }`}
                      />
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-xs text-muted-foreground">
                          {proposedBill.length}/500 characters
                        </p>
                        {errors.proposedBill && (
                          <p className="text-xs text-destructive">
                            {errors.proposedBill}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="additional-context" className="text-base">
                        Additional Context (Optional)
                      </Label>
                      <Textarea
                        id="additional-context"
                        placeholder="Anything else this venue should know?"
                        value={additionalContext}
                        onChange={(e) => {
                          if (e.target.value.length <= 500) {
                            setAdditionalContext(e.target.value);
                          }
                        }}
                        maxLength={500}
                        rows={3}
                        className="resize-none mt-2"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {additionalContext.length}/500 characters
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>

            {/* Section 4: Email Preview */}
            <AccordionItem value="email-preview" className="border-white/10">
              <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                Email Preview
              </AccordionTrigger>
              <AccordionContent>
                <Card className="bg-card/50 border-white/10">
                  <CardContent className="pt-6">
                    {!generatedEmail ? (
                      <div className="text-center py-8 space-y-4">
                        <div className="flex justify-center">
                          <div className="rounded-full bg-muted p-4">
                            <Mail className="w-8 h-8 text-muted-foreground" />
                          </div>
                        </div>
                        <p className="text-muted-foreground">
                          Your personalized email will be generated here
                        </p>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div>
                                <Button 
                                  onClick={handleGenerateEmail}
                                  disabled={!proposedDates.trim() || isGenerating}
                                  className="w-full"
                                >
                                  {isGenerating ? (
                                    <>
                                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                      Generating...
                                    </>
                                  ) : (
                                    <>
                                      <Mail className="w-4 h-4 mr-2" />
                                      Generate Email
                                    </>
                                  )}
                                </Button>
                              </div>
                            </TooltipTrigger>
                            {!proposedDates.trim() && (
                              <TooltipContent>
                                <p>Please enter proposed dates first</p>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TooltipProvider>
                        {generationError && (
                          <p className="text-sm text-destructive">{generationError}</p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium">Subject</Label>
                          <Input 
                            value={generatedEmail.subject}
                            disabled
                            className="mt-1 bg-muted"
                          />
                        </div>

                        <div>
                          <Label className="text-sm font-medium">To</Label>
                          <Input 
                            value={generatedEmail.to}
                            disabled
                            className="mt-1 bg-muted"
                          />
                        </div>

                        <div>
                          <Label className="text-sm font-medium">Email Body</Label>
                          <Textarea
                            value={generatedEmail.body}
                            onChange={(e) => setGeneratedEmail({ ...generatedEmail, body: e.target.value })}
                            disabled={!isEditing}
                            rows={12}
                            className={`mt-1 resize-none ${!isEditing ? 'bg-white text-foreground' : ''}`}
                          />
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsEditing(!isEditing)}
                          >
                            {isEditing ? (
                              <>
                                <Check className="w-4 h-4 mr-2" />
                                Done Editing
                              </>
                            ) : (
                              <>
                                <Pencil className="w-4 h-4 mr-2" />
                                Edit Email
                              </>
                            )}
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRegenerateEmail}
                            disabled={isGenerating}
                          >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Regenerate
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCopyToClipboard}
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            Copy to Clipboard
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {generatedEmail && (
            <>
              <Button 
                variant="outline" 
                size="default"
                onClick={handleCopyToClipboard}
                className="w-full sm:w-auto"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Email
              </Button>
              <Button 
                onClick={gmailConnected ? saveToDraftInGmail : handleGmailConnect}
                disabled={savingDraft || checkingGmailConnection}
                className="w-full sm:w-auto"
              >
                {savingDraft ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving to Gmail...
                  </>
                ) : gmailConnected ? (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Save as Gmail Draft
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Connect Gmail to Save Draft
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
