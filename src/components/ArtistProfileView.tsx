import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Instagram, Globe, Music } from "lucide-react";

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
                <p className="text-sm text-muted-foreground mt-1">{profile.contact_info.email}</p>
              )}
            </div>
            {profile.profile_photo_url && (
              <img
                src={profile.profile_photo_url}
                alt={profile.artist_name}
                className="w-20 h-20 rounded-full object-cover border-2 border-white/20"
              />
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {profile.bio && (
            <div>
              <h3 className="font-semibold mb-2">Bio</h3>
              <p className="text-muted-foreground leading-relaxed">{profile.bio}</p>
            </div>
          )}

          {profile.social_links && (
            <div>
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

          {profile.show_videos && profile.show_videos.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Videos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {profile.show_videos.map((video, index) => (
                  <div key={index} className="aspect-video rounded-md overflow-hidden bg-white/5">
                    <iframe
                      src={video.replace('watch?v=', 'embed/')}
                      className="w-full h-full"
                      frameBorder="0"
                      allowFullScreen
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {profile.press_quotes && profile.press_quotes.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Press Quotes</h3>
              <div className="space-y-3">
                {profile.press_quotes.map((quote: any, index: number) => (
                  <blockquote key={index} className="border-l-4 border-primary pl-4 bg-white/5 p-3 rounded-r-md">
                    <p className="italic text-muted-foreground">"{quote.text}"</p>
                    <cite className="text-sm font-medium mt-2 block">— {quote.source}</cite>
                  </blockquote>
                ))}
              </div>
            </div>
          )}

          {profile.press_mentions && profile.press_mentions.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Press Mentions</h3>
              <div className="flex flex-wrap gap-2">
                {profile.press_mentions.map((mention: any, index: number) => (
                  <a
                    key={index}
                    href={mention.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-md bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <span>{mention.publication}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {profile.upcoming_shows && profile.upcoming_shows.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Upcoming Shows</h3>
              <div className="space-y-2">
                {profile.upcoming_shows.map((show: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-md">
                    <div>
                      <p className="font-medium">{show.venue}</p>
                      <p className="text-sm text-muted-foreground">{show.city} • {show.date}</p>
                    </div>
                    {show.ticket_link && (
                      <a
                        href={show.ticket_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-sm"
                      >
                        Tickets
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {profile.gallery_photos && profile.gallery_photos.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Gallery</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {profile.gallery_photos.slice(0, 7).map((photo, index) => (
                  <div key={index} className="relative">
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
                ))}
              </div>
            </div>
          )}

          {profile.press_photos && profile.press_photos.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Press Photos</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {profile.press_photos.map((photo, index) => (
                  <div key={index} className="relative">
                    <img
                      src={typeof photo === 'string' ? photo : photo.url}
                      alt={typeof photo === 'string' ? `Press photo ${index + 1}` : photo.label || `Press photo ${index + 1}`}
                      className="w-full h-24 object-cover rounded-md border border-white/20"
                    />
                    {typeof photo !== 'string' && photo.label && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 rounded-b-md">
                        {photo.label}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {profile.pdf_urls && profile.pdf_urls.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Documents</h3>
              <div className="space-y-2">
                {profile.pdf_urls.map((pdf, index) => (
                  <a
                    key={index}
                    href={pdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-md bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <span>Document {index + 1}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}