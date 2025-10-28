import { format } from "date-fns";
import { Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    <section>
      <h2 className="text-2xl font-bold text-white mb-4">Upcoming Shows</h2>
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            This Week
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!hasEvents ? (
            <p className="text-gray-400 text-sm py-4">No upcoming shows found.</p>
          ) : (
            <div className="space-y-3">
              {events.map((event, index) => (
                <div
                  key={index}
                  className="border-l-2 border-primary/50 pl-4 py-2 hover:border-primary transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm">
                        {formatEventDate(event.date)}
                        {event.time && (
                          <span className="text-gray-400 font-normal ml-2">
                            • {event.time}
                          </span>
                        )}
                      </p>
                      <p className="text-gray-300 text-sm mt-1 truncate">
                        {event.artists}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {lastUpdated && (
            <p className="text-gray-500 text-xs mt-4 pt-3 border-t border-gray-800">
              Last updated: {formatLastUpdated(lastUpdated)}
            </p>
          )}
        </CardContent>
      </Card>
    </section>
  );
};

export default VenueWeeklyCalendar;
