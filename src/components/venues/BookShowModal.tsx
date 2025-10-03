import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface BookShowModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: any;
  venue: any;
  artistProfile: any;
  onSuccess: () => void;
}

export default function BookShowModal({
  isOpen,
  onClose,
  application,
  venue,
  artistProfile,
  onSuccess,
}: BookShowModalProps) {
  const [showDate, setShowDate] = useState<Date | undefined>(undefined);
  const [addToEPK, setAddToEPK] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleConfirm = async () => {
    if (!showDate) {
      toast({
        title: "Date required",
        description: "Please select a show date",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);

      // 1. Update venue_applications
      const { error: updateError } = await supabase
        .from("venue_applications")
        .update({
          status: "booked",
          booked_at: new Date().toISOString(),
          show_date: showDate.toISOString().split("T")[0],
        })
        .eq("id", application.id);

      if (updateError) throw updateError;

      // 2. Add to EPK if checkbox is checked
      if (addToEPK && artistProfile) {
        const upcomingShows = artistProfile.upcoming_shows || [];
        const newShow = {
          venue: venue.name,
          city: venue.city,
          state: venue.state,
          date: showDate.toISOString().split("T")[0],
        };

        const { error: profileError } = await supabase
          .from("artist_profiles")
          .update({
            upcoming_shows: [...upcomingShows, newShow],
          })
          .eq("id", artistProfile.id);

        if (profileError) throw profileError;
      }

      toast({
        title: "Show booked!",
        description: addToEPK
          ? "Added to your EPK."
          : "Successfully booked the show.",
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error booking show:", error);
      toast({
        title: "Error",
        description: "Failed to book show: " + error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-background border-white/10">
        <DialogHeader>
          <DialogTitle>Book Show at {venue?.name}</DialogTitle>
          <p className="text-sm text-muted-foreground">
            {venue?.city}, {venue?.state}
          </p>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label className="mb-2 block">Show Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !showDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {showDate ? format(showDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={showDate}
                  onSelect={setShowDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="add-to-epk"
              checked={addToEPK}
              onCheckedChange={(checked) => setAddToEPK(checked as boolean)}
            />
            <Label
              htmlFor="add-to-epk"
              className="text-sm font-normal cursor-pointer"
            >
              Add this show to my EPK's upcoming shows
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Booking...
              </>
            ) : (
              "Confirm Booking"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
