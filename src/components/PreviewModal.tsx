import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Instagram, Globe, Music, MapPin, Calendar, Ticket, Mail, Phone, Star, Quote, Play, Users, Award, TrendingUp, User as UserIcon, Users2, Guitar, ChevronLeft, ChevronRight, X } from "lucide-react";
import spotifyColorIcon from "@/assets/streaming/spotify-color.png";
import spotifyLightIcon from "@/assets/streaming/spotify-light.png";
import soundcloudColorIcon from "@/assets/streaming/soundcloud-color.png";
import soundcloudLightIcon from "@/assets/streaming/soundcloud-light.png";
import bandcampColorIcon from "@/assets/streaming/bandcamp-color.png";
import bandcampLightIcon from "@/assets/streaming/bandcamp-light.png";
import appleMusicColorIcon from "@/assets/streaming/apple-music-color.svg";
import appleMusicLightIcon from "@/assets/streaming/apple-music-light.svg";
import tiktokIcon from "@/assets/social/tiktok-white.png";
import instagramIcon from "@/assets/social/instagram-gradient.png";
import PublicImage from "@/components/PublicImage";
import { FeaturedTrackEmbed } from "@/components/FeaturedTrackEmbed";
import { VideoCarousel } from "@/components/VideoCarousel";
import { AllShowsModal } from "@/components/AllShowsModal";

interface PreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: any;
  onPublish?: () => void;
}

