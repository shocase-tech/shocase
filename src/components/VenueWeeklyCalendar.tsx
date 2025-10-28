import { format } from "date-fns";
import { Calendar, Music2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface VenueEvent {
  date: string;
  artists: string;
  time?: string | null;
}

interface VenueWeeklyCalendarProps {
  events: VenueEvent[] | null;
  lastUpdated: string | null;
}

const VenueWeeklyCalendar = ({ events, lastUpdated }: VenueWeeklyCalendarProps) => {
  const hasEvents = events && events.length > 0;

  const formatEventDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return format(date, "EEE, MMM d");
    } catch {
      return dateStr;
    }
  };

  const formatLastUpdated = (timestamp: string | null) => {
    if (!timestamp) return null;
    try {
      const date = new Date(timestamp);
      return format(date, "MMM d, yyyy");
    } catch {
      return null;
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Calendar className="h-6 w-6 text-primary" />
          Upcoming Shows
        </h2>
        {lastUpdated && (
          <p className="text-gray-500 text-xs">
            Updated {formatLastUpdated(lastUpdated)}
          </p>
        )}
      </div>

      {!hasEvents ? (
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="py-12 text-center">
            <Music2 className="h-12 w-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No upcoming shows this week</p>
          </CardContent>
        </Card>
      ) : (
        <Carousel
          opts={{
            align: "start",
            loop: false,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {events.map((event, index) => (
              <CarouselItem key={index} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
                <Card className="bg-gradient-to-br from-gray-900 to-gray-900/50 border-gray-800 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 group">
                  <CardContent className="p-5">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <Music2 className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-semibold text-sm leading-tight">
                            {formatEventDate(event.date)}
                          </p>
                          {event.time && (
                            <p className="text-gray-400 text-xs mt-0.5">
                              {event.time}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="pt-2 border-t border-gray-800">
                        <p className="text-gray-300 text-sm font-medium line-clamp-2">
                          {event.artists}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex -left-12" />
          <CarouselNext className="hidden md:flex -right-12" />
        </Carousel>
      )}
    </section>
  );
};

export default VenueWeeklyCalendar;
