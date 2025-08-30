import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Instagram, Globe, Music, MapPin, Calendar, Ticket, Edit3, Plus } from "lucide-react";
import PrivateImage from "@/components/PrivateImage";
import InlineEditor from "@/components/InlineEditor";
import GalleryEditor from "@/components/GalleryEditor";
import MentionsEditor from "@/components/MentionsEditor";
import ShowsEditor from "@/components/ShowsEditor";
import { User } from "@supabase/supabase-js";

interface LivePreviewEditorProps {
  profile: any;
  onProfileUpdated: () => void;
  user: User | null;
}

export default function LivePreviewEditor({ profile, onProfileUpdated, user }: LivePreviewEditorProps) {
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const scrollPositionRef = useRef<number>(0);

  // Persist state when user switches tabs
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // Store scroll position when tab becomes hidden
        scrollPositionRef.current = window.scrollY;
      } else {
        // Restore scroll position when tab becomes visible
        setTimeout(() => {
          window.scrollTo(0, scrollPositionRef.current);
        }, 100);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const handleSectionClick = (sectionId: string) => {
    setEditingSection(editingSection === sectionId ? null : sectionId);
  };

  const handleSectionSave = (callback?: () => void) => {
    // Save current scroll position
    const currentScrollY = window.scrollY;
    
    // Update the profile data
    onProfileUpdated();
    
    // Don't close editing section, maintain scroll position
    setTimeout(() => {
      window.scrollTo(0, currentScrollY);
    }, 50);
    
    // Run any additional callback
    if (callback) callback();
  };

  // Function to render shows with automatic date-based sorting
  const renderShowsSection = () => {
    const allShows = profile.upcoming_shows || [];
    
    if (allShows.length === 0) {
      return (
        <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 text-center">
          <Plus className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
          <p className="text-muted-foreground">Click to add shows</p>
        </div>
      );
    }

    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison
    
    // Separate and sort shows
    const upcomingShows = allShows
      .filter((show: any) => new Date(show.date) >= currentDate)
      .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    const pastShows = allShows
      .filter((show: any) => new Date(show.date) < currentDate)
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
      <div>
        <h3 className="font-semibold mb-4">Shows</h3>
        <div className="space-y-6">
          {/* Upcoming Shows */}
          {upcomingShows.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-primary mb-3">Upcoming Shows</h4>
              <div className="space-y-2">
                {upcomingShows.map((show: any, index: number) => (
                  <div key={`upcoming-${index}`} className="flex items-center justify-between p-3 bg-white/5 rounded-md border border-primary/20">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">{show.venue}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {show.city} • {new Date(show.date).toLocaleDateString()}
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
            </div>
          )}

          {/* Past Shows */}
          {pastShows.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-3">Past Shows</h4>
              <div className="space-y-2">
                {pastShows.map((show: any, index: number) => (
                  <div key={`past-${index}`} className="flex items-center justify-between p-3 bg-white/5 rounded-md opacity-75">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-muted-foreground">{show.venue}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {show.city} • {new Date(show.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderEditableSection = (sectionId: string, content: React.ReactNode, hasContent: boolean = true) => {
    const isEditing = editingSection === sectionId;
    
    if (isEditing) {
      // Render inline editing directly within the content area
      return (
        <div className="space-y-4">
          <InlineEditor
            sectionId={sectionId}
            profile={profile}
            user={user}
            onSave={() => handleSectionSave()}
            onCancel={() => setEditingSection(null)}
          />
        </div>
      );
    }
    
    return (
      <div className="group relative">
        <div 
          className={`cursor-pointer transition-all duration-200 hover:bg-white/5 rounded-lg p-2 ${
            !hasContent ? 'border-2 border-dashed border-muted-foreground/30 rounded-lg p-8' : ''
          }`}
          onClick={() => handleSectionClick(sectionId)}
        >
          {hasContent ? content : (
            <div className="text-center py-8">
              <Plus className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground">Click to add {sectionId}</p>
            </div>
          )}
          {hasContent && (
            <Button
              size="sm"
              variant="outline"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm"
            >
              <Edit3 className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>
    );
  };

  if (!profile) {
    return (
      <Card className="glass-card border-white/10">
        <CardContent className="py-12 text-center">
          <h2 className="text-xl font-semibold mb-4">Welcome to your Press Kit Builder</h2>
          <p className="text-muted-foreground mb-6">
            Create your professional press kit by filling out each section below.
          </p>
          <Button onClick={() => setEditingSection('basic')}>
            Get Started
          </Button>
          {editingSection === 'basic' && (
            <div className="mt-6">
              <InlineEditor
                sectionId="basic"
                profile={null}
                user={user}
                onSave={() => handleSectionSave(() => setEditingSection(null))}
                onCancel={() => setEditingSection(null)}
              />
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      {renderEditableSection(
        'hero',
        profile.hero_photo_url ? (
          <div className="relative h-48 md:h-64 rounded-lg overflow-hidden">
            <PrivateImage
              storagePath={profile.hero_photo_url}
              alt="Hero"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </div>
        ) : null,
        !!profile.hero_photo_url
      )}

      {/* Main Profile Card */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          {renderEditableSection(
            'basic',
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl gradient-text">{profile.artist_name}</CardTitle>
                {profile.genre && profile.genre.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {profile.genre.map((genre: string, index: number) => (
                      <Badge key={index} variant="secondary">{genre}</Badge>
                    ))}
                  </div>
                )}
                {profile.contact_info?.email && (
                  <p className="text-sm text-muted-foreground mt-1">{profile.contact_info.email}</p>
                )}
                {profile.contact_info?.phone && (
                  <p className="text-sm text-muted-foreground">{profile.contact_info.phone}</p>
                )}
                
                {/* Streaming Links */}
                {profile.streaming_links && Object.keys(profile.streaming_links).length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Listen</h4>
                    <div className="flex flex-wrap gap-2">
                      {profile.streaming_links.spotify && (
                        <a
                          href={profile.streaming_links.spotify}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-green-600 hover:bg-green-700 text-white transition-colors"
                        >
                          <Music className="w-3 h-3" />
                          Spotify
                        </a>
                      )}
                      {profile.streaming_links.apple_music && (
                        <a
                          href={profile.streaming_links.apple_music}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-gray-800 hover:bg-gray-900 text-white transition-colors"
                        >
                          <Music className="w-3 h-3" />
                          Apple Music
                        </a>
                      )}
                      {profile.streaming_links.bandcamp && (
                        <a
                          href={profile.streaming_links.bandcamp}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                        >
                          <Music className="w-3 h-3" />
                          Bandcamp
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
              {profile.profile_photo_url && (
                <PrivateImage
                  storagePath={profile.profile_photo_url}
                  alt={profile.artist_name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-white/20 shadow-lg ml-4"
                />
              )}
            </div>,
            !!(profile.artist_name || profile.profile_photo_url)
          )}
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Social Links */}
          {renderEditableSection(
            'social',
            profile.social_links && Object.keys(profile.social_links).length > 0 ? (
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
                  {profile.social_links.tiktok && (
                    <a
                      href={`https://tiktok.com/@${profile.social_links.tiktok.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 rounded-md bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      <Music className="w-4 h-4" />
                      TikTok
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ) : null,
            !!(profile.social_links && Object.keys(profile.social_links).length > 0)
          )}

          {/* Bio Section */}
          {renderEditableSection(
            'bio',
            profile.bio ? (
              <div>
                <h3 className="font-semibold mb-2">Bio</h3>
                <p className="text-muted-foreground leading-relaxed">{profile.bio}</p>
              </div>
            ) : null,
            !!profile.bio
          )}

          {/* Gallery Section */}
          {editingSection === 'gallery' ? (
            <div className="space-y-4">
              <GalleryEditor
                profile={profile}
                user={user}
                onSave={() => handleSectionSave()}
                onCancel={() => setEditingSection(null)}
              />
            </div>
          ) : (
            <div className="group relative">
              <div 
                className="cursor-pointer transition-all duration-200 hover:bg-white/5 rounded-lg p-2"
                onClick={() => handleSectionClick('gallery')}
              >
                {profile.gallery_photos && profile.gallery_photos.length > 0 ? (
                  <div>
                    <h3 className="font-semibold mb-3">Gallery</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {profile.gallery_photos.slice(0, 12).map((photo: any, index: number) => (
                        <div key={index} className="relative">
                          <PrivateImage
                            storagePath={typeof photo === 'string' ? photo : photo.url}
                            alt={typeof photo === 'string' ? `Gallery ${index + 1}` : photo.label || `Gallery ${index + 1}`}
                            className="w-full h-24 object-cover rounded-md border border-white/20"
                          />
                          {(typeof photo !== 'string' && photo.label) && (
                            <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-1 rounded-b-md">
                              <p className="text-xs truncate">{photo.label}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {profile.gallery_photos.length} of 12 photos
                    </p>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 text-center">
                    <Plus className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground">Click to add gallery photos</p>
                  </div>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm"
                >
                  <Edit3 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          )}

          {/* Videos Section */}
          {renderEditableSection(
            'videos',
            profile.show_videos && profile.show_videos.length > 0 ? (
              <div>
                <h3 className="font-semibold mb-3">Videos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {profile.show_videos.map((video: string, index: number) => (
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
            ) : null,
            !!(profile.show_videos && profile.show_videos.length > 0)
          )}

          {/* Two Column Layout: Press Mentions & Shows */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column: Press Mentions */}
            <div>
              {editingSection === 'mentions' ? (
                <div className="space-y-4">
                  <MentionsEditor
                    profile={profile}
                    user={user}
                    onSave={() => handleSectionSave()}
                    onCancel={() => setEditingSection(null)}
                  />
                </div>
              ) : (
                <div className="group relative">
                  <div 
                    className="cursor-pointer transition-all duration-200 hover:bg-white/5 rounded-lg p-2"
                    onClick={() => handleSectionClick('mentions')}
                  >
                    {profile.press_mentions && profile.press_mentions.length > 0 ? (
                      <div>
                        <h3 className="font-semibold mb-3">Press Mentions</h3>
                        <div className="space-y-3">
                          {profile.press_mentions.map((mention: any, index: number) => (
                            <a
                              key={index}
                              href={mention.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                            >
                              {mention.favicon && (
                                <img src={mention.favicon} alt="" className="w-4 h-4" />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{mention.title || mention.publication}</p>
                                <p className="text-xs text-muted-foreground truncate">{mention.description}</p>
                              </div>
                              <ExternalLink className="w-3 h-3 opacity-50" />
                            </a>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 text-center">
                        <Plus className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-muted-foreground">Click to add press mentions</p>
                      </div>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm"
                    >
                      <Edit3 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Shows */}
            <div>
              {editingSection === 'shows' ? (
                <div className="space-y-4">
                  <ShowsEditor
                    profile={profile}
                    user={user}
                    onSave={() => handleSectionSave()}
                    onCancel={() => setEditingSection(null)}
                  />
                </div>
              ) : (
                <div className="group relative">
                  <div 
                    className="cursor-pointer transition-all duration-200 hover:bg-white/5 rounded-lg p-2"
                    onClick={() => handleSectionClick('shows')}
                  >
                    {renderShowsSection()}
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm"
                    >
                      <Edit3 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}