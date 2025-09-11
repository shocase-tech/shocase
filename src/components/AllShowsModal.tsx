import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, MapPin, Ticket, Star, ExternalLink } from "lucide-react";
import { format } from "date-fns";

interface Show {
  venue: string;
  city?: string;
  location?: string;
  date: string;
  ticket_link?: string;
  ticket_url?: string;
  ticketUrl?: string;
  is_highlighted?: boolean;
  featured?: boolean;
}

interface AllShowsModalProps {
  allShows: Show[];
  artistName: string;
  triggerText?: string;
  className?: string;
}

export function AllShowsModal({ 
  allShows, 
  artistName, 
  triggerText = "View All Shows",
  className = ""
}: AllShowsModalProps) {
  // Helper functions to handle field variations
  const getShowLocation = (show: Show) => {
    return show.city || show.location || '';
  };

  const getShowTicketLink = (show: Show) => {
    return show.ticket_link || show.ticket_url || show.ticketUrl || '';
  };

  // Separate and sort shows
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingShows = allShows
    .filter(show => {
      if (!show.date) return false;
      const showDate = new Date(show.date);
      showDate.setHours(0, 0, 0, 0);
      return showDate >= today;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const pastShows = allShows
    .filter(show => {
      if (!show.date) return false;
      const showDate = new Date(show.date);
      showDate.setHours(0, 0, 0, 0);
      return showDate < today;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const formatShowDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'EEEE, MMMM d, yyyy');
    } catch {
      return dateString;
    }
  };

  const ShowCard = ({ show, isPast = false }: { show: Show; isPast?: boolean }) => (
    <div className={`p-4 rounded-lg border transition-all duration-200 ${
      show.is_highlighted || show.featured 
        ? 'bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30' 
        : 'bg-white/5 border-white/10 hover:border-primary/30'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-lg text-foreground">{show.venue}</h3>
            {(show.is_highlighted || show.featured) && (
              <Badge variant="secondary" className="text-xs">
                <Star className="w-3 h-3 mr-1" />
                Featured
              </Badge>
            )}
          </div>
          
          {getShowLocation(show) && (
            <p className="text-muted-foreground flex items-center gap-1 mb-2">
              <MapPin className="w-3 h-3" />
              {getShowLocation(show)}
            </p>
          )}
          
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatShowDate(show.date)}
          </p>
        </div>
      </div>
      
      {!isPast && getShowTicketLink(show) && (
        <Button asChild size="sm" className="w-full mt-3">
          <a
            href={getShowTicketLink(show)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Ticket className="w-4 h-4 mr-2" />
            Get Tickets
            <ExternalLink className="w-3 h-3 ml-1" />
          </a>
        </Button>
      )}
    </div>
  );

  if (allShows.length === 0) {
    return null;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          <Calendar className="w-4 h-4 mr-2" />
          {triggerText}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            All Shows - {artistName}
          </DialogTitle>
          <DialogDescription className="sr-only">
            View all past and upcoming shows for this artist
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-8">
            {/* Upcoming Shows Section */}
            {upcomingShows.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border">
                  <Calendar className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-bold text-foreground">
                    Upcoming Shows ({upcomingShows.length})
                  </h2>
                </div>
                <div className="space-y-3">
                  {upcomingShows.map((show, index) => (
                    <ShowCard key={`upcoming-${index}`} show={show} isPast={false} />
                  ))}
                </div>
              </section>
            )}

            {/* Past Shows Section */}
            {pastShows.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border">
                  <Calendar className="w-5 h-5 text-accent" />
                  <h2 className="text-xl font-bold text-foreground">
                    Past Shows ({pastShows.length})
                  </h2>
                </div>
                <div className="space-y-3">
                  {pastShows.map((show, index) => (
                    <ShowCard key={`past-${index}`} show={show} isPast={true} />
                  ))}
                </div>
              </section>
            )}

            {/* No Shows Message */}
            {upcomingShows.length === 0 && pastShows.length === 0 && (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No shows scheduled at this time.
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}