export function PreviewModal({ open, onOpenChange, profile, onPublish }: PreviewModalProps) {
  const [bioExpanded, setBioExpanded] = useState(false);

  if (!profile) return null;

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

  // Combine all shows for the modal
  const allShows = [
    ...(profile.upcoming_shows || []),
    ...(profile.past_shows || [])
  ];

  // Check if we should show "View All Shows" button
  const shouldShowViewAllButton = allShows.length > 4;

  // Helper function to truncate bio for mobile
  const getTruncatedBio = (bio: string, wordLimit: number = 100) => {
    const words = bio.split(' ');
    if (words.length <= wordLimit) return bio;
    return words.slice(0, wordLimit).join(' ') + '...';
  };

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
            <div className="flex items-center gap-3">
              {!profile.is_published && onPublish && (
                <Button onClick={onPublish} className="bg-green-600 hover:bg-green-700">
                  Publish EPK
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="h-8 w-8 p-0 hover:bg-white/10"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="min-h-screen bg-gradient-dark pb-20 md:pb-0">
          {/* Background Image Section */}
          <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
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
            
            {/* Floating Elements */}
            <div className="absolute top-20 left-20 w-32 h-32 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute bottom-20 right-20 w-48 h-48 bg-accent/20 rounded-full blur-2xl animate-pulse delay-1000"></div>

            {/* Background Image Content */}
            <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
              {/* Decorative icons - hidden on mobile */}
              <div className="hidden md:flex items-center justify-center mb-8">
                <Music className="w-16 h-16 text-primary mr-4" />
                <Star className="w-12 h-12 text-accent animate-pulse" />
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold gradient-text mb-6">
                {profile.artist_name}
              </h1>
              
              {genreArray && genreArray.length > 0 && (
                <div className="flex flex-wrap justify-center gap-3 mb-8">
                  {genreArray.filter(Boolean).slice(0, window.innerWidth < 768 ? 2 : genreArray.length).map((genre: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-sm md:text-lg px-2 py-1 md:px-4 md:py-2">
                      {genre}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Streaming Icons - hidden on mobile, shown on desktop */}
              {profile.streaming_links && Object.keys(profile.streaming_links).length > 0 && (
                <div className="hidden md:flex justify-center gap-6 mb-8">
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

              {/* Single CTA Button on mobile, multiple on desktop */}
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <div className="md:hidden">
                  {/* Mobile: Single primary CTA */}
                  {profile.contact_info && (profile.contact_info as any).email ? (
                    <Button variant="hero" size="lg" asChild className="group">
                      <a href={`mailto:${(profile.contact_info as any).email}`}>
                        <Mail className="w-5 h-5 mr-2" />
                        Book Now
                        <Star className="w-5 h-5 ml-2 group-hover:animate-spin" />
                      </a>
                    </Button>
                  ) : null}
                </div>
                
                <div className="hidden md:flex gap-6">
                  {/* Desktop: Multiple CTAs */}
                  {profile.contact_info && (profile.contact_info as any).email && (
                    <Button variant="hero" size="lg" asChild className="group">
                      <a href={`mailto:${(profile.contact_info as any).email}`}>
                        <Mail className="w-5 h-5 mr-2" />
                        Book Now
                        <Star className="w-5 h-5 ml-2 group-hover:animate-spin" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </section>

          <div className="container mx-auto px-4 py-8 md:py-12 max-w-7xl">
            {/* Mobile Connect Section - Replaces Key Stats on mobile */}
            <section className="md:hidden mb-8">
              <Card className="glass-card border-glass">
                <CardHeader>
                  <CardTitle className="text-center text-2xl">Connect with {profile.artist_name}</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Location and Performance Type */}
                  <div className="flex justify-center gap-6 mb-6 text-center">
                    <div className="flex flex-col items-center">
                      <MapPin className="w-6 h-6 text-accent mb-1" />
                      <span className="text-sm font-medium text-foreground">{profile.location || 'Location'}</span>
                    </div>
                    <div className="flex flex-col items-center">
                      {profile.performance_type === 'Solo Act' && <UserIcon className="w-6 h-6 text-primary mb-1" />}
                      {profile.performance_type === 'Duo' && <Users2 className="w-6 h-6 text-primary mb-1" />}
                      {profile.performance_type === 'Full Band' && <Guitar className="w-6 h-6 text-primary mb-1" />}
                      {(!profile.performance_type || (profile.performance_type !== 'Solo Act' && profile.performance_type !== 'Duo' && profile.performance_type !== 'Full Band')) && <Users className="w-6 h-6 text-primary mb-1" />}
                      <span className="text-sm font-medium text-foreground">
                        {profile.performance_type === 'Solo Act' ? 'Solo Act' : 
                         profile.performance_type === 'Duo' ? 'Duo' :
                         profile.performance_type === 'Full Band' ? 'Full Band' : 
                         profile.performance_type || 'Artist'}
                      </span>
                    </div>
                  </div>

                  {/* Social Links Row */}
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
                        <img src={instagramIcon} alt="Instagram" className="w-10 h-10" />
                      </a>
                    )}
                    {socialLinks.tiktok && (
                      <a 
                        href={socialLinks.tiktok} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:scale-110 transition-transform duration-300"
                      >
                        <img src={tiktokIcon} alt="TikTok" className="w-10 h-10" />
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Key Stats Section - Desktop Only */}
            <section className="hidden md:grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 md:mb-16">
              <Card className="glass-card border-glass text-center p-6">
                <CardContent className="p-0">
                  <Users className="w-8 h-8 text-primary mx-auto mb-2" />
                  <h3 className="text-2xl font-bold text-foreground">Live</h3>
                  <p className="text-sm text-muted-foreground">Performance Ready</p>
                </CardContent>
              </Card>
              
              <Card className="glass-card border-glass text-center p-6">
                <CardContent className="p-0">
                  <MapPin className="w-8 h-8 text-primary mx-auto mb-2" />
                  <h3 className="text-2xl font-bold text-foreground">
                    {profile.location || 'Touring'}
                  </h3>
                  <p className="text-sm text-muted-foreground">Based in</p>
                </CardContent>
              </Card>
              
              <Card className="glass-card border-glass text-center p-6">
                <CardContent className="p-0">
                  <Calendar className="w-8 h-8 text-accent mx-auto mb-2" />
                  <h3 className="text-2xl font-bold text-foreground">
                    {(() => {
                      const upcomingCount = (profile.upcoming_shows && Array.isArray(profile.upcoming_shows)) ? 
                        profile.upcoming_shows.length : 0;
                      return upcomingCount > 0 ? upcomingCount : 'Open';
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

            {/* Featured Track Section */}
            {profile.featured_track_url && (
              <section id="featured-track-player" className="mb-8 md:mb-16">
                <div className="w-full">
                  <FeaturedTrackEmbed trackUrl={profile.featured_track_url} />
                </div>
              </section>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6 md:space-y-8">
                {/* Videos Section */}
                {profile.show_videos && profile.show_videos.length > 0 && (
                  <section id="videos" className="glass-card border-glass p-4 md:p-8 rounded-xl">
                    <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 flex items-center gap-3">
                      <Play className="w-6 md:w-8 h-6 md:h-8 text-primary" />
                      Live Performance Videos
                    </h2>
                    <VideoCarousel videos={profile.show_videos} artistName={profile.artist_name} />
                  </section>
                )}

                {/* Bio Section with Mobile Truncation */}
                {profile.bio && (
                  <section className="glass-card border-glass p-4 md:p-8 rounded-xl">
                    <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Artist Biography</h2>
                    <div className="text-muted-foreground leading-relaxed text-base md:text-lg">
                      {/* Mobile: Truncated bio with expand/collapse */}
                      <div className="md:hidden">
                        <p className="mb-4">
                          {bioExpanded ? profile.bio : getTruncatedBio(profile.bio)}
                        </p>
                        {profile.bio.split(' ').length > 100 && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setBioExpanded(!bioExpanded)}
                            className="text-primary hover:text-primary/80"
                          >
                            {bioExpanded ? 'Show Less' : 'Show More'}
                          </Button>
                        )}
                      </div>
                      {/* Desktop: Full bio */}
                      <div className="hidden md:block">
                        <p className="whitespace-pre-wrap">{profile.bio}</p>
                      </div>
                    </div>
                  </section>
                )}

                {/* Gallery Photos - Full Width */}
                {profile.gallery_photos && profile.gallery_photos.length > 0 && (
                  <section className="w-full">
                    <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-center">Photo Gallery</h2>
                    <GallerySlideshow photos={profile.gallery_photos} artistName={profile.artist_name} />
                  </section>
                )}

                {/* Press & Reviews Section - Full Width on Desktop */}
                {profile.press_quotes && Array.isArray(profile.press_quotes) && profile.press_quotes.length > 0 && (
                  <section className="glass-card border-glass p-4 md:p-8 rounded-xl">
                    <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 flex items-center gap-3">
                      <Quote className="w-6 md:w-8 h-6 md:h-8 text-accent" />
                      Press & Reviews
                    </h2>
                    <div className="space-y-4 md:space-y-6">
                      {profile.press_quotes.map((quote: any, index: number) => (
                        <blockquote key={index} className="border-l-4 border-primary pl-4 md:pl-6 bg-white/5 p-4 md:p-6 rounded-r-lg hover:shadow-glow transition-all duration-300">
                          <p className="italic text-lg md:text-xl mb-3 md:mb-4 leading-relaxed">"{quote.text}"</p>
                          <cite className="text-base md:text-lg font-bold text-primary">— {quote.source}</cite>
                        </blockquote>
                      ))}
                    </div>
                  </section>
                )}

                {/* Press Coverage Section - Mobile Only (moved to sidebar on desktop) */}
                {profile.press_mentions && Array.isArray(profile.press_mentions) && profile.press_mentions.length > 0 && (
                  <section className="md:hidden glass-card border-glass p-4 rounded-xl">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                      <ExternalLink className="w-6 h-6 text-accent" />
                      Press Coverage
                    </h2>
                    <div className="space-y-3">
                      {profile.press_mentions.map((mention: any, index: number) => (
                        <div key={index} className="bg-white/5 p-4 rounded-lg hover:bg-white/10 transition-all duration-300">
                          <h3 className="text-lg font-bold text-foreground mb-2">{mention.title}</h3>
                          <p className="text-muted-foreground mb-3 text-sm">{mention.description}</p>
                          <div className="flex items-center gap-3">
                            <span className="text-primary font-medium text-sm">{mention.source}</span>
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

              {/* Sidebar - Hidden on mobile since Connect moved above */}
              <div className="hidden md:block space-y-6">
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
                          <img src={instagramIcon} alt="Instagram" className="w-10 h-10" />
                        </a>
                      )}
                      {socialLinks.tiktok && (
                        <a 
                          href={socialLinks.tiktok} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:scale-110 transition-transform duration-300"
                        >
                          <img src={tiktokIcon} alt="TikTok" className="w-10 h-10" />
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Streaming Links */}
                {profile.streaming_links && Object.keys(profile.streaming_links).length > 0 && (
                  <Card className="glass-card border-glass">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <Music className="w-6 h-6 text-primary" />
                        Listen Now
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {profile.streaming_links.spotify && (
                        <Button asChild variant="default" className="w-full bg-green-600 hover:bg-green-700">
                          <a 
                            href={profile.streaming_links.spotify} 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <img src={spotifyLightIcon} alt="Spotify" className="w-5 h-5 mr-2" />
                            Spotify
                            <ExternalLink className="w-4 h-4 ml-auto" />
                          </a>
                        </Button>
                      )}
                      {profile.streaming_links.soundcloud && (
                        <Button asChild variant="outline" className="w-full">
                          <a 
                            href={profile.streaming_links.soundcloud} 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <img src={soundcloudLightIcon} alt="SoundCloud" className="w-5 h-5 mr-2" />
                            SoundCloud
                            <ExternalLink className="w-4 h-4 ml-auto" />
                          </a>
                        </Button>
                      )}
                      {profile.streaming_links.bandcamp && (
                        <Button asChild variant="outline" className="w-full">
                          <a 
                            href={profile.streaming_links.bandcamp} 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <img src={bandcampLightIcon} alt="Bandcamp" className="w-5 h-5 mr-2" />
                            Bandcamp
                            <ExternalLink className="w-4 h-4 ml-auto" />
                          </a>
                        </Button>
                      )}
                      {profile.streaming_links.appleMusic && (
                        <Button asChild variant="outline" className="w-full">
                          <a 
                            href={profile.streaming_links.appleMusic} 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <img src={appleMusicLightIcon} alt="Apple Music" className="w-5 h-5 mr-2" />
                            Apple Music
                            <ExternalLink className="w-4 h-4 ml-auto" />
                          </a>
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Featured Show */}
                {profile.upcoming_shows && Array.isArray(profile.upcoming_shows) && profile.upcoming_shows.filter((show: any) => show.is_highlighted || show.featured).length > 0 && (
                  <Card className="glass-card border-glass">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <Star className="w-6 h-6 text-primary" />
                        Featured Show
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {profile.upcoming_shows.filter((show: any) => show.is_highlighted || show.featured).slice(0, 1).map((show: any, index: number) => (
                        <div key={index} className="bg-gradient-to-r from-primary/20 to-accent/20 p-4 rounded-lg border border-primary/30">
                          <h3 className="font-bold text-lg mb-2 text-primary">{show.venue}</h3>
                          <div className="flex items-center gap-2 text-muted-foreground mb-2 text-sm">
                            <MapPin className="w-3 h-3" />
                            <span>{getShowLocation(show)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground mb-3 text-sm">
                            <Calendar className="w-3 h-3" />
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
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-6 h-6 text-primary" />
                          Upcoming Shows
                        </div>
                        {shouldShowViewAllButton && (
                          <AllShowsModal 
                            allShows={allShows}
                            artistName={profile.artist_name}
                            className="ml-auto"
                          />
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 md:space-y-4">
                      {profile.upcoming_shows
                        .filter((show: any) => !show.featured)
                        .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
                        .slice(0, 2)
                        .map((show: any, index: number) => (
                        <div key={index} className="bg-white/5 p-3 md:p-4 rounded-lg">
                          <h3 className="font-bold text-base md:text-lg mb-2">{show.venue}</h3>
                          <div className="flex items-center gap-2 text-muted-foreground mb-2 text-sm">
                            <MapPin className="w-3 md:w-4 h-3 md:h-4" />
                            <span>{getShowLocation(show)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground mb-3 text-sm">
                            <Calendar className="w-3 md:w-4 h-3 md:h-4" />
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
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Users className="w-6 h-6 text-accent" />
                          Recent Shows
                        </div>
                        {!shouldShowViewAllButton && allShows.length > 4 && (
                          <AllShowsModal 
                            allShows={allShows}
                            artistName={profile.artist_name}
                            className="ml-auto"
                          />
                        )}
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

                {/* Press Coverage Section - Sidebar on Desktop */}
                {profile.press_mentions && Array.isArray(profile.press_mentions) && profile.press_mentions.length > 0 && (
                  <Card className="glass-card border-glass">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 text-lg">
                        <ExternalLink className="w-5 h-5 text-accent" />
                        Press Coverage
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {profile.press_mentions.map((mention: any, index: number) => (
                        <div key={index} className="bg-white/5 p-3 rounded-lg hover:bg-white/10 transition-all duration-300">
                          <h3 className="text-sm font-bold text-foreground mb-1 leading-tight">{mention.title}</h3>
                          <p className="text-muted-foreground mb-2 text-xs leading-relaxed line-clamp-2">{mention.description}</p>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-primary font-medium text-xs truncate">{mention.source}</span>
                            {mention.url && (
                              <Button variant="outline" size="sm" asChild className="h-7 px-2 text-xs">
                                <a href={mention.url} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="w-3 h-3 mr-1" />
                                  Read
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
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
        
        {/* Navigation Buttons - Optimized for touch */}
        {photos.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 md:p-3 rounded-full transition-all duration-300 hover:scale-110 min-h-[44px] min-w-[44px]"
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-5 md:w-6 h-5 md:h-6" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 md:p-3 rounded-full transition-all duration-300 hover:scale-110 min-h-[44px] min-w-[44px]"
              aria-label="Next photo"
            >
              <ChevronRight className="w-5 md:w-6 h-5 md:h-6" />
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