import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Instagram, Globe, Music, MapPin, Calendar, Ticket } from "lucide-react";
import DragDropContainer from "@/components/DragDropContainer";
import DragDropSection from "@/components/DragDropSection";
import PrivateImage from "@/components/PrivateImage";
import { useState } from "react";

// Import streaming service icons
import spotifyIcon from "@/assets/streaming/spotify-color.png";
import appleIcon from "@/assets/streaming/apple-music-color.svg";
import bandcampIcon from "@/assets/streaming/bandcamp-color.png";
import soundcloudIcon from "@/assets/streaming/soundcloud-color.png";

interface ArtistProfile {
  id: string;
  user_id: string;
  artist_name: string;
  bio?: string;
  genre?: string[];
  social_links?: any;
  profile_photo_url?: string;
  press_photos?: { url: string; label?: string }[];
  pdf_urls?: string[];
  hero_photo_url?: string;
  show_videos?: string[];
  gallery_photos?: { url: string; label?: string }[];
  press_quotes?: any[];
  press_mentions?: any[];
  streaming_links?: any;
  playlists?: string[];
  past_shows?: any[];
  upcoming_shows?: any[];
  contact_info?: any;
  created_at: string;
  updated_at: string;
}

interface ArtistProfileViewProps {
  profile: ArtistProfile;
}

export default function ArtistProfileView({ profile }: ArtistProfileViewProps) {
  const [sectionOrder, setSectionOrder] = useState([
    'bio',
    'videos',
    'gallery', 
    'press-quotes',
    'press-mentions',
    'shows',
    'streaming',
    'documents'
  ]);
  return (
    <div className="space-y-6">
      {/* Hero Section */}
      {profile.hero_photo_url && (
        <div className="relative h-48 md:h-64 rounded-lg overflow-hidden">
          <img
            src={profile.hero_photo_url}
            alt="Hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>
      )}

      {/* Main Profile Card */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl gradient-text">{profile.artist_name}</CardTitle>
              {profile.genre && profile.genre.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {profile.genre.map((genre, index) => (
                    <Badge key={index} variant="secondary">{genre}</Badge>
                  ))}
                </div>
              )}
              {profile.contact_info?.email && (
                <div className="mt-1">
                  <span className="text-xs text-muted-foreground/70">Email: </span>
                  <span className="text-sm text-muted-foreground">{profile.contact_info.email}</span>
                </div>
              )}
              {profile.contact_info?.phone && (
                <div>
                  <span className="text-xs text-muted-foreground/70">Phone: </span>
                  <span className="text-sm text-muted-foreground">{profile.contact_info.phone}</span>
                </div>
              )}
            </div>
            {profile.profile_photo_url && (
              <PrivateImage
                storagePath={profile.profile_photo_url}
                alt={profile.artist_name}
                className="w-32 h-32 rounded-full object-cover border-4 border-white/20 shadow-lg"
              />
            )}
          </div>
        </CardHeader>
        <CardContent>
          {profile.social_links && (
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Social Links</h3>
              <div className="flex flex-wrap gap-3">
                {profile.social_links.website && (
                  <a
                    href={profile.social_links.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-md bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <Globe className="w-4 h-4" />
                    Website
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {profile.social_links.instagram && (
                  <a
                    href={`https://instagram.com/${profile.social_links.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-md bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <Instagram className="w-4 h-4" />
                    Instagram
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {profile.social_links.spotify && (
                  <a
                    href={profile.social_links.spotify}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-md bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <Music className="w-4 h-4" />
                    Spotify
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Draggable Sections */}
          <div className="pl-8">
            <DragDropContainer
              items={sectionOrder}
              onReorder={setSectionOrder}
            >
              {sectionOrder.map(sectionId => {
                // Bio Section
                if (sectionId === 'bio' && profile.bio) {
                  return (
                    <DragDropSection key="bio" id="bio">
                      <div className="mb-6">
                        <h3 className="font-semibold mb-2">Bio</h3>
                        <p className="text-muted-foreground leading-relaxed">{profile.bio}</p>
                      </div>
                    </DragDropSection>
                  );
                }

                // Videos Section
                if (sectionId === 'videos' && profile.show_videos && profile.show_videos.length > 0) {
                  return (
                    <DragDropSection key="videos" id="videos">
                      <div className="mb-6">
                        <h3 className="font-semibold mb-3">Videos</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {profile.show_videos.map((video, index) => (
                            <DragDropSection
                              key={`video-${index}`}
                              id={`video-${index}`}
                              onDelete={() => {
                                // Handle video deletion
                              }}
                              isDraggable={false}
                            >
                              <div className="aspect-video rounded-md overflow-hidden bg-white/5">
                                <iframe
                                  src={video.replace('watch?v=', 'embed/')}
                                  className="w-full h-full"
                                  frameBorder="0"
                                  allowFullScreen
                                />
                              </div>
                            </DragDropSection>
                          ))}
                        </div>
                      </div>
                    </DragDropSection>
                  );
                }

                // Gallery Section
                if (sectionId === 'gallery' && profile.gallery_photos && profile.gallery_photos.length > 0) {
                  return (
                    <DragDropSection key="gallery" id="gallery">
                      <div className="mb-6">
                        <h3 className="font-semibold mb-3">Gallery</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {profile.gallery_photos.slice(0, 7).map((photo, index) => (
                            <DragDropSection
                              key={`gallery-${index}`}
                              id={`gallery-${index}`}
                              onDelete={() => {
                                // Handle photo deletion
                              }}
                              isDraggable={false}
                            >
                              <div className="relative">
                                <img
                                  src={typeof photo === 'string' ? photo : photo.url}
                                  alt={typeof photo === 'string' ? `Gallery ${index + 1}` : photo.label || `Gallery ${index + 1}`}
                                  className="w-full h-24 object-cover rounded-md border border-white/20"
                                />
                                {typeof photo !== 'string' && photo.label && (
                                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 rounded-b-md">
                                    {photo.label}
                                  </div>
                                )}
                              </div>
                            </DragDropSection>
                          ))}
                        </div>
                      </div>
                    </DragDropSection>
                  );
                }

                // Press Quotes Section
                if (sectionId === 'press-quotes' && profile.press_quotes && profile.press_quotes.length > 0) {
                  return (
                    <DragDropSection key="press-quotes" id="press-quotes">
                      <div className="mb-6">
                        <h3 className="font-semibold mb-3">Press Quotes</h3>
                        <div className="space-y-3">
                          {profile.press_quotes.map((quote: any, index: number) => (
                            <DragDropSection
                              key={`quote-${index}`}
                              id={`quote-${index}`}
                              onDelete={() => {
                                // Handle quote deletion
                              }}
                              isDraggable={false}
                            >
                              <blockquote className="border-l-4 border-primary pl-4 bg-white/5 p-3 rounded-r-md">
                                <p className="italic text-muted-foreground">"{quote.text}"</p>
                                <cite className="text-sm font-medium mt-2 block">— {quote.source}</cite>
                              </blockquote>
                            </DragDropSection>
                          ))}
                        </div>
                      </div>
                    </DragDropSection>
                  );
                }

                // Press Mentions Section
                if (sectionId === 'press-mentions' && profile.press_mentions && profile.press_mentions.length > 0) {
                  return (
                    <DragDropSection key="press-mentions" id="press-mentions">
                      <div className="mb-6">
                        <h3 className="font-semibold mb-3">Press Mentions</h3>
                        <div className="flex flex-wrap gap-2">
                          {profile.press_mentions.map((mention: any, index: number) => (
                            <DragDropSection
                              key={`mention-${index}`}
                              id={`mention-${index}`}
                              onDelete={() => {
                                // Handle mention deletion
                              }}
                              isDraggable={false}
                            >
                              <a
                                href={mention.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-3 py-2 rounded-md bg-white/5 hover:bg-white/10 transition-colors"
                              >
                                <span>{mention.publication}</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </DragDropSection>
                          ))}
                        </div>
                      </div>
                    </DragDropSection>
                  );
                }

                // Shows Section
                if (sectionId === 'shows' && profile.upcoming_shows && profile.upcoming_shows.length > 0) {
                  return (
                    <DragDropSection key="shows" id="shows">
                      <div className="mb-6">
                        <h3 className="font-semibold mb-3">Upcoming Shows</h3>
                        <div className="space-y-2">
                          {profile.upcoming_shows.map((show: any, index: number) => (
                            <DragDropSection
                              key={`show-${index}`}
                              id={`show-${index}`}
                              onDelete={() => {
                                // Handle show deletion
                              }}
                              isDraggable={false}
                            >
                              <div className="flex items-center justify-between p-3 bg-white/5 rounded-md">
                                <div className="flex items-center gap-3">
                                  <Calendar className="w-5 h-5 text-primary" />
                                  <div>
                                    <p className="font-medium">{show.venue}</p>
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
                            </DragDropSection>
                          ))}
                        </div>
                      </div>
                    </DragDropSection>
                  );
                }

                // Streaming Section
                if (sectionId === 'streaming' && profile.streaming_links && typeof profile.streaming_links === 'object' && profile.streaming_links !== null && !Array.isArray(profile.streaming_links) && Object.keys(profile.streaming_links).length > 0) {
                  return (
                    <DragDropSection key="streaming" id="streaming">
                      <div className="mb-6">
                        <h3 className="font-semibold mb-3">Listen</h3>
                        <div className="flex flex-wrap gap-3">
                          {profile.streaming_links.spotify && (
                            <a
                              href={profile.streaming_links.spotify}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                            >
                              <img 
                                src={spotifyIcon} 
                                alt="Spotify" 
                                className="w-8 h-8"
                              />
                            </a>
                          )}
                          {profile.streaming_links.apple_music && (
                            <a
                              href={profile.streaming_links.apple_music}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                            >
                              <img 
                                src={appleIcon} 
                                alt="Apple Music" 
                                className="w-8 h-8"
                              />
                            </a>
                          )}
                          {profile.streaming_links.bandcamp && (
                            <a
                              href={profile.streaming_links.bandcamp}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                            >
                              <img 
                                src={bandcampIcon} 
                                alt="Bandcamp" 
                                className="w-8 h-8"
                              />
                            </a>
                          )}
                          {profile.streaming_links.soundcloud && (
                            <a
                              href={profile.streaming_links.soundcloud}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                            >
                              <img 
                                src={soundcloudIcon} 
                                alt="SoundCloud" 
                                className="w-8 h-8"
                              />
                            </a>
                          )}
                        </div>
                      </div>
                    </DragDropSection>
                  );
                }

                // Documents Section
                if (sectionId === 'documents' && profile.pdf_urls && profile.pdf_urls.length > 0) {
                  return (
                    <DragDropSection key="documents" id="documents">
                      <div className="mb-6">
                        <h3 className="font-semibold mb-3">Documents</h3>
                        <div className="space-y-2">
                          {profile.pdf_urls.map((pdf, index) => (
                            <DragDropSection
                              key={`doc-${index}`}
                              id={`doc-${index}`}
                              onDelete={() => {
                                // Handle document deletion
                              }}
                              isDraggable={false}
                            >
                              <a
                                href={pdf}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-3 py-2 rounded-md bg-white/5 hover:bg-white/10 transition-colors"
                              >
                                <span>Document {index + 1}</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </DragDropSection>
                          ))}
                        </div>
                      </div>
                    </DragDropSection>
                  );
                }

                return null;
              })}
            </DragDropContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}