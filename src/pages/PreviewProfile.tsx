import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Music, Instagram, Globe, ExternalLink, Calendar, MapPin, Users, Ticket } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Helmet } from 'react-helmet-async';

interface PreviewProfile {
  id: string;
  artist_name: string;
  bio?: string;
  genre?: string;
  social_links?: any;
  profile_photo_url?: string;
  press_photos?: string[];
  hero_photo_url?: string;
  show_videos?: string[];
  gallery_photos?: string[];
  press_quotes?: any;
  press_mentions?: any;
  streaming_links?: any;
  upcoming_shows?: any;
  past_shows?: any;
  contact_info?: any;
  is_published: boolean;
  url_slug?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  playlists?: string[];
  pdf_urls?: string[];
}

const PreviewProfile = () => {
  const { identifier } = useParams<{ identifier: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<PreviewProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setAuthLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // Don't redirect immediately - wait for auth state to load
    if (authLoading) {
      // Auth state is still loading, do nothing
      return;
    }
    
    if (!user) {
      // User is definitely not logged in
      navigate('/auth');
      return;
    }

    const fetchProfile = async () => {
      if (!identifier) {
        setError("No profile identifier provided");
        setLoading(false);
        return;
      }

      try {
        console.log("Fetching preview profile for:", identifier, "User:", user.id);

        // Try to fetch the user's own profile by slug or ID
        let { data, error: queryError } = await supabase
          .from('artist_profiles')
          .select('*')
          .eq('user_id', user.id)
          .eq('url_slug', identifier)
          .maybeSingle();

        // If not found by slug, try by ID
        if (!data && !queryError) {
          const result = await supabase
            .from('artist_profiles')
            .select('*')
            .eq('user_id', user.id)
            .eq('id', identifier)
            .maybeSingle();
          
          data = result.data;
          queryError = result.error;
        }

        if (queryError) {
          console.error("Database error:", queryError);
          setError("Database error occurred");
          setLoading(false);
          return;
        }

        if (!data) {
          console.log("No profile found for user");
          setError("Profile not found");
          setLoading(false);
          return;
        }

        console.log("Preview profile found:", data.artist_name);
        setProfile(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching preview profile:", err);
        setError("Failed to load profile");
        setLoading(false);
      }
    };

    fetchProfile();
  }, [identifier, user, navigate, authLoading]);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/auth');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

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
          <h1 className="text-3xl font-bold text-foreground mb-4">Preview Not Available</h1>
          <p className="text-lg text-muted-foreground mb-8">
            {error || "Unable to load preview"}
          </p>
          <Button asChild variant="default">
            <a href="/dashboard">← Back to Dashboard</a>
          </Button>
        </div>
      </div>
    );
  }

  // Parse genre data
  let genreDisplay: string[] = [];
  if (profile.genre) {
    try {
      if (Array.isArray(profile.genre)) {
        genreDisplay = profile.genre;
      } else if (typeof profile.genre === 'string') {
        try {
          const parsed = JSON.parse(profile.genre);
          genreDisplay = Array.isArray(parsed) ? parsed : [profile.genre];
        } catch {
          genreDisplay = profile.genre.split(',').map(g => g.trim()).filter(Boolean);
        }
      }
    } catch (error) {
      console.error('Error parsing genre:', error);
      genreDisplay = [];
    }
  }

  const stats = [
    { label: "Live", value: profile.show_videos?.length || 0, icon: Music },
    { label: "Pro", value: (profile.press_photos?.length || 0) + (profile.gallery_photos?.length || 0), icon: Users },
    { label: "Past Shows", value: Array.isArray(profile.past_shows) ? profile.past_shows.length : 0, icon: Calendar },
    { label: "Audio/Video", value: (profile.show_videos?.length || 0), icon: Music }
  ];

  return (
    <>
      <Helmet>
        <title>{profile.artist_name} - Electronic Press Kit Preview</title>
        <meta name="description" content={`Preview of ${profile.artist_name}'s electronic press kit${profile.bio ? ` - ${profile.bio.slice(0, 160)}` : ''}`} />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-gradient-dark">
        {/* Dashboard Header */}
        <header className="sticky top-0 z-50 border-b border-white/10 backdrop-blur-sm bg-background/80">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold gradient-text">Press Kit Builder</h1>
              <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-100 border-yellow-500/30">
                Preview Mode
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Back to Dashboard
              </Button>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </header>

        {/* Preview Banner */}
        <div className="bg-yellow-500/20 border-b border-yellow-500/30 px-4 py-3">
          <div className="container mx-auto max-w-7xl">
            <div className="flex items-center justify-center">
              <span className="text-sm text-yellow-100">
                {profile.is_published ? 'This is how your published EPK appears to the public' : 'Preview your unpublished EPK - only you can see this'}
              </span>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <section className="relative h-96 flex items-center justify-center overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={profile.hero_photo_url ? { backgroundImage: `url(${profile.hero_photo_url})` } : {}}
          />
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 tracking-tight">
              {profile.artist_name}
            </h1>
            {genreDisplay.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {genreDisplay.map((genre, index) => (
                  <Badge key={index} variant="secondary" className="bg-white/20 text-white border-white/30">
                    {genre}
                  </Badge>
                ))}
              </div>
            )}
            {profile.bio && (
              <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
                {profile.bio}
              </p>
            )}
          </div>
        </section>

        {/* Key Stats */}
        <section className="py-12 border-b border-white/10">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                    <stat.icon className="w-8 h-8 text-primary" />
                  </div>
                  <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="container mx-auto px-6 py-12 max-w-7xl">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-12">
              {/* Videos */}
              {profile.show_videos && profile.show_videos.length > 0 && (
                <section>
                  <h2 className="text-3xl font-bold text-white mb-8">Live Performances</h2>
                  <div className="grid gap-6">
                    {profile.show_videos.map((video, index) => (
                      <div key={index} className="aspect-video rounded-lg overflow-hidden bg-muted">
                        <iframe
                          src={video}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          title={`${profile.artist_name} - Video ${index + 1}`}
                        />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Biography */}
              {profile.bio && (
                <section>
                  <h2 className="text-3xl font-bold text-white mb-6">Biography</h2>
                  <div className="prose prose-lg prose-invert max-w-none">
                    <p className="text-muted-foreground leading-relaxed text-lg">
                      {profile.bio}
                    </p>
                  </div>
                </section>
              )}

              {/* Press Quotes */}
              {profile.press_quotes && Array.isArray(profile.press_quotes) && profile.press_quotes.length > 0 && (
                <section>
                  <h2 className="text-3xl font-bold text-white mb-8">Press</h2>
                  <div className="space-y-6">
                    {profile.press_quotes.map((quote: any, index: number) => (
                      <blockquote key={index} className="border-l-4 border-primary pl-6 py-4">
                        <p className="text-lg text-muted-foreground mb-3 italic">
                          "{quote.quote}"
                        </p>
                        <cite className="text-sm text-primary font-medium">
                          — {quote.source}
                        </cite>
                      </blockquote>
                    ))}
                  </div>
                </section>
              )}

              {/* Photo Gallery */}
              {profile.gallery_photos && profile.gallery_photos.length > 0 && (
                <section>
                  <h2 className="text-3xl font-bold text-white mb-8">Gallery</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {profile.gallery_photos.map((photo, index) => (
                      <div key={index} className="aspect-square rounded-lg overflow-hidden bg-muted">
                        <img
                          src={photo}
                          alt={`${profile.artist_name} - Gallery ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Upcoming Shows */}
              {profile.upcoming_shows && Array.isArray(profile.upcoming_shows) && profile.upcoming_shows.length > 0 && (
                <section className="bg-card/50 rounded-lg p-6 border border-white/10">
                  <h3 className="text-xl font-bold text-white mb-6">Upcoming Shows</h3>
                  <div className="space-y-4">
                    {profile.upcoming_shows.slice(0, 3).map((show: any, index: number) => (
                      <div key={index} className="border-b border-white/10 pb-4 last:border-b-0">
                        <div className="font-medium text-white">{show.venue}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3" />
                          {show.location}
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <Calendar className="w-3 h-3" />
                          {show.date}
                        </div>
                        {show.ticketUrl && (
                          <a
                            href={show.ticketUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-2"
                          >
                            <Ticket className="w-3 h-3" />
                            Get Tickets
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Social Links */}
              {profile.social_links && Object.keys(profile.social_links).length > 0 && (
                <section className="bg-card/50 rounded-lg p-6 border border-white/10">
                  <h3 className="text-xl font-bold text-white mb-4">Connect</h3>
                  <div className="space-y-3">
                    {profile.social_links.website && (
                      <a
                        href={profile.social_links.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-muted-foreground hover:text-white transition-colors"
                      >
                        <Globe className="w-5 h-5" />
                        Website
                        <ExternalLink className="w-4 h-4 ml-auto" />
                      </a>
                    )}
                    {profile.social_links.instagram && (
                      <a
                        href={profile.social_links.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-muted-foreground hover:text-white transition-colors"
                      >
                        <Instagram className="w-5 h-5" />
                        Instagram
                        <ExternalLink className="w-4 h-4 ml-auto" />
                      </a>
                    )}
                  </div>
                </section>
              )}

              {/* Streaming Links */}
              {profile.streaming_links && Object.keys(profile.streaming_links).length > 0 && (
                <section className="bg-card/50 rounded-lg p-6 border border-white/10">
                  <h3 className="text-xl font-bold text-white mb-4">Listen</h3>
                  <div className="space-y-3">
                    {Object.entries(profile.streaming_links).map(([platform, url]) => (
                      url && (
                        <a
                          key={platform}
                          href={url as string}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 text-muted-foreground hover:text-white transition-colors capitalize"
                        >
                          <Music className="w-5 h-5" />
                          {platform}
                          <ExternalLink className="w-4 h-4 ml-auto" />
                        </a>
                      )
                    ))}
                  </div>
                </section>
              )}

              {/* Contact */}
              {profile.contact_info && Object.keys(profile.contact_info).length > 0 && (
                <section className="bg-card/50 rounded-lg p-6 border border-white/10">
                  <h3 className="text-xl font-bold text-white mb-4">Booking</h3>
                  <div className="space-y-2 text-sm">
                    {profile.contact_info.email && (
                      <div>
                        <span className="text-muted-foreground">Email:</span>
                        <br />
                        <a href={`mailto:${profile.contact_info.email}`} className="text-primary hover:underline">
                          {profile.contact_info.email}
                        </a>
                      </div>
                    )}
                    {profile.contact_info.phone && (
                      <div>
                        <span className="text-muted-foreground">Phone:</span>
                        <br />
                        <a href={`tel:${profile.contact_info.phone}`} className="text-primary hover:underline">
                          {profile.contact_info.phone}
                        </a>
                      </div>
                    )}
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PreviewProfile;