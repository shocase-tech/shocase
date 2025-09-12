import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink, Instagram, Globe, Music, MapPin, Calendar, Ticket, Mail, Phone, Star, Quote, Play, Users, Award, TrendingUp } from "lucide-react";
import PublicImage from "@/components/PublicImage";
import tiktokIcon from "@/assets/social/tiktok-white.png";
import instagramIcon from "@/assets/social/instagram-gradient.png";
import { AllShowsModal } from "@/components/AllShowsModal";

interface PreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: any;
  onPublish?: () => void;
}

export function PreviewModal({ open, onOpenChange, profile, onPublish }: PreviewModalProps) {
  if (!profile) return null;

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <DialogTitle className="text-xl font-bold">Preview EPK</DialogTitle>
              {!profile.is_published && (
                <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-100 border-yellow-500/30">
                  Unpublished Draft
                </Badge>
              )}
            </div>
            {!profile.is_published && onPublish && (
              <Button onClick={onPublish} className="bg-green-600 hover:bg-green-700">
                Publish EPK
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="min-h-screen bg-gradient-dark">
          {/* Hero Section */}
          <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden">
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
              
              <h1 className="text-4xl md:text-6xl font-bold gradient-text mb-6">
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

              {/* Streaming Links Icons */}
              {profile.streaming_links && typeof profile.streaming_links === 'object' && profile.streaming_links !== null && !Array.isArray(profile.streaming_links) && (
                <div className="flex justify-center gap-4 mb-8">
                  {(profile.streaming_links as any).spotify && (
                    <a
                      href={(profile.streaming_links as any).spotify}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition-transform hover:scale-110"
                    >
                      <img src="/src/assets/streaming/spotify-light.png" alt="Spotify" className="w-8 h-8" />
                    </a>
                  )}
                  {(profile.streaming_links as any).apple_music && (
                    <a
                      href={(profile.streaming_links as any).apple_music}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition-transform hover:scale-110"
                    >
                      <img src="/src/assets/streaming/apple-music-light.svg" alt="Apple Music" className="w-8 h-8" />
                    </a>
                  )}
                  {(profile.streaming_links as any).soundcloud && (
                    <a
                      href={(profile.streaming_links as any).soundcloud}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition-transform hover:scale-110"
                    >
                      <img src="/src/assets/streaming/soundcloud-light.png" alt="SoundCloud" className="w-8 h-8" />
                    </a>
                  )}
                  {(profile.streaming_links as any).bandcamp && (
                    <a
                      href={(profile.streaming_links as any).bandcamp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition-transform hover:scale-110"
                    >
                      <img src="/src/assets/streaming/bandcamp-light.png" alt="Bandcamp" className="w-8 h-8" />
                    </a>
                  )}
                </div>
              )}

              {profile.blurb && (
                <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-4xl mx-auto leading-relaxed">
                  {profile.blurb}
                </p>
              )}

              {/* CTA Buttons */}
              <div className={`flex flex-col sm:flex-row gap-6 justify-center items-center ${!profile.spotify_track_url ? 'justify-center' : ''}`}>
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
                      const spotifySection = document.getElementById('spotify-track-preview');
                      if (spotifySection) {
                        spotifySection.scrollIntoView({ behavior: 'smooth' });
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
            {/* Featured Spotify Track */}
            {profile.spotify_track_url && (
              <section id="spotify-track-preview" className="mb-16">
                <div className="glass-card border-glass p-8 rounded-xl">
                  <h2 className="text-3xl font-bold mb-6 text-center flex items-center justify-center gap-3">
                    <Music className="w-8 h-8 text-green-500" />
                    Featured Track
                  </h2>
                  <div className="max-w-2xl mx-auto">
                    <iframe
                      src={profile.spotify_track_url.replace('track/', 'embed/track/')}
                      width="100%"
                      height="352"
                      frameBorder="0"
                      allowTransparency={true}
                      allow="encrypted-media"
                      className="rounded-xl shadow-lg"
                      title={`${profile.artist_name} featured track`}
                    />
                  </div>
                </div>
              </section>
            )}

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
                    <div className="space-y-4">
                      {profile.upcoming_shows.slice(0, 3).map((show: any, index: number) => (
                        <div key={index} className="p-4 bg-white/5 rounded-lg border border-white/10 hover:border-primary/50 transition-colors">
                          <div className="flex items-center gap-3 mb-2">
                            <Calendar className="w-4 h-4 text-primary" />
                            <p className="font-bold text-lg">{show.venue}</p>
                          </div>
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mb-3">
                            <MapPin className="w-3 h-3" />
                            {getShowLocation(show)} • {new Date(show.date).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </p>
                          {getShowTicketLink(show) && (
                            <Button asChild size="sm" className="w-full">
                              <a
                                href={getShowTicketLink(show)}
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {profile.past_shows.slice(0, 6).map((show: any, index: number) => (
                    <div key={index} className="p-4 bg-white/5 rounded-lg border border-white/10 hover:border-accent/50 transition-colors">
                      <p className="font-semibold text-lg">{show.venue}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {getShowLocation(show)} • {new Date(show.date).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}