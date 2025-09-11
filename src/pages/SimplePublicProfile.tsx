import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Instagram, Globe, Music, MapPin, Calendar, Ticket, Download, Mail, Phone, Star, Quote, Play, Users, Award, TrendingUp, User as UserIcon, Users2, Guitar, ChevronLeft, ChevronRight } from "lucide-react";
import spotifyColorIcon from "@/assets/streaming/spotify-color.png";
import spotifyLightIcon from "@/assets/streaming/spotify-light.png";
import soundcloudColorIcon from "@/assets/streaming/soundcloud-color.png";
import soundcloudLightIcon from "@/assets/streaming/soundcloud-light.png";
import bandcampColorIcon from "@/assets/streaming/bandcamp-color.png";
import bandcampLightIcon from "@/assets/streaming/bandcamp-light.png";
import appleMusicColorIcon from "@/assets/streaming/apple-music-color.svg";
import appleMusicLightIcon from "@/assets/streaming/apple-music-light.svg";
import PublicImage from "@/components/PublicImage";
import { Skeleton } from "@/components/ui/skeleton";

interface SimpleProfile {
  id: string;
  artist_name: string;
  bio: string | null;
  genre: string | null;
  profile_photo_url: string | null;
  hero_photo_url: string | null;
  social_links: any;
  is_published: boolean;
  show_videos: any;
  gallery_photos: { url: string; label?: string }[] | string[] | any;
  press_quotes: any;
  press_mentions: any;
  streaming_links: any;
  past_shows: any;
  upcoming_shows: any;
  contact_info: any;
  blurb?: string;
  performance_type?: string;
  location?: string;
  spotify_track_url?: string;
}

export default function SimplePublicProfile() {
  const { identifier } = useParams<{ identifier: string }>();
  const [profile, setProfile] = useState<SimpleProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isOwnerPreview, setIsOwnerPreview] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!identifier) {
        setError("No profile identifier provided");
        setLoading(false);
        return;
      }

      try {
        console.log("Fetching profile for identifier:", identifier);
        
        // Try by URL slug first
        let { data, error: queryError } = await supabase
          .from('artist_profiles')
          .select('*')
          .eq('is_published', true)
          .eq('url_slug', identifier)
          .maybeSingle();

        // If not found, try by ID
        if (!data && !queryError) {
          const result = await supabase
            .from('artist_profiles')
            .select('*')
            .eq('is_published', true)
            .eq('id', identifier)
            .maybeSingle();
          
          data = result.data;
          queryError = result.error;
        }

        console.log("Query result:", { data, error: queryError });

        if (queryError) {
          console.error("Database error:", queryError);
          setError("Database error occurred");
          setLoading(false);
          return;
        }

        if (!data) {
          // If no published profile found and user is authenticated, try to get their own unpublished profile
          if (user) {
            console.log("No published profile found, checking if this is owner's unpublished profile");
            
            // First try by url_slug
            let { data: userProfile, error: userError } = await supabase
              .from('artist_profiles')
              .select('*')
              .eq('user_id', user.id)
              .eq('url_slug', identifier)
              .maybeSingle();

            // If not found by slug, try by ID
            if (!userProfile && !userError) {
              const result = await supabase
                .from('artist_profiles')
                .select('*')
                .eq('user_id', user.id)
                .eq('id', identifier)
                .maybeSingle();
              
              userProfile = result.data;
              userError = result.error;
            }

            if (!userError && userProfile) {
              console.log("Owner viewing unpublished profile:", userProfile.artist_name);
              setProfile(userProfile);
              setIsOwnerPreview(true);
              setError(null);
              setLoading(false);
              return;
            }
          }
          
          console.log("No profile found");
          setError("Profile not found or not published");
          setLoading(false);
          return;
        }

        console.log("Profile found successfully:", data);
        setProfile(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile");
        setLoading(false);
      }
    };

    fetchProfile();
  }, [identifier, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-dark">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <Skeleton className="h-64 w-full rounded-lg mb-8" />
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
            <Music className="w-12 h-12 text-red-400" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-4">Profile Not Available</h1>
          <p className="text-lg text-muted-foreground mb-8">
            {error || "This artist's profile is not available or has not been published"}
          </p>
          <Button asChild variant="default">
            <a href="/">← Back to Home</a>
          </Button>
        </div>
      </div>
    );
  }

  const socialLinks = profile.social_links || {};

  // Parse genre from JSON array, comma-separated string, or array
  let genreArray: string[] = [];
  try {
    if (Array.isArray(profile.genre)) {
      genreArray = profile.genre;
    } else if (typeof profile.genre === 'string') {
      // Try to parse as JSON first
      try {
        const parsed = JSON.parse(profile.genre);
        genreArray = Array.isArray(parsed) ? parsed : [profile.genre];
      } catch {
        // If not JSON, split by comma
        genreArray = profile.genre.split(',').map(g => g.trim()).filter(Boolean);
      }
    }
  } catch (error) {
    console.error('Error parsing genre:', error);
    genreArray = [];
  }

  // Helper functions to handle field variations
  const getShowLocation = (show: any) => {
    return show.city || show.location || '';
  };

  const getShowTicketLink = (show: any) => {
    return show.ticket_link || show.ticket_url || show.ticketUrl || '';
  };

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Owner Preview Banner */}
      {isOwnerPreview && !profile.is_published && (
        <div className="bg-yellow-600/90 backdrop-blur-sm border-b border-yellow-500/50 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-center gap-3 text-yellow-100">
              <Star className="w-5 h-5" />
              <span className="font-medium">
                Preview Mode - This EPK is not published yet. Only you can see this page.
              </span>
              <Star className="w-5 h-5" />
            </div>
          </div>
        </div>
      )}
      
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        {profile.hero_photo_url && (
          <div className="absolute inset-0">
            <PublicImage
              storagePath={profile.hero_photo_url}
              alt={`${profile.artist_name} hero`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/95"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/60"></div>
          </div>
        )}
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-accent/20 rounded-full blur-2xl animate-pulse delay-1000"></div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center mb-8">
            <Music className="w-16 h-16 text-primary mr-4" />
            <Star className="w-12 h-12 text-accent animate-pulse" />
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold gradient-text mb-6">
            {profile.artist_name}
          </h1>
          
          {genreArray && genreArray.length > 0 && (
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {genreArray.filter(Boolean).map((genre: string, index: number) => (
                <Badge key={index} variant="secondary" className="text-lg px-4 py-2">
                  {genre}
                </Badge>
              ))}
            </div>
          )}

          {/* Streaming Icons */}
          {profile.streaming_links && Object.keys(profile.streaming_links).length > 0 && (
            <div className="flex justify-center gap-6 mb-8">
              {profile.streaming_links.spotify && (
                <a 
                  href={profile.streaming_links.spotify} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:scale-110 transition-transform duration-300"
                >
                  <img src={spotifyColorIcon} alt="Spotify" className="w-8 h-8" />
                </a>
              )}
              {profile.streaming_links.soundcloud && (
                <a 
                  href={profile.streaming_links.soundcloud} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:scale-110 transition-transform duration-300"
                >
                  <img src={soundcloudColorIcon} alt="SoundCloud" className="w-8 h-8" />
                </a>
              )}
              {profile.streaming_links.bandcamp && (
                <a 
                  href={profile.streaming_links.bandcamp} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:scale-110 transition-transform duration-300"
                >
                  <img src={bandcampColorIcon} alt="Bandcamp" className="w-8 h-8" />
                </a>
              )}
              {profile.streaming_links.appleMusic && (
                <a 
                  href={profile.streaming_links.appleMusic} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:scale-110 transition-transform duration-300"
                >
                  <img src={appleMusicColorIcon} alt="Apple Music" className="w-8 h-8" />
                </a>
              )}
            </div>
          )}

          {profile.blurb && (
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-4xl mx-auto leading-relaxed">
              {profile.blurb}
            </p>
          )}

          {/* CTA Buttons */}
          <div className={`flex flex-col sm:flex-row gap-6 ${!profile.spotify_track_url ? 'justify-center' : 'justify-center'} items-center`}>
            {profile.contact_info && (profile.contact_info as any).email && (
              <Button variant="hero" size="lg" asChild className="group">
                <a href={`mailto:${(profile.contact_info as any).email}`}>
                  <Mail className="w-5 h-5 mr-2" />
                  Book Now
                  <Star className="w-5 h-5 ml-2 group-hover:animate-spin" />
                </a>
              </Button>
            )}
            
            {profile.spotify_track_url && (
              <Button 
                variant="glass" 
                size="lg" 
                className="group" 
                onClick={() => {
                  const spotifySection = document.getElementById('spotify-player');
                  if (spotifySection) {
                    spotifySection.scrollIntoView({ behavior: 'smooth' });
                    // Attempt to trigger play (limited by browser autoplay policies)
                    const iframe = spotifySection.querySelector('iframe') as HTMLIFrameElement;
                    if (iframe) {
                      // Spotify embed doesn't support programmatic play, but we can at least scroll to it
                      setTimeout(() => {
                        iframe.focus();
                      }, 1000);
                    }
                  }
                }}
              >
                <Play className="w-5 h-5 mr-2" />
                Listen Now
              </Button>
            )}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Key Stats Section */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          <Card className="glass-card border-glass text-center p-6">
            <CardContent className="p-0">
              <Users className="w-8 h-8 text-primary mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-foreground">Live</h3>
              <p className="text-sm text-muted-foreground">Performance Ready</p>
            </CardContent>
          </Card>
          
          <Card className="glass-card border-glass text-center p-6">
            <CardContent className="p-0">
              <MapPin className="w-8 h-8 text-accent mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-foreground">{profile.location || 'Location'}</h3>
              <p className="text-sm text-muted-foreground">Based</p>
            </CardContent>
          </Card>
          
          <Card className="glass-card border-glass text-center p-6">
            <CardContent className="p-0">
              <TrendingUp className="w-8 h-8 text-primary mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-foreground">
                {(() => {
                  if (!profile.upcoming_shows || !Array.isArray(profile.upcoming_shows)) return '0';
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  return profile.upcoming_shows.filter((show: any) => {
                    if (!show.date) return false;
                    const showDate = new Date(show.date);
                    showDate.setHours(0, 0, 0, 0);
                    return showDate >= today;
                  }).length;
                })()}
              </h3>
              <p className="text-sm text-muted-foreground">Upcoming shows</p>
            </CardContent>
          </Card>
          
          <Card className="glass-card border-glass text-center p-6">
            <CardContent className="p-0">
              {profile.performance_type === 'Solo Act' && <UserIcon className="w-8 h-8 text-accent mx-auto mb-2" />}
              {profile.performance_type === 'Duo' && <Users2 className="w-8 h-8 text-accent mx-auto mb-2" />}
              {profile.performance_type === 'Full Band' && <Guitar className="w-8 h-8 text-accent mx-auto mb-2" />}
              {(!profile.performance_type || (profile.performance_type !== 'Solo Act' && profile.performance_type !== 'Duo' && profile.performance_type !== 'Full Band')) && <Users className="w-8 h-8 text-accent mx-auto mb-2" />}
              <h3 className="text-2xl font-bold text-foreground">
                {profile.performance_type === 'Solo Act' ? 'Solo Act' : 
                 profile.performance_type === 'Duo' ? 'Duo' :
                 profile.performance_type === 'Full Band' ? 'Full Band' : 
                 profile.performance_type || 'Artist'}
              </h3>
              <p className="text-sm text-muted-foreground">Performance Type</p>
            </CardContent>
          </Card>
        </section>

        {/* Spotify Track Section */}
        {profile.spotify_track_url && (
          <section id="spotify-player" className="mb-16">
            <div className="w-full">
              <iframe
                src={profile.spotify_track_url.replace('open.spotify.com/track/', 'open.spotify.com/embed/track/')}
                width="100%"
                height="152"
                frameBorder="0"
                allowTransparency={true}
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                className="rounded-xl shadow-lg"
              />
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Videos Section */}
            {profile.show_videos && profile.show_videos.length > 0 && (
              <section id="videos" className="glass-card border-glass p-8 rounded-xl">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <Play className="w-8 h-8 text-primary" />
                  Live Performance Videos
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {profile.show_videos.map((video, index) => (
                    <div key={index} className="aspect-video rounded-lg overflow-hidden bg-black/20 shadow-lg hover:shadow-xl transition-all duration-300">
                      <iframe
                        src={video.replace('watch?v=', 'embed/')}
                        className="w-full h-full"
                        frameBorder="0"
                        allowFullScreen
                        title={`${profile.artist_name} performance ${index + 1}`}
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Bio Section */}
            {profile.bio && (
              <section className="glass-card border-glass p-8 rounded-xl">
                <h2 className="text-3xl font-bold mb-6">Artist Biography</h2>
                <p className="text-muted-foreground leading-relaxed text-lg">{profile.bio}</p>
              </section>
            )}

            {/* Gallery Photos - Full Width */}
            {profile.gallery_photos && profile.gallery_photos.length > 0 && (
              <section className="w-full">
                <h2 className="text-3xl font-bold mb-6 text-center">Photo Gallery</h2>
                <GallerySlideshow photos={profile.gallery_photos} artistName={profile.artist_name} />
              </section>
            )}

            {/* Press Sections - Side by Side with Responsive Layout */}
            {((profile.press_quotes && Array.isArray(profile.press_quotes) && profile.press_quotes.length > 0) || 
              (profile.press_mentions && Array.isArray(profile.press_mentions) && profile.press_mentions.length > 0)) && (
              <div className={`grid gap-8 ${
                (profile.press_quotes && Array.isArray(profile.press_quotes) && profile.press_quotes.length > 0) && 
                (profile.press_mentions && Array.isArray(profile.press_mentions) && profile.press_mentions.length > 0)
                  ? 'grid-cols-1 lg:grid-cols-2' 
                  : 'grid-cols-1'
              }`}>
                {/* Press Quotes */}
                {profile.press_quotes && Array.isArray(profile.press_quotes) && profile.press_quotes.length > 0 && (
                  <section className="glass-card border-glass p-8 rounded-xl">
                    <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                      <Quote className="w-8 h-8 text-accent" />
                      Press & Reviews
                    </h2>
                    <div className="space-y-6">
                      {profile.press_quotes.map((quote: any, index: number) => (
                        <blockquote key={index} className="border-l-4 border-primary pl-6 bg-white/5 p-6 rounded-r-lg hover:shadow-glow transition-all duration-300">
                          <p className="italic text-xl mb-4 leading-relaxed">"{quote.text}"</p>
                          <cite className="text-lg font-bold text-primary">— {quote.source}</cite>
                        </blockquote>
                      ))}
                    </div>
                  </section>
                )}

                {/* Press Mentions */}
                {profile.press_mentions && Array.isArray(profile.press_mentions) && profile.press_mentions.length > 0 && (
                  <section className="glass-card border-glass p-8 rounded-xl">
                    <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                      <ExternalLink className="w-8 h-8 text-accent" />
                      Press Coverage
                    </h2>
                    <div className="space-y-4">
                      {profile.press_mentions.map((mention: any, index: number) => (
                        <div key={index} className="bg-white/5 p-6 rounded-lg hover:bg-white/10 transition-all duration-300">
                          <h3 className="text-xl font-bold text-foreground mb-2">{mention.title}</h3>
                          <p className="text-muted-foreground mb-3">{mention.description}</p>
                          <div className="flex items-center gap-3">
                            <span className="text-primary font-medium">{mention.source}</span>
                            {mention.url && (
                              <Button variant="outline" size="sm" asChild>
                                <a href={mention.url} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="w-4 h-4 mr-2" />
                                  Read More
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}

          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Connect Section */}
            <Card className="glass-card border-glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Globe className="w-6 h-6 text-primary" />
                  Connect
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center gap-6">
                  {socialLinks.website && (
                    <a 
                      href={socialLinks.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:scale-110 transition-transform duration-300"
                    >
                      <Globe className="w-10 h-10 text-primary hover:text-accent" />
                    </a>
                  )}
                  {socialLinks.instagram && (
                    <a 
                      href={socialLinks.instagram} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:scale-110 transition-transform duration-300"
                    >
                      <Instagram className="w-10 h-10 text-primary hover:text-accent" />
                    </a>
                  )}
                  {socialLinks.tiktok && (
                    <a 
                      href={socialLinks.tiktok} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:scale-110 transition-transform duration-300"
                    >
                      <Play className="w-10 h-10 text-primary hover:text-accent" />
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Featured Shows */}
            {profile.upcoming_shows && Array.isArray(profile.upcoming_shows) && profile.upcoming_shows.filter((show: any) => show.featured).length > 0 && (
              <Card className="glass-card border-glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Star className="w-6 h-6 text-accent" />
                    Featured Shows
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profile.upcoming_shows.filter((show: any) => show.featured).map((show: any, index: number) => (
                    <div key={index} className="bg-gradient-to-r from-primary/20 to-accent/20 p-4 rounded-lg border border-primary/30">
                      <h3 className="font-bold text-lg mb-2 text-primary">{show.venue}</h3>
                      <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <MapPin className="w-4 h-4" />
                        <span>{getShowLocation(show)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground mb-3">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(show.date).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}</span>
                      </div>
                      {getShowTicketLink(show) && (
                        <Button variant="default" size="sm" asChild className="w-full">
                          <a href={getShowTicketLink(show)} target="_blank" rel="noopener noreferrer">
                            <Ticket className="w-4 h-4 mr-2" />
                            Get Tickets
                          </a>
                        </Button>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Upcoming Shows */}
            {profile.upcoming_shows && Array.isArray(profile.upcoming_shows) && profile.upcoming_shows.length > 0 && (
              <Card className="glass-card border-glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Calendar className="w-6 h-6 text-primary" />
                    Upcoming Shows
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profile.upcoming_shows
                    .filter((show: any) => !show.featured)
                    .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .slice(0, 2)
                    .map((show: any, index: number) => (
                    <div key={index} className="bg-white/5 p-4 rounded-lg">
                      <h3 className="font-bold text-lg mb-2">{show.venue}</h3>
                      <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <MapPin className="w-4 h-4" />
                        <span>{getShowLocation(show)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground mb-3">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(show.date).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}</span>
                      </div>
                      {getShowTicketLink(show) && (
                        <Button variant="outline" size="sm" asChild className="w-full">
                          <a href={getShowTicketLink(show)} target="_blank" rel="noopener noreferrer">
                            <Ticket className="w-4 h-4 mr-2" />
                            Get Tickets
                          </a>
                        </Button>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Recent Shows */}
            {profile.past_shows && Array.isArray(profile.past_shows) && profile.past_shows.length > 0 && (
              <Card className="glass-card border-glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Users className="w-6 h-6 text-accent" />
                    Recent Shows
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {profile.past_shows
                    .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(0, 2)
                    .map((show: any, index: number) => (
                    <div key={index} className="bg-white/5 p-3 rounded-lg">
                      <h4 className="font-medium text-foreground">{show.venue}</h4>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {getShowLocation(show)}
                      </p>
                      <p className="text-xs text-muted-foreground">{new Date(show.date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}



            {/* Contact Info */}
            {profile.contact_info && (
              <Card className="glass-card border-glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Mail className="w-6 h-6 text-primary" />
                    Booking Contact
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {(profile.contact_info as any).email && (
                    <Button variant="default" size="sm" asChild className="w-full">
                      <a href={`mailto:${(profile.contact_info as any).email}`}>
                        <Mail className="w-4 h-4 mr-2" />
                        Book This Artist
                      </a>
                    </Button>
                  )}
                  {(profile.contact_info as any).phone && (
                    <Button variant="outline" size="sm" asChild className="w-full">
                      <a href={`tel:${(profile.contact_info as any).phone}`}>
                        <Phone className="w-4 h-4 mr-2" />
                        {(profile.contact_info as any).phone}
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Gallery Slideshow Component
function GallerySlideshow({ photos, artistName }: { photos: any[], artistName: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying || photos.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % photos.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, photos.length]);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + photos.length) % photos.length);
    setIsAutoPlaying(false);
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % photos.length);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  if (!photos || photos.length === 0) return null;

  const currentPhoto = photos[currentIndex];

  return (
    <div className="relative">
      {/* Main Slideshow */}
      <div className="relative aspect-video rounded-xl overflow-hidden shadow-2xl max-w-none w-full">
        <PublicImage
          storagePath={typeof currentPhoto === 'string' ? currentPhoto : currentPhoto.url}
          alt={`${artistName} gallery photo ${currentIndex + 1}`}
          className="w-full h-full object-contain bg-black/10"
        />
        
        {/* Navigation Buttons */}
        {photos.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-300 hover:scale-110"
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-300 hover:scale-110"
              aria-label="Next photo"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Auto-play indicator */}
        {isAutoPlaying && photos.length > 1 && (
          <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
            Auto-playing
          </div>
        )}

        {/* Caption */}
        {currentPhoto.label && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
            <p className="text-white text-lg font-medium">{currentPhoto.label}</p>
          </div>
        )}
      </div>

      {/* Thumbnail Navigation */}
      {photos.length > 1 && (
        <div className="flex justify-center gap-2 mt-6 overflow-x-auto pb-2">
          {photos.map((photo, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`flex-shrink-0 relative aspect-square w-16 h-16 rounded-lg overflow-hidden transition-all duration-300 ${
                index === currentIndex 
                  ? 'ring-2 ring-primary shadow-lg scale-110' 
                  : 'opacity-60 hover:opacity-100'
              }`}
            >
              <PublicImage
                storagePath={typeof photo === 'string' ? photo : photo.url}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Controls */}
      {photos.length > 1 && (
        <div className="flex justify-center items-center gap-4 mt-4">
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {isAutoPlaying ? 'Pause' : 'Play'} Slideshow
          </button>
          <span className="text-muted-foreground text-sm">
            {currentIndex + 1} of {photos.length}
          </span>
        </div>
      )}
    </div>
  );
}