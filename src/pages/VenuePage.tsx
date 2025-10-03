import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, MapPin, Users, ExternalLink, Instagram, Globe, Check, Lock } from "lucide-react";
import { Helmet } from "react-helmet-async";
import BookVenueModal from "@/components/venues/BookVenueModal";

interface Venue {
  id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  state: string;
  neighbourhood: string | null;
  capacity: number | null;
  description: string | null;
  genres: string[] | null;
  venue_type: string | null;
  hero_image_url: string | null;
  gallery_images: string[] | null;
  website_url: string | null;
  instagram_handle: string | null;
  facebook_url: string | null;
  booking_contact_email: string | null;
  booking_guidelines: string | null;
  typical_guarantee: string | null;
  typical_door_split: string | null;
  backline_details: string | null;
  venue_notes: string | null;
  requirements: any;
}

const VenuePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [artistProfile, setArtistProfile] = useState<any | null>(null);
  const [outreachComponents, setOutreachComponents] = useState<any | null>(null);
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await fetchArtistProfile(session.user.id);
        await fetchOutreachComponents(session.user.id);
      }
    };

    if (slug) {
      fetchVenue(slug);
      checkAuth();
    }
  }, [slug]);

  const fetchVenue = async (venueSlug: string) => {
    try {
      const { data, error } = await supabase
        .from("venues" as any)
        .select("*")
        .eq("slug", venueSlug)
        .eq("is_active", true)
        .single();

      if (error || !data) {
        setNotFound(true);
      } else {
        setVenue(data as unknown as Venue);
      }
    } catch (error) {
      console.error("Error fetching venue:", error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchArtistProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("artist_profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching artist profile:", error);
        return;
      }

      setArtistProfile(data);
    } catch (error) {
      console.error("Error fetching artist profile:", error);
    }
  };

  const fetchOutreachComponents = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("outreach_components")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching outreach components:", error);
        return;
      }

      setOutreachComponents(data);
    } catch (error) {
      console.error("Error fetching outreach components:", error);
    }
  };

  const handleBookVenue = () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to apply to venues",
      });
      navigate("/auth");
      return;
    }

    if (!artistProfile) {
      toast({
        title: "EPK required",
        description: "Please create your EPK first before applying to venues",
      });
      navigate("/dashboard");
      return;
    }

    setBookModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Skeleton className="w-full h-[50vh]" />
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (notFound || !venue) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Helmet>
          <title>Venue Not Found - SHOCASE</title>
        </Helmet>
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Venue Not Found</h1>
          <p className="text-gray-400 mb-6">The venue you're looking for doesn't exist.</p>
          <Button onClick={() => navigate("/venues")}>
            Back to Venues
          </Button>
        </div>
      </div>
    );
  }

  const fullLocation = [venue.neighbourhood, venue.city, venue.state].filter(Boolean).join(", ");

  return (
    <>
      <Helmet>
        <title>{venue.name} - SHOCASE</title>
        <meta name="description" content={venue.description || `Book ${venue.name} in ${venue.city}`} />
      </Helmet>

      <div className="min-h-screen bg-gray-950">
        {/* Sticky Header */}
        <header className="sticky top-0 z-40 bg-gray-950/95 backdrop-blur-sm border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/venues")}
                className="text-gray-400 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <h1 className="text-lg font-semibold text-white truncate max-w-md">
                {venue.name}
              </h1>
            </div>
            <Button 
              onClick={handleBookVenue}
              className="relative bg-primary hover:bg-primary/90"
            >
              Book This Venue
            </Button>
          </div>
        </header>

        {/* Hero Section */}
        <div className="relative h-[50vh] overflow-hidden">
          {venue.hero_image_url ? (
            <img
              src={venue.hero_image_url}
              alt={venue.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
              <MapPin className="h-24 w-24 text-gray-600" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/70 to-transparent" />
          
          {/* Hero Content */}
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-wrap gap-2 mb-4">
                {venue.venue_type && (
                  <Badge variant="secondary">{venue.venue_type}</Badge>
                )}
                {venue.genres?.slice(0, 3).map(genre => (
                  <Badge key={genre} variant="outline" className="border-gray-600">
                    {genre}
                  </Badge>
                ))}
              </div>
              <h1 className="text-5xl font-bold text-white mb-4">{venue.name}</h1>
              <div className="flex flex-wrap gap-4 text-gray-300">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  <span>{fullLocation}</span>
                </div>
                {venue.capacity && (
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    <span>Capacity: {venue.capacity}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
          {/* About Section */}
          {venue.description && (
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">About</h2>
              <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                {venue.description}
              </p>
            </section>
          )}

          {/* Booking Info Section */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-6">Booking Information</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {/* What We're Looking For */}
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">What We're Looking For</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {venue.genres && venue.genres.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-400 mb-2">Genres</p>
                      <div className="flex flex-wrap gap-2">
                        {venue.genres.map(genre => (
                          <Badge key={genre} variant="outline" className="border-gray-700">
                            {genre}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {venue.venue_type && (
                    <div>
                      <p className="text-sm text-gray-400 mb-2">Venue Type</p>
                      <p className="text-white">{venue.venue_type}</p>
                    </div>
                  )}
                  {venue.booking_guidelines && (
                    <div>
                      <p className="text-sm text-gray-400 mb-2">Guidelines</p>
                      <p className="text-gray-300 text-sm">{venue.booking_guidelines}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Typical Deal */}
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Typical Deal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {venue.typical_guarantee && (
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Guarantee</p>
                      <p className="text-white font-medium">{venue.typical_guarantee}</p>
                    </div>
                  )}
                  {venue.typical_door_split && (
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Door Split</p>
                      <p className="text-white font-medium">{venue.typical_door_split}</p>
                    </div>
                  )}
                  {!venue.typical_guarantee && !venue.typical_door_split && (
                    <p className="text-gray-400 text-sm">Contact venue for deal specifics</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Requirements Section */}
          {(venue.backline_details || venue.venue_notes || venue.requirements) && (
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Requirements & Notes</h2>
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="pt-6 space-y-4">
                  {venue.backline_details && (
                    <div className="flex gap-3">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-white font-medium">Backline</p>
                        <p className="text-gray-400 text-sm">{venue.backline_details}</p>
                      </div>
                    </div>
                  )}
                  {venue.venue_notes && (
                    <div className="flex gap-3">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-white font-medium">Additional Notes</p>
                        <p className="text-gray-400 text-sm">{venue.venue_notes}</p>
                      </div>
                    </div>
                  )}
                  {venue.requirements && typeof venue.requirements === 'object' && (
                    Object.entries(venue.requirements).map(([key, value]) => (
                      <div key={key} className="flex gap-3">
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-white font-medium capitalize">{key.replace(/_/g, ' ')}</p>
                          <p className="text-gray-400 text-sm">{String(value)}</p>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </section>
          )}

          {/* Gallery Section */}
          {venue.gallery_images && venue.gallery_images.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Gallery</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {venue.gallery_images.map((image, index) => (
                  <div
                    key={index}
                    className="aspect-square rounded-lg overflow-hidden bg-gray-800"
                  >
                    <img
                      src={image}
                      alt={`${venue.name} gallery ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Contact Section */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Contact & Links</h2>
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="pt-6 space-y-3">
                {venue.booking_contact_email && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800 hover:bg-gray-750 transition-colors">
                    <span className="text-gray-400">Booking Email</span>
                    <a
                      href={`mailto:${venue.booking_contact_email}`}
                      className="text-white hover:text-gray-300 font-medium"
                    >
                      {venue.booking_contact_email}
                    </a>
                  </div>
                )}
                {venue.website_url && (
                  <a
                    href={venue.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-800 hover:bg-gray-750 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Globe className="h-5 w-5 text-gray-400" />
                      <span className="text-white">Website</span>
                    </div>
                    <ExternalLink className="h-4 w-4 text-gray-400" />
                  </a>
                )}
                {venue.instagram_handle && (
                  <a
                    href={`https://instagram.com/${venue.instagram_handle.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-800 hover:bg-gray-750 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Instagram className="h-5 w-5 text-gray-400" />
                      <span className="text-white">Instagram</span>
                    </div>
                    <ExternalLink className="h-4 w-4 text-gray-400" />
                  </a>
                )}
                {venue.facebook_url && (
                  <a
                    href={venue.facebook_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-800 hover:bg-gray-750 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Globe className="h-5 w-5 text-gray-400" />
                      <span className="text-white">Facebook</span>
                    </div>
                    <ExternalLink className="h-4 w-4 text-gray-400" />
                  </a>
                )}
              </CardContent>
            </Card>
          </section>
        </div>

        {/* Book Venue Modal */}
        {venue && artistProfile && (
          <BookVenueModal
            isOpen={bookModalOpen}
            onClose={() => setBookModalOpen(false)}
            venue={venue}
            artistProfile={artistProfile}
            outreachComponents={outreachComponents}
          />
        )}
      </div>
    </>
  );
};

export default VenuePage;
