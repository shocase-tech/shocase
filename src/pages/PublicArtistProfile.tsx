import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Instagram, Globe, Music, MapPin, Calendar, Ticket, Download, Mail, Phone, Star, Quote, Play, Users, Award, TrendingUp, X, Youtube } from "lucide-react";
import PublicImage from "@/components/PublicImage";
import Footer from "@/components/Footer";
import { FeaturedTrackEmbed } from "@/components/FeaturedTrackEmbed";
import { Skeleton } from "@/components/ui/skeleton";
import tiktokIcon from "@/assets/social/tiktok-white.png";
import instagramIcon from "@/assets/social/instagram-gradient.png";
import appleMusicLightIcon from "@/assets/streaming/apple-music-light.svg";

import { AllShowsModal } from "@/components/AllShowsModal";

type PublicArtistProfile = {
  id: string;
  artist_name: string;
  bio: string | null;
  blurb: string | null;
  featured_track_url: string | null;
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
  const [showFullBio, setShowFullBio] = useState(false);
  const [showBookingBanner, setShowBookingBanner] = useState(true);

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
        console.log("=== EPK Debug Info ===");
        console.log("Identifier received:", identifier);
        console.log("Identifier type:", typeof identifier);
        
        // First try by url_slug
        console.log("Trying to find by url_slug...");
        let { data, error } = await supabase
          .from('artist_profiles')
          .select('*')
          .eq('is_published', true)
          .eq('url_slug', identifier)
          .maybeSingle();

        console.log("URL slug query result:", { data, error });

        // If not found by slug, try by ID
        if (!data && !error) {
          console.log("Not found by slug, trying by ID...");
          const result = await supabase
            .from('artist_profiles')
            .select('*')
            .eq('is_published', true)
            .eq('id', identifier)
            .maybeSingle();
          
          data = result.data;
          error = result.error;
          console.log("ID query result:", { data, error });
        }

        if (error) {
          console.error("Database query error:", error);
          setError("Failed to load artist profile");
          return;
        }

        if (!data) {
          console.log("No published profile found for identifier:", identifier);
          setError("Profile not available");
          return;
        }

        console.log("Profile found! Data structure:", {
          id: data.id,
          artist_name: data.artist_name,
          url_slug: data.url_slug,
          is_published: data.is_published,
          genre: data.genre,
          bio: data.bio,
          dataKeys: Object.keys(data)
        });

        setProfile(data as PublicArtistProfile);
        setError(null);
        return; // EXIT HERE - Profile found successfully!

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

  // Combine all shows for the modal
  const allShows = [
    ...(profile.upcoming_shows || []),
    ...(profile.past_shows || [])
  ];

  // Check if we should show "View All Shows" button
  const shouldShowViewAllButton = allShows.length > 4;

  return (
    <>
      <Helmet>
        <title>{profile?.artist_name || 'Artist'} - Electronic Press Kit | SHOCASE</title>
        <meta name="description" content={
          profile?.bio && typeof profile.bio === 'string' 
            ? profile.bio.substring(0, 160) 
            : `${profile?.artist_name || 'Artist'} - Professional artist press kit featuring music, videos, gallery, and booking information.`
        } />
        <meta property="og:title" content={`${profile?.artist_name || 'Artist'} - Electronic Press Kit`} />
        <meta property="og:description" content={
          profile?.bio && typeof profile.bio === 'string' 
            ? profile.bio.substring(0, 160) 
            : `${profile?.artist_name || 'Artist'} press kit`
        } />
        <meta property="og:image" content={profile?.hero_photo_url || profile?.profile_photo_url || '/favicon.png'} />
        <meta property="og:type" content="profile" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${profile?.artist_name || 'Artist'} - Electronic Press Kit`} />
        <meta name="twitter:description" content={
          profile?.bio && typeof profile.bio === 'string' 
            ? profile.bio.substring(0, 160) 
            : `${profile?.artist_name || 'Artist'} press kit`
        } />
        <meta name="twitter:image" content={profile?.hero_photo_url || profile?.profile_photo_url || '/favicon.png'} />
        <link rel="canonical" href={`${window.location.origin}/${profile?.url_slug || profile?.id || 'unknown'}`} />
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

        {/* Background Image Section */}
        <section className="relative min-h-[60vh] md:min-h-[70vh] flex items-center justify-center overflow-hidden">
          {profile.hero_photo_url && (
            <div className="absolute inset-0">
              <PublicImage
                storagePath={profile.hero_photo_url}
                alt={`${profile.artist_name} background image`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/95"></div>
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/60"></div>
            </div>
          )}
          
          {/* Floating Elements - Hidden on mobile */}
          <div className="absolute top-20 left-20 w-32 h-32 bg-primary/20 rounded-full blur-xl animate-pulse hidden md:block"></div>
          <div className="absolute bottom-20 right-20 w-48 h-48 bg-accent/20 rounded-full blur-2xl animate-pulse delay-1000 hidden md:block"></div>

          {/* Background Image Content */}
          <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 text-center">
            {/* Decorative Icons - Hidden on mobile */}
            <div className="items-center justify-center mb-6 md:mb-8 hidden md:flex">
              <Music className="w-12 md:w-16 h-12 md:h-16 text-primary mr-4" />
              <Star className="w-8 md:w-12 h-8 md:h-12 text-accent animate-pulse" />
            </div>
            
            <h1 className="text-4xl md:text-7xl font-bold gradient-text mb-4 md:mb-6">
              {profile.artist_name}
            </h1>
            
            {genreArray && genreArray.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-6 md:mb-8">
                {genreArray.filter(Boolean).slice(0, window.innerWidth < 768 ? 2 : undefined).map((genre: string, index: number) => (
                  <Badge key={index} variant="secondary" className="text-sm md:text-lg px-3 md:px-4 py-1 md:py-2">
                    {genre}
                  </Badge>
                ))}
              </div>
            )}

            {/* Streaming Links Icons - Limited on mobile */}
            {profile.streaming_links && typeof profile.streaming_links === 'object' && profile.streaming_links !== null && !Array.isArray(profile.streaming_links) && (
              <div className="flex justify-center gap-3 md:gap-4 mb-6 md:mb-8">
                {(profile.streaming_links as any).spotify && (
                  <a
                    href={(profile.streaming_links as any).spotify}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-transform hover:scale-110"
                  >
                    <img src="/src/assets/streaming/spotify-light.png" alt="Spotify" className="w-6 md:w-8 h-6 md:h-8" />
                  </a>
                )}
                {(profile.streaming_links as any).apple_music && (
                  <a
                    href={(profile.streaming_links as any).apple_music}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-transform hover:scale-110"
                  >
                    <img src={appleMusicLightIcon} alt="Apple Music" className="w-6 md:w-8 h-6 md:h-8" />
                  </a>
                )}
                {(profile.streaming_links as any).soundcloud && window.innerWidth >= 768 && (
                  <a
                    href={(profile.streaming_links as any).soundcloud}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-transform hover:scale-110"
                  >
                    <img src="/src/assets/streaming/soundcloud-light.png" alt="SoundCloud" className="w-6 md:w-8 h-6 md:h-8" />
                  </a>
                )}
                {(profile.streaming_links as any).bandcamp && window.innerWidth >= 768 && (
                  <a
                    href={(profile.streaming_links as any).bandcamp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-transform hover:scale-110"
                  >
                    <img src="/src/assets/streaming/bandcamp-light.png" alt="Bandcamp" className="w-6 md:w-8 h-6 md:h-8" />
                  </a>
                )}
              </div>
            )}

            {profile.blurb && (
              <p className="text-lg md:text-2xl text-muted-foreground mb-6 md:mb-8 max-w-4xl mx-auto leading-relaxed">
                {profile.blurb}
              </p>
            )}

            {/* Single CTA Button on mobile, both on desktop */}
            <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-center">
              {profile.featured_track_url && (
                <Button 
                  variant="glass" 
                  size="lg" 
                  className="group w-full sm:w-auto" 
                  onClick={() => {
                    const trackSection = document.getElementById('featured-track');
                    if (trackSection) {
                      trackSection.scrollIntoView({ behavior: 'smooth' });
                      // Try to auto-play the track
                      const iframe = trackSection.querySelector('iframe') as HTMLIFrameElement;
                      if (iframe) {
                        // Reload iframe with autoplay parameter
                        const currentSrc = iframe.src;
                        iframe.src = currentSrc.includes('?') 
                          ? `${currentSrc}&autoplay=1` 
                          : `${currentSrc}?autoplay=1`;
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

          <div className="container mx-auto px-4 py-8 md:py-12 max-w-7xl">
            {profile.featured_track_url && (
              <section id="featured-track" className="mb-12 md:mb-16">
                <div className="glass-card border-glass p-4 md:p-8 rounded-xl">
                  <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-center flex items-center justify-center gap-3">
                    <Music className="w-6 md:w-8 h-6 md:h-8 text-primary" />
                    Featured Track
                  </h2>
                  <div className="max-w-2xl mx-auto">
                    <FeaturedTrackEmbed trackUrl={profile.featured_track_url} />
                  </div>
                </div>
              </section>
            )}

          {/* Connect Section - Replace stats on mobile */}
          <section className="block md:hidden mb-12">
            <div className="glass-card border-glass p-4 rounded-xl">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                Connect & Book
              </h2>
              
              <div className="grid grid-cols-1 gap-3 mb-4">
                {profile.contact_info && (profile.contact_info as any).email && (
                  <Button asChild variant="default" className="w-full">
                    <a href={`mailto:${(profile.contact_info as any).email}`}>
                      <Mail className="w-4 h-4 mr-2" />
                      Booking Contact
                    </a>
                  </Button>
                )}
                
                <div className="flex gap-2">
                  {profile.social_links && typeof profile.social_links === 'object' && profile.social_links !== null && !Array.isArray(profile.social_links) && (profile.social_links as any).instagram && (
                    <Button asChild variant="secondary" className="flex-1">
                      <a href={`https://instagram.com/${(profile.social_links as any).instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer">
                        <Instagram className="w-4 h-4 mr-1" />
                        Instagram
                      </a>
                    </Button>
                  )}
                  
                  {profile.social_links && typeof profile.social_links === 'object' && profile.social_links !== null && !Array.isArray(profile.social_links) && (profile.social_links as any).tiktok && (
                    <Button asChild variant="secondary" className="flex-1">
                      <a href={(profile.social_links as any).tiktok} target="_blank" rel="noopener noreferrer">
                        <img src={tiktokIcon} alt="TikTok" className="w-4 h-4 mr-1" />
                        TikTok
                      </a>
                    </Button>
                  )}
                  
                  {profile.social_links && typeof profile.social_links === 'object' && profile.social_links !== null && !Array.isArray(profile.social_links) && (profile.social_links as any).youtube && (
                    <Button asChild variant="secondary" className="flex-1">
                      <a href={(profile.social_links as any).youtube} target="_blank" rel="noopener noreferrer">
                        <Youtube className="w-4 h-4 mr-1" />
                        YouTube
                      </a>
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Location and Performance Info */}
              {profile.contact_info && ((profile.contact_info as any).location || (profile.contact_info as any).performance_type) && (
                <div className="bg-white/5 rounded-lg p-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>
                      {(profile.contact_info as any).location && `${(profile.contact_info as any).location}`}
                      {(profile.contact_info as any).location && (profile.contact_info as any).performance_type && ' • '}
                      {(profile.contact_info as any).performance_type && `${(profile.contact_info as any).performance_type}`}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Key Stats Section - Desktop only */}
          <section className="hidden md:grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
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
                <Calendar className="w-8 h-8 text-accent mx-auto mb-2" />
                <h3 className="text-2xl font-bold text-foreground">
                  {(() => {
                    const upcomingCount = (profile.upcoming_shows && Array.isArray(profile.upcoming_shows)) ? 
                      profile.upcoming_shows.length : 0;
                    const pastCount = (profile.past_shows && Array.isArray(profile.past_shows)) ? 
                      profile.past_shows.length : 0;
                    
                    if (upcomingCount > 0) return upcomingCount;
                    if (pastCount > 0) return 'Open';
                    return 'Booking';
                  })()}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {(() => {
                    const upcomingCount = (profile.upcoming_shows && Array.isArray(profile.upcoming_shows)) ? 
                      profile.upcoming_shows.length : 0;
                    const pastCount = (profile.past_shows && Array.isArray(profile.past_shows)) ? 
                      profile.past_shows.length : 0;
                    
                    if (upcomingCount > 0) {
                      return upcomingCount === 1 ? 'Upcoming show' : 'Upcoming shows';
                    }
                    if (pastCount > 0) return 'For new dates';
                    return 'Inquiries open';
                  })()}
                </p>
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
                <section className="glass-card border-glass p-4 md:p-8 rounded-xl">
                  <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Artist Biography</h2>
                  <div className="text-muted-foreground leading-relaxed text-base md:text-lg">
                    {window.innerWidth < 768 && profile.bio.length > 500 ? (
                      <>
                        <p className={`transition-all duration-300 ${showFullBio ? '' : 'line-clamp-4'}`}>
                          {showFullBio ? profile.bio : `${profile.bio.substring(0, 300)}...`}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowFullBio(!showFullBio)}
                          className="mt-2 text-primary hover:text-primary-foreground"
                        >
                          {showFullBio ? 'Show Less' : 'Show More'}
                        </Button>
                      </>
                    ) : (
                      <p className="whitespace-pre-wrap">{profile.bio}</p>
                    )}
                  </div>
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
                <section className="glass-card border-glass p-4 md:p-8 rounded-xl">
                  <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Photo Gallery</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                    {profile.gallery_photos.map((photo, index) => {
                      // Handle both string and object formats
                      const imagePath = typeof photo === 'string' ? photo : photo?.url || '';
                      const caption = typeof photo === 'object' && photo?.caption ? photo.caption : '';
                      
                      return (
                        <div key={index} className="relative group">
                          <PublicImage
                            storagePath={imagePath}
                            alt={caption || `${profile.artist_name} gallery ${index + 1}`}
                            className="w-full h-32 md:h-40 object-cover rounded-lg border border-white/20 hover:scale-105 transition-transform cursor-pointer shadow-lg"
                          />
                          {caption && (
                            <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white text-xs md:text-sm p-2 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
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
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <Calendar className="w-6 h-6 text-accent" />
                      Upcoming Shows
                    </h2>
                    {shouldShowViewAllButton && (
                      <AllShowsModal 
                        allShows={allShows}
                        artistName={profile.artist_name}
                      />
                    )}
                  </div>
                   <div className="space-y-3 md:space-y-4">
                     {profile.upcoming_shows.slice(0, 3).map((show: any, index: number) => (
                       <div key={index} className="p-3 md:p-4 bg-white/5 rounded-lg border border-white/10 hover:border-primary/50 transition-colors">
                         <div className="flex items-center gap-2 md:gap-3 mb-2">
                           <Calendar className="w-3 md:w-4 h-3 md:h-4 text-primary" />
                           <p className="font-bold text-base md:text-lg">{show.venue}</p>
                         </div>
                         <p className="text-xs md:text-sm text-muted-foreground flex items-center gap-1 mb-3">
                           <MapPin className="w-3 h-3" />
                            {getShowLocation(show)} • {new Date(show.date + 'T00:00:00').toLocaleDateString('en-US', {
                             year: 'numeric', 
                             month: window.innerWidth < 768 ? 'short' : 'long', 
                             day: 'numeric' 
                           })}
                         </p>
                         {getShowTicketLink(show) && (
                           <Button asChild size="sm" className="w-full text-xs md:text-sm">
                             <a
                               href={getShowTicketLink(show)}
                               target="_blank"
                               rel="noopener noreferrer"
                             >
                               <Ticket className="w-3 md:w-4 h-3 md:h-4 mr-2" />
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
                        <img src={instagramIcon} alt="Instagram" className="w-5 h-5" />
                        Instagram
                        <ExternalLink className="w-4 h-4 ml-auto" />
                      </a>
                    )}
                    {(profile.social_links as any).tiktok && (
                      <a
                        href={(profile.social_links as any).tiktok}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-lg bg-black text-white hover:bg-gray-800 transition-colors"
                      >
                        <img src={tiktokIcon} alt="TikTok" className="w-5 h-5" />
                        TikTok
                        <ExternalLink className="w-4 h-4 ml-auto" />
                      </a>
                    )}
                    {(profile.social_links as any).youtube && (
                      <a
                        href={(profile.social_links as any).youtube}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
                      >
                        <Youtube className="w-5 h-5" />
                        YouTube
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
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold flex items-center gap-3">
                  <Award className="w-8 h-8 text-accent" />
                  Performance History
                </h2>
                {!shouldShowViewAllButton && allShows.length > 4 && (
                  <AllShowsModal 
                    allShows={allShows}
                    artistName={profile.artist_name}
                  />
                )}
              </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                 {profile.past_shows.slice(0, window.innerWidth < 768 ? 4 : 6).map((show: any, index: number) => (
                   <div key={index} className="p-3 md:p-4 bg-white/5 rounded-lg border border-white/10 hover:border-accent/50 transition-colors">
                     <p className="font-semibold text-base md:text-lg">{show.venue}</p>
                     <p className="text-xs md:text-sm text-muted-foreground flex items-center gap-1">
                       <MapPin className="w-3 h-3" />
                       {getShowLocation(show)} • {new Date(show.date + 'T00:00:00').toLocaleDateString('en-US', { 
                         year: 'numeric', 
                         month: window.innerWidth < 768 ? 'short' : 'long', 
                         day: 'numeric' 
                       })}
                     </p>
                   </div>
                 ))}
               </div>
            </section>
           )}
         </div>

        {/* Sticky Bottom Booking Banner - Mobile Only */}
        {showBookingBanner && profile.contact_info && (profile.contact_info as any).email && (
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gradient-to-r from-primary to-primary-foreground/90 backdrop-blur-sm border-t border-primary/20 z-50">
            <div className="flex items-center justify-between p-4">
              <div className="flex-1">
                <p className="font-bold text-primary-foreground text-sm">Book {profile.artist_name}</p>
                {profile.contact_info && ((profile.contact_info as any).location || (profile.contact_info as any).performance_type) && (
                  <p className="text-xs text-primary-foreground/80">
                    {(profile.contact_info as any).location && `${(profile.contact_info as any).location}`}
                    {(profile.contact_info as any).location && (profile.contact_info as any).performance_type && ' • '}
                    {(profile.contact_info as any).performance_type && `${(profile.contact_info as any).performance_type}`}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  asChild 
                  size="sm" 
                  variant="secondary"
                  className="bg-white text-primary hover:bg-white/90"
                >
                  <a href={`mailto:${(profile.contact_info as any).email}`}>
                    <Mail className="w-4 h-4 mr-1" />
                    Contact
                  </a>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowBookingBanner(false)}
                  className="text-primary-foreground hover:bg-white/20 p-2"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Add bottom padding when booking banner is visible */}
        <div className={`${showBookingBanner && profile.contact_info && (profile.contact_info as any).email ? 'h-20' : 'h-0'} md:hidden`}></div>
       </div>
       <Footer />
     </>
   );
 }