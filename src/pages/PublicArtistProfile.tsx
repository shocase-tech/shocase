import { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Instagram, Globe, Music, MapPin, Calendar, Ticket } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Database } from "@/integrations/supabase/types";

type ArtistProfile = Database['public']['Tables']['artist_profiles']['Row'];

export default function PublicArtistProfile() {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<ArtistProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return;

      try {
        const { data, error } = await supabase
          .from("artist_profiles")
          .select("*")
          .eq("id", id)
          .single();

        if (error) {
          setError("Artist not found");
          return;
        }

        setProfile(data);
      } catch (err) {
        setError("Failed to load artist profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Skeleton className="h-64 w-full rounded-lg mb-8" />
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return <Navigate to="/not-found" replace />;
  }

  return (
    <>
      <Helmet>
        <title>{profile.artist_name} - Electronic Press Kit</title>
        <meta name="description" content={profile.bio ? profile.bio.substring(0, 160) : `${profile.artist_name} - Professional artist press kit featuring music, videos, gallery, and booking information.`} />
        <meta property="og:title" content={`${profile.artist_name} - Electronic Press Kit`} />
        <meta property="og:description" content={profile.bio ? profile.bio.substring(0, 160) : `${profile.artist_name} press kit`} />
        <meta property="og:image" content={profile.hero_photo_url || profile.profile_photo_url || ''} />
        <meta property="og:type" content="profile" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${profile.artist_name} - Electronic Press Kit`} />
        <meta name="twitter:description" content={profile.bio ? profile.bio.substring(0, 160) : `${profile.artist_name} press kit`} />
        <meta name="twitter:image" content={profile.hero_photo_url || profile.profile_photo_url || ''} />
        <link rel="canonical" href={`${window.location.origin}/artist/${profile.id}`} />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Hero Section */}
          {profile.hero_photo_url && (
            <div className="relative h-64 md:h-80 rounded-xl overflow-hidden mb-8 shadow-2xl">
              <img
                src={profile.hero_photo_url}
                alt={`${profile.artist_name} hero`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex items-end gap-4">
                  {profile.profile_photo_url && (
                    <img
                      src={profile.profile_photo_url}
                      alt={profile.artist_name}
                      className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-4 border-white/30 shadow-lg"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg">
                      {profile.artist_name}
                    </h1>
                    {profile.genre && (
                      <Badge variant="secondary" className="mb-2">
                        {profile.genre}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Header without hero */}
          {!profile.hero_photo_url && (
            <div className="flex items-start gap-6 mb-8">
              {profile.profile_photo_url && (
                <img
                  src={profile.profile_photo_url}
                  alt={profile.artist_name}
                  className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-white/20 shadow-lg"
                />
              )}
              <div className="flex-1">
                <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-4">
                  {profile.artist_name}
                </h1>
                {profile.genre && (
                  <Badge variant="secondary" className="mb-2">
                    {profile.genre}
                  </Badge>
                )}
              </div>
            </div>
          )}

          <div className="grid gap-8">
            {/* Bio Section */}
            {profile.bio && (
              <section className="glass-card border-white/10 p-6 rounded-xl">
                <h2 className="text-2xl font-semibold mb-4">About</h2>
                <p className="text-muted-foreground leading-relaxed text-lg">{profile.bio}</p>
              </section>
            )}

            {/* Videos Section */}
            {profile.show_videos && profile.show_videos.length > 0 && (
              <section className="glass-card border-white/10 p-6 rounded-xl">
                <h2 className="text-2xl font-semibold mb-4">Videos</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {profile.show_videos.map((video, index) => (
                    <div key={index} className="aspect-video rounded-lg overflow-hidden bg-black/20">
                      <iframe
                        src={video.replace('watch?v=', 'embed/')}
                        className="w-full h-full"
                        frameBorder="0"
                        allowFullScreen
                        title={`${profile.artist_name} video ${index + 1}`}
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Gallery Photos */}
            {profile.gallery_photos && profile.gallery_photos.length > 0 && (
              <section className="glass-card border-white/10 p-6 rounded-xl">
                <h2 className="text-2xl font-semibold mb-4">Gallery</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {profile.gallery_photos.map((photo, index) => (
                    <img
                      key={index}
                      src={photo}
                      alt={`${profile.artist_name} gallery ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-white/20 hover:scale-105 transition-transform cursor-pointer"
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Press Quotes */}
            {profile.press_quotes && Array.isArray(profile.press_quotes) && profile.press_quotes.length > 0 && (
              <section className="glass-card border-white/10 p-6 rounded-xl">
                <h2 className="text-2xl font-semibold mb-4">Press</h2>
                <div className="space-y-4">
                  {profile.press_quotes.map((quote: any, index: number) => (
                    <blockquote key={index} className="border-l-4 border-primary pl-6 bg-white/5 p-4 rounded-r-lg">
                      <p className="italic text-lg mb-2">"{quote.text}"</p>
                      <cite className="text-sm font-medium text-primary">— {quote.source}</cite>
                    </blockquote>
                  ))}
                </div>
              </section>
            )}

            {/* Streaming Links */}
            {profile.streaming_links && typeof profile.streaming_links === 'object' && profile.streaming_links !== null && !Array.isArray(profile.streaming_links) && Object.keys(profile.streaming_links).length > 0 && (
              <section className="glass-card border-white/10 p-6 rounded-xl">
                <h2 className="text-2xl font-semibold mb-4">Listen</h2>
                <div className="flex flex-wrap gap-3">
                  {(profile.streaming_links as any).spotify && (
                    <a
                      href={(profile.streaming_links as any).spotify}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors"
                    >
                      <Music className="w-5 h-5" />
                      Spotify
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  {(profile.streaming_links as any).apple_music && (
                    <a
                      href={(profile.streaming_links as any).apple_music}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-3 rounded-lg bg-black hover:bg-gray-800 text-white transition-colors"
                    >
                      <Music className="w-5 h-5" />
                      Apple Music
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  {(profile.streaming_links as any).bandcamp && (
                    <a
                      href={(profile.streaming_links as any).bandcamp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                    >
                      <Music className="w-5 h-5" />
                      Bandcamp
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </section>
            )}

            {/* Upcoming Shows */}
            {profile.upcoming_shows && Array.isArray(profile.upcoming_shows) && profile.upcoming_shows.length > 0 && (
              <section className="glass-card border-white/10 p-6 rounded-xl">
                <h2 className="text-2xl font-semibold mb-4">Upcoming Shows</h2>
                <div className="space-y-4">
                  {profile.upcoming_shows.map((show: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-semibold">{show.venue}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {show.city} • {show.date}
                          </p>
                        </div>
                      </div>
                      {show.ticket_link && (
                        <a
                          href={show.ticket_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                        >
                          <Ticket className="w-4 h-4" />
                          Tickets
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Social Links & Contact */}
            <section className="glass-card border-white/10 p-6 rounded-xl">
              <h2 className="text-2xl font-semibold mb-4">Connect</h2>
              <div className="space-y-4">
                {profile.social_links && typeof profile.social_links === 'object' && profile.social_links !== null && !Array.isArray(profile.social_links) && (
                  <div className="flex flex-wrap gap-3">
                    {(profile.social_links as any).website && (
                      <a
                        href={(profile.social_links as any).website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                      >
                        <Globe className="w-4 h-4" />
                        Website
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {(profile.social_links as any).instagram && (
                      <a
                        href={`https://instagram.com/${(profile.social_links as any).instagram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 transition-colors"
                      >
                        <Instagram className="w-4 h-4" />
                        Instagram
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                )}
                {profile.contact_info && typeof profile.contact_info === 'object' && profile.contact_info !== null && !Array.isArray(profile.contact_info) && (profile.contact_info as any).email && (
                  <p className="text-muted-foreground">
                    <span className="font-medium">Contact:</span> {(profile.contact_info as any).email}
                  </p>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}