import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet-async";
import AppHeader from "@/components/AppHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Ticket, Plus, Sparkles, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ShowManagementModal } from "@/components/shows/ShowManagementModal";

interface Show {
  venue: string;
  city: string;
  date: string;
  ticket_link?: string;
  is_highlighted?: boolean;
}

export default function Shows() {
  const [upcomingShows, setUpcomingShows] = useState<Show[]>([]);
  const [pastShows, setPastShows] = useState<Show[]>([]);
  const [selectedShow, setSelectedShow] = useState<Show | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }
    setUser(session.user);
    fetchShows(session.user.id);
  };

  const fetchShows = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("artist_profiles")
        .select("upcoming_shows, past_shows")
        .eq("user_id", userId)
        .single();

      if (error) throw error;

      setUpcomingShows((data?.upcoming_shows as unknown as Show[]) || []);
      setPastShows((data?.past_shows as unknown as Show[]) || []);
    } catch (error: any) {
      toast({
        title: "Error loading shows",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const ShowCard = ({ show, isPast = false }: { show: Show; isPast?: boolean }) => (
    <Card className="hover:shadow-lg transition-all duration-200 group">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
              {show.venue}
            </h3>
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <MapPin className="w-4 h-4" />
              <span>{show.city}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{format(new Date(show.date + 'T00:00:00'), 'EEEE, MMMM d, yyyy')}</span>
            </div>
          </div>
          {show.is_highlighted && (
            <Badge variant="secondary" className="ml-2">Featured</Badge>
          )}
        </div>

        <div className="flex gap-2">
          {!isPast && (
            <Button
              size="sm"
              onClick={() => setSelectedShow(show)}
              className="flex-1"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Manage Show
            </Button>
          )}
          {show.ticket_link && (
            <Button
              size="sm"
              variant="outline"
              asChild
              className="flex-1"
            >
              <a href={show.ticket_link} target="_blank" rel="noopener noreferrer">
                <Ticket className="w-4 h-4 mr-2" />
                Tickets
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Manage Shows - Shocase</title>
        <meta name="description" content="Manage your shows and create marketing content with AI" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
        <AppHeader />
        
        <main className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Your Shows
            </h1>
            <p className="text-muted-foreground text-lg">
              Manage your shows and create AI-powered marketing content
            </p>
          </div>

          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="upcoming">
                Upcoming ({upcomingShows.length})
              </TabsTrigger>
              <TabsTrigger value="past">
                Past ({pastShows.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="mt-6">
              {upcomingShows.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Calendar className="w-16 h-16 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No upcoming shows</h3>
                    <p className="text-muted-foreground mb-4 text-center max-w-md">
                      Add shows to your EPK to start creating marketing content
                    </p>
                    <Button onClick={() => navigate("/epk")}>
                      <Plus className="w-4 h-4 mr-2" />
                      Go to EPK
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {upcomingShows.map((show, index) => (
                    <ShowCard key={index} show={show} isPast={false} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="past" className="mt-6">
              {pastShows.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Calendar className="w-16 h-16 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No past shows</h3>
                    <p className="text-muted-foreground text-center max-w-md">
                      Your performance history will appear here
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {pastShows.map((show, index) => (
                    <ShowCard key={index} show={show} isPast={true} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>

      {selectedShow && (
        <ShowManagementModal
          show={selectedShow}
          open={!!selectedShow}
          onOpenChange={(open) => !open && setSelectedShow(null)}
        />
      )}
    </>
  );
}
