import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Instagram, Globe, Music, MapPin, Calendar, Ticket, Download, Mail, Phone, Star, Quote, Play, Users, Award, TrendingUp } from "lucide-react";
import PublicImage from "@/components/PublicImage";
import { Skeleton } from "@/components/ui/skeleton";

type PublicArtistProfile = {
  id: string;
  artist_name: string;
  bio: string | null;
  genre: string | null;
  social_links: any;
  profile_photo_url: string | null;
  press_photos: string[] | null;
  hero_photo_url: string | null;
  show_videos: string[] | null;
  gallery_photos: (string | { url: string; caption?: string })[] | null;
  press_quotes: any;
  press_mentions: any;
  streaming_links: any;
  playlists: string[] | null;
  past_shows: any;
  upcoming_shows: any;
  contact_info: any;
  created_at: string;
  updated_at: string;
  is_published: boolean;
  url_slug: string;
};

export default function PublicArtistProfile() {
  const { identifier } = useParams<{ identifier: string }>();
  const [profile, setProfile] = useState<PublicArtistProfile | null>(null);
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
        console.log("No identifier provided");
        setError("No artist identifier provided");
        setLoading(false);
        return;
      }

      console.log("Fetching profile for identifier:", identifier);

      try {
        console.log("Making RPC call with identifier:", identifier);
        
        // First try to get published profile
        const { data, error } = await supabase
          .rpc("get_public_artist_profile", { profile_identifier: identifier });

        console.log("RPC response:", { data, error, identifier, dataLength: data?.length });

        if (error) {
          console.error("RPC error:", error);
          setError("Failed to load artist profile");
          return;
        }

        if (data && data.length > 0) {
          const profileData = data[0] as PublicArtistProfile;
          console.log("Published profile loaded:", { artistName: profileData.artist_name });
          setProfile(profileData);
          setError(null);
          return;
        }

        // If no published profile found and user is authenticated, try to get their own unpublished profile
        if (user) {
          console.log("No published profile found, checking if this is owner's unpublished profile");
          const { data: userProfile, error: userError } = await supabase
            .from('artist_profiles')
            .select('*')
            .eq('user_id', user.id)
            .or(`id.eq.${identifier},url_slug.eq.${identifier}`)
            .single();

          if (!userError && userProfile) {
            console.log("Owner viewing unpublished profile:", userProfile.artist_name);
            setProfile(userProfile as PublicArtistProfile);
            setIsOwnerPreview(true);
            setError(null);
            return;
          }
        }

        console.log("No profile found for identifier:", identifier);
        setError("This artist's profile is not available or has not been published");
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to load artist profile");
      } finally {
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

  // Parse genre from comma-separated string or array
  const genreArray = Array.isArray(profile.genre) 
    ? profile.genre 
    : profile.genre 
      ? profile.genre.split(',').map(g => g.trim()).filter(Boolean)
      : [];

  return (
    <>
      <Helmet>
        <title>{profile.artist_name} - Electronic Press Kit | SHOCASE</title>
        <meta name="description" content={profile.bio ? profile.bio.substring(0, 160) : `${profile.artist_name} - Professional artist press kit featuring music, videos, gallery, and booking information.`} />
        <meta property="og:title" content={`${profile.artist_name} - Electronic Press Kit`} />
        <meta property="og:description" content={profile.bio ? profile.bio.substring(0, 160) : `${profile.artist_name} press kit`} />
        <meta property="og:image" content={profile.hero_photo_url || profile.profile_photo_url || ''} />
        <meta property="og:type" content="profile" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${profile.artist_name} - Electronic Press Kit`} />
        <meta name="twitter:description" content={profile.bio ? profile.bio.substring(0, 160) : `${profile.artist_name} press kit`} />
        <meta name="twitter:image" content={profile.hero_photo_url || profile.profile_photo_url || ''} />
        <link rel="canonical" href={`${window.location.origin}/artist/${profile.url_slug || profile.id}`} />
      </Helmet>

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

            {profile.bio && (
              <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-4xl mx-auto leading-relaxed">
                {profile.bio.length > 200 ? `${profile.bio.substring(0, 200)}...` : profile.bio}
              </p>
            )}

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              {profile.contact_info && (profile.contact_info as any).email && (
                <Button variant="hero" size="lg" asChild className="group">
                  <a href={`mailto:${(profile.contact_info as any).email}`}>
                    <Mail className="w-5 h-5 mr-2" />
                    Book Now
                    <Star className="w-5 h-5 ml-2 group-hover:animate-spin" />
                  </a>
                </Button>
              )}
              
              <Button variant="glass" size="lg" className="group" asChild>
                <a href="#listen">
                  <Play className="w-5 h-5 mr-2" />
                  Listen Now
                </a>
              </Button>
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
                <Award className="w-8 h-8 text-accent mx-auto mb-2" />
                <h3 className="text-2xl font-bold text-foreground">Pro</h3>
                <p className="text-sm text-muted-foreground">Quality Shows</p>
              </CardContent>
            </Card>
            
            <Card className="glass-card border-glass text-center p-6">
              <CardContent className="p-0">
                <TrendingUp className="w-8 h-8 text-primary mx-auto mb-2" />
                <h3 className="text-2xl font-bold text-foreground">{profile.past_shows && Array.isArray(profile.past_shows) ? profile.past_shows.length : '0'}</h3>
                <p className="text-sm text-muted-foreground">Past Shows</p>
              </CardContent>
            </Card>
            
            <Card className="glass-card border-glass text-center p-6">
              <CardContent className="p-0">
                <Music className="w-8 h-8 text-accent mx-auto mb-2" />
                <h3 className="text-2xl font-bold text-foreground">Pro</h3>
                <p className="text-sm text-muted-foreground">Audio/Video</p>
              </CardContent>
            </Card>
          </section>

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

              {/* Gallery Photos */}
              {profile.gallery_photos && profile.gallery_photos.length > 0 && (
                <section className="glass-card border-glass p-8 rounded-xl">
                  <h2 className="text-3xl font-bold mb-6">Photo Gallery</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {profile.gallery_photos.map((photo, index) => {
                      // Handle both string and object formats
                      const imagePath = typeof photo === 'string' ? photo : photo?.url || '';
                      const caption = typeof photo === 'object' && photo?.caption ? photo.caption : '';
                      
                      return (
                        <div key={index} className="relative group">
                          <PublicImage
                            storagePath={imagePath}
                            alt={caption || `${profile.artist_name} gallery ${index + 1}`}
                            className="w-full h-40 object-cover rounded-lg border border-white/20 hover:scale-105 transition-transform cursor-pointer shadow-lg"
                          />
                          {caption && (
                            <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white text-sm p-2 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                              {caption}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Streaming Links */}
              {profile.streaming_links && typeof profile.streaming_links === 'object' && profile.streaming_links !== null && !Array.isArray(profile.streaming_links) && Object.keys(profile.streaming_links).length > 0 && (
                <section id="listen" className="glass-card border-glass p-6 rounded-xl">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Music className="w-6 h-6 text-primary" />
                    Listen Now
                  </h2>
                  <div className="space-y-3">
                    {(profile.streaming_links as any).spotify && (
                      <a
                        href={(profile.streaming_links as any).spotify}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors font-medium"
                      >
                        <Music className="w-5 h-5" />
                        Spotify
                        <ExternalLink className="w-4 h-4 ml-auto" />
                      </a>
                    )}
                    {(profile.streaming_links as any).apple_music && (
                      <a
                        href={(profile.streaming_links as any).apple_music}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-lg bg-black hover:bg-gray-800 text-white transition-colors font-medium"
                      >
                        <Music className="w-5 h-5" />
                        Apple Music
                        <ExternalLink className="w-4 h-4 ml-auto" />
                      </a>
                    )}
                    {(profile.streaming_links as any).bandcamp && (
                      <a
                        href={(profile.streaming_links as any).bandcamp}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors font-medium"
                      >
                        <Music className="w-5 h-5" />
                        Bandcamp
                        <ExternalLink className="w-4 h-4 ml-auto" />
                      </a>
                    )}
                  </div>
                </section>
              )}

              {/* Upcoming Shows */}
              {profile.upcoming_shows && Array.isArray(profile.upcoming_shows) && profile.upcoming_shows.length > 0 && (
                <section className="glass-card border-glass p-6 rounded-xl">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Calendar className="w-6 h-6 text-accent" />
                    Upcoming Shows
                  </h2>
                  <div className="space-y-4">
                    {profile.upcoming_shows.map((show: any, index: number) => (
                      <div key={index} className="p-4 bg-white/5 rounded-lg border border-white/10 hover:border-primary/50 transition-colors">
                        <div className="flex items-center gap-3 mb-2">
                          <Calendar className="w-4 h-4 text-primary" />
                          <p className="font-bold text-lg">{show.venue}</p>
                        </div>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mb-3">
                          <MapPin className="w-3 h-3" />
                          {show.city} • {show.date}
                        </p>
                        {show.ticket_link && (
                          <Button asChild size="sm" className="w-full">
                            <a
                              href={show.ticket_link}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Ticket className="w-4 h-4 mr-2" />
                              Get Tickets
                            </a>
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Contact & Booking */}
              <section className="glass-card border-glass p-6 rounded-xl">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Mail className="w-6 h-6 text-primary" />
                  Booking Contact
                </h2>
                
                <p className="text-sm text-muted-foreground p-3 bg-white/5 rounded-lg border-l-4 border-accent">
                  Professional booking inquiries welcome. Fast response guaranteed.
                </p>
              </section>

              {/* Social Links */}
              {profile.social_links && typeof profile.social_links === 'object' && profile.social_links !== null && !Array.isArray(profile.social_links) && (
                <section className="glass-card border-glass p-6 rounded-xl">
                  <h2 className="text-2xl font-bold mb-6">Follow</h2>
                  <div className="space-y-3">
                    {(profile.social_links as any).website && (
                      <a
                        href={(profile.social_links as any).website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                      >
                        <Globe className="w-5 h-5" />
                        Official Website
                        <ExternalLink className="w-4 h-4 ml-auto" />
                      </a>
                    )}
                    {(profile.social_links as any).instagram && (
                      <a
                        href={`https://instagram.com/${(profile.social_links as any).instagram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 transition-colors"
                      >
                        <Instagram className="w-5 h-5" />
                        Instagram
                        <ExternalLink className="w-4 h-4 ml-auto" />
                      </a>
                    )}
                  </div>
                </section>
              )}
            </div>
          </div>

          {/* Past Shows Section */}
          {profile.past_shows && Array.isArray(profile.past_shows) && profile.past_shows.length > 0 && (
            <section className="glass-card border-glass p-8 rounded-xl mt-12">
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <Award className="w-8 h-8 text-accent" />
                Performance History
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {profile.past_shows.map((show: any, index: number) => (
                  <div key={index} className="p-4 bg-white/5 rounded-lg border border-white/10 hover:border-accent/50 transition-colors">
                    <p className="font-semibold text-lg">{show.venue}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {show.city} • {show.date}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}