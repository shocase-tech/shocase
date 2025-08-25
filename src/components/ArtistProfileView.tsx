import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Instagram, Globe, Music } from "lucide-react";

interface ArtistProfile {
  id: string;
  user_id: string;
  artist_name: string;
  bio?: string;
  genre?: string;
  social_links?: any;
  profile_photo_url?: string;
  press_photos?: string[];
  pdf_urls?: string[];
  created_at: string;
  updated_at: string;
}

interface ArtistProfileViewProps {
  profile: ArtistProfile;
}

export default function ArtistProfileView({ profile }: ArtistProfileViewProps) {
  return (
    <Card className="glass-card border-white/10">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl gradient-text">{profile.artist_name}</CardTitle>
            {profile.genre && (
              <div className="mt-2">
                <Badge variant="secondary">{profile.genre}</Badge>
              </div>
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

        {profile.press_photos && profile.press_photos.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3">Press Photos</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {profile.press_photos.map((photo, index) => (
                <img
                  key={index}
                  src={photo}
                  alt={`Press photo ${index + 1}`}
                  className="w-full h-24 object-cover rounded-md border border-white/20"
                />
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
  );
}