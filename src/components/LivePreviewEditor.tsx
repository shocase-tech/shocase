import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Instagram, Globe, Music, MapPin, Calendar, Ticket, Edit3, Plus, Quote, Star, User as UserIcon, Users, Sparkles, FileText } from "lucide-react";
import PrivateImage from "@/components/PrivateImage";
import InlineEditor from "@/components/InlineEditor";
import MobileEditorModal from "@/components/MobileEditorModal";
import PressQuotesEditor from "@/components/PressQuotesEditor";
import GalleryEditor from "@/components/GalleryEditor";
import MentionsEditor from "@/components/MentionsEditor";
import ShowsEditor from "@/components/ShowsEditor";
import SaveIndicator from "@/components/SaveIndicator";
import { FeaturedTrackEmbed } from "@/components/FeaturedTrackEmbed";
import { useAutoSave } from "@/hooks/useAutoSave";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

// Import streaming service icons
import spotifyIcon from "@/assets/streaming/spotify-color.png";
import appleIcon from "@/assets/streaming/apple-music-color.svg";
import bandcampIcon from "@/assets/streaming/bandcamp-color.png";
import soundcloudIcon from "@/assets/streaming/soundcloud-color.png";

interface LivePreviewEditorProps {
  profile: {
    blurb?: string;
    performance_type?: 'Solo' | 'Duo' | 'Full Band';
  location?: string;
  featured_track_url?: string;
    [key: string]: any;
  };
  onProfileUpdated: (updatedData?: any) => void;
  user: User | null;
  editingSection?: string | null;
  onEditingSectionChange?: (section: string | null) => void;
  onFormDataChange?: (data: Record<string, any>) => void;
  initialFormData?: Record<string, any>;
  userEmail?: string;
  userPhone?: string;
}

export default function LivePreviewEditor({ 
  profile, 
  onProfileUpdated, 
  user, 
  editingSection: externalEditingSection,
  onEditingSectionChange,
  onFormDataChange,
  initialFormData,
  userEmail,
  userPhone
}: LivePreviewEditorProps) {
  // Use external state if provided, otherwise fall back to internal state
  const [internalEditingSection, setInternalEditingSection] = useState<string | null>(null);
  const editingSection = externalEditingSection !== undefined ? externalEditingSection : internalEditingSection;
  const setEditingSection = onEditingSectionChange || setInternalEditingSection;
  
  // Add editor switch tracking state
  const [isSwitchingEditor, setIsSwitchingEditor] = useState(false);
  
  // Mobile detection
  const isMobile = useIsMobile();
  
  const scrollPositionRef = useRef<number>(0);
  const formDataRef = useRef<Record<string, any>>(initialFormData || {});
  
  // Update form data ref when initialFormData changes (state restoration)
  useEffect(() => {
    if (initialFormData) {
      formDataRef.current = { ...formDataRef.current, ...initialFormData };
    }
  }, [initialFormData]);
  
  // Notify parent of form data changes
  const handleFormDataChange = (newData: Record<string, any>) => {
    // Merge with existing form data instead of replacing
    formDataRef.current = { ...formDataRef.current, ...newData };
    
    // Notify parent immediately
    onFormDataChange?.(formDataRef.current);
    
    // Also trigger a save to sessionStorage for persistence
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('editor_form_data', JSON.stringify(formDataRef.current));
      } catch (error) {
        console.warn('Failed to save form data to session storage:', error);
      }
    }
  };

  // Auto-save functionality for live editing
  const saveProfile = async (profileData: any) => {
    if (!user || !profileData?.id) return;
    
    const { error } = await supabase
      .from('artist_profiles')
      .update(profileData)
      .eq('user_id', user.id);
    
    if (error) throw error;
  };

  const {
    hasUnsavedChanges,
    isSaving,
    lastSaved,
    setUnsavedChanges,
  } = useAutoSave({
    data: profile,
    onSave: saveProfile,
    delay: 300,
    enabled: !!user && !!profile
  });

  // Enhanced section click handler for seamless editor switching
  const handleSectionClick = async (sectionId: string) => {
    console.log("🔍 LivePreviewEditor: Section clicked:", sectionId, "Current editing:", editingSection);
    
    // Prevent multiple rapid clicks during switching
    if (isSwitchingEditor) {
      console.log("🔍 LivePreviewEditor: Editor switch in progress, ignoring click");
      return;
    }
    
    // Same section clicked - toggle close
    if (editingSection === sectionId) {
      console.log("🔍 LivePreviewEditor: Toggling current section closed");
      setEditingSection(null);
      return;
    }
    
    // No current editor - open new one
    if (!editingSection) {
      console.log("🔍 LivePreviewEditor: Opening new section:", sectionId);
      setEditingSection(sectionId);
      return;
    }
    
    // Different section clicked - seamless switch
    if (editingSection !== sectionId) {
      console.log("🔍 LivePreviewEditor: Switching from", editingSection, "to", sectionId);
      setIsSwitchingEditor(true);
      
      try {
        // Get current editor's form data
        const currentSectionData = formDataRef.current[editingSection];
        
        if (currentSectionData && Object.keys(currentSectionData).length > 0) {
          // Auto-save current editor
          console.log("🔍 Auto-saving before switch:", editingSection, "→", sectionId);
          await new Promise<void>((resolve) => {
            handleSectionSave(currentSectionData, resolve);
          });
        }
        
        // Switch to new editor immediately
        setEditingSection(sectionId);
        
      } catch (error) {
        console.error("🔍 Error during editor switch:", error);
        // Switch anyway to prevent UI lock-up
        setEditingSection(sectionId);
      } finally {
        setIsSwitchingEditor(false);
      }
    }
  };

  const handleSectionSave = (updatedData?: any, callback?: () => void) => {
    // Save current scroll position
    const currentScrollY = window.scrollY;
    
    // Merge updated data with current profile to preserve all existing fields
    const mergedData = profile ? { ...profile, ...updatedData } : updatedData;
    
    // Deep merge nested objects to preserve existing keys
    if (updatedData && profile) {
      if (updatedData.social_links && profile.social_links) {
        mergedData.social_links = { ...profile.social_links, ...updatedData.social_links };
      }
      if (updatedData.streaming_links && profile.streaming_links) {
        mergedData.streaming_links = { ...profile.streaming_links, ...updatedData.streaming_links };
      }
      if (updatedData.contact_info && profile.contact_info) {
        mergedData.contact_info = { ...profile.contact_info, ...updatedData.contact_info };
      }
    }
    
    // Update the profile data and trigger auto-save
    onProfileUpdated(mergedData);
    setUnsavedChanges(true);
    
    // Close the editor when auto-saving from click-outside
    // Only close if no specific callback is provided (meaning it's from auto-save)
    if (!callback) {
      setEditingSection(null);
    }
    
    // Don't close editing section, maintain scroll position
    setTimeout(() => {
      window.scrollTo(0, currentScrollY);
    }, 50);
    
    // Run any additional callback
    if (callback) callback();
  };

  // Function to render shows with smart display logic and mobile optimization
  const renderShowsSection = () => {
    // Get all shows from both upcoming and past arrays
    const allShows = [...(profile.upcoming_shows || []), ...(profile.past_shows || [])];
    
    if (allShows.length === 0) {
      return (
        <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 md:p-8 text-center">
          <Plus className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
          <p className="text-muted-foreground text-sm">Click to add shows</p>
        </div>
      );
    }

    // Separate highlighted shows
    const highlightedShows = allShows.filter(show => show.is_highlighted);
    const regularShows = allShows.filter(show => !show.is_highlighted);
    
    // Separate regular shows by date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const regularUpcoming = regularShows
      .filter(show => new Date(show.date) >= today)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3);
      
    const regularPast = regularShows
      .filter(show => new Date(show.date) < today)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3);
    
    const totalShows = allShows.length;
    const displayedShows = highlightedShows.length + regularUpcoming.length + regularPast.length;
    const remainingShows = totalShows - displayedShows;

    return (
      <div>
        <h3 className="font-semibold mb-3 md:mb-4 text-base md:text-lg">Shows</h3>
        <div className="space-y-4 md:space-y-6">
          {/* Highlighted Shows */}
          {highlightedShows.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-primary mb-2 md:mb-3">Featured Shows</h4>
              <div className="space-y-2">
                {highlightedShows.map((show: any, index: number) => (
                  <div key={`highlighted-${index}`} className="flex flex-col md:flex-row md:items-center justify-between p-2 md:p-3 bg-primary/10 rounded-md border border-primary/30 shadow-sm gap-2 md:gap-0">
                    <div className="flex items-center gap-2 md:gap-3">
                      <Star className="w-4 h-4 text-yellow-500 fill-current flex-shrink-0" />
                      <Calendar className="w-4 md:w-5 h-4 md:h-5 text-primary flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium flex items-center gap-2 text-sm md:text-base">
                          <span className="truncate">{show.venue}</span>
                          <Badge variant="secondary" className="text-xs flex-shrink-0">Featured</Badge>
                        </p>
                        <p className="text-xs md:text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{show.city} • {new Date(show.date).toLocaleDateString()}</span>
                        </p>
                      </div>
                    </div>
                    {show.ticket_link && (
                      <a
                        href={show.ticket_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm min-h-[44px] w-full md:w-auto"
                      >
                        <Ticket className="w-4 h-4" />
                        <span>Tickets</span>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Shows */}
          {regularUpcoming.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-primary mb-2 md:mb-3">Upcoming Shows</h4>
              <div className="space-y-2">
                {regularUpcoming.map((show: any, index: number) => (
                  <div key={`upcoming-${index}`} className="flex flex-col md:flex-row md:items-center justify-between p-2 md:p-3 bg-white/5 rounded-md border border-primary/20 gap-2 md:gap-0">
                    <div className="flex items-center gap-2 md:gap-3">
                      <Calendar className="w-4 md:w-5 h-4 md:h-5 text-primary flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm md:text-base truncate">{show.venue}</p>
                        <p className="text-xs md:text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{show.city} • {new Date(show.date).toLocaleDateString()}</span>
                        </p>
                      </div>
                    </div>
                    {show.ticket_link && (
                      <a
                        href={show.ticket_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm min-h-[44px] w-full md:w-auto"
                      >
                        <Ticket className="w-4 h-4" />
                        <span>Tickets</span>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Past Shows */}
          {regularPast.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2 md:mb-3">Recent Shows</h4>
              <div className="space-y-2">
                {regularPast.map((show: any, index: number) => (
                  <div key={`past-${index}`} className="flex items-center justify-between p-2 md:p-3 bg-white/5 rounded-md opacity-75">
                    <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                      <Calendar className="w-4 md:w-5 h-4 md:h-5 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-muted-foreground text-sm md:text-base truncate">{show.venue}</p>
                        <p className="text-xs md:text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{show.city} • {new Date(show.date).toLocaleDateString()}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Show count indicator */}
          {remainingShows > 0 && (
            <div className="text-center">
              <p className="text-xs text-muted-foreground bg-white/5 rounded-full px-3 py-1 inline-block">
                + {remainingShows} more show{remainingShows > 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderEditableSection = (sectionId: string, content: React.ReactNode, hasContent: boolean = true) => {
    const isEditing = editingSection === sectionId;
    
    // On mobile, show modal instead of inline editing
    if (isMobile && isEditing) {
      return (
        <>
          <div className="group relative">
            <div 
              className={`cursor-pointer transition-all duration-200 hover:bg-white/5 rounded-lg p-2 ${
                !hasContent ? 'border-2 border-dashed border-muted-foreground/30 rounded-lg p-8' : ''
              }`}
            >
              {hasContent ? content : (
                <div className="text-center py-8">
                  <Plus className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">Click to add {sectionId}</p>
                </div>
              )}
            </div>
          </div>
          
          <MobileEditorModal
            isOpen={true}
            onClose={() => setEditingSection(null)}
            sectionId={sectionId}
            profile={profile}
            user={user}
            onSave={(updatedData) => handleSectionSave(updatedData)}
            initialFormData={formDataRef.current[sectionId]}
            onFormDataChange={(data) => handleFormDataChange({ [sectionId]: data })}
          />
        </>
      );
    }
    
    // Desktop: show inline editing
    if (isEditing) {
      return (
        <div className="space-y-4">
          <InlineEditor
            sectionId={sectionId}
            profile={profile}
            user={user}
            onSave={(updatedData) => handleSectionSave(updatedData)}
            onCancel={() => setEditingSection(null)}
            initialFormData={formDataRef.current[sectionId]}
            onFormDataChange={(data) => handleFormDataChange({ [sectionId]: data })}
            isSwitchingEditor={isSwitchingEditor}
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
          onClick={(e) => {
            e.stopPropagation();
            handleSectionClick(sectionId);
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {hasContent ? content : (
            <div className="text-center py-8">
              <Plus className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground">Click to add {sectionId}</p>
            </div>
          )}
          {hasContent && !isMobile && (
            <div className="absolute top-2 right-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <SaveIndicator 
                isSaving={isSaving}
                lastSaved={lastSaved}
                hasUnsavedChanges={hasUnsavedChanges}
                className="bg-background/80 backdrop-blur-sm px-2 py-1 rounded"
              />
              <Button
                size="sm"
                variant="outline"
                className="bg-background/80 backdrop-blur-sm"
              >
                <Edit3 className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!profile) {
    return (
      <Card className="glass-card border-white/10 animate-slide-in-up">
        <CardContent className="py-12 text-center">
          <h2 className="text-xl font-semibold mb-4">Welcome to your Press Kit Builder</h2>
          <p className="text-muted-foreground mb-6">
            Create your professional press kit by filling out each section below.
          </p>
          <Button onClick={(e) => {
            e.stopPropagation();
            setEditingSection('basic');
          }}>
            Get Started
          </Button>
          {editingSection === 'basic' && (
            <div className="mt-6 animate-slide-in-up">
              <InlineEditor
                sectionId="basic"
                profile={null}
                user={user}
                onSave={(updatedData) => handleSectionSave(updatedData, () => setEditingSection(null))}
                onCancel={() => setEditingSection(null)}
                isInitialSetup={true}
                initialFormData={formDataRef.current['basic']}
                onFormDataChange={(data) => handleFormDataChange({ basic: data })}
                isSwitchingEditor={isSwitchingEditor}
              />
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Background Image Section */}
      {renderEditableSection(
        'background',
        profile.hero_photo_url ? (
          <div className="relative h-48 md:h-64 rounded-lg overflow-hidden">
            <PrivateImage
              storagePath={profile.hero_photo_url}
              alt="Background image"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </div>
        ) : null,
        !!profile.hero_photo_url
      )}

      {/* Main Profile Card */}
      <Card className="glass-card border-white/10 animate-slide-in-up">
        <CardHeader>
          {renderEditableSection(
            'basic',
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-4 flex-wrap">
                  <CardTitle className="text-2xl gradient-text">{profile.artist_name}</CardTitle>
                  <div className="flex items-center gap-3">
                    {/* Performance Type */}
                    {profile.performance_type && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        {profile.performance_type === 'Solo' && <UserIcon className="w-3 h-3" />}
                        {profile.performance_type === 'Duo' && <Users className="w-3 h-3" />}
                        {profile.performance_type === 'Full Band' && <Music className="w-3 h-3" />}
                        {profile.performance_type}
                      </div>
                    )}
                    
                    {/* Location */}
                    {profile.location && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        {profile.location}
                      </div>
                    )}
                  </div>
                </div>

                {profile.genre && profile.genre.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {profile.genre.map((genre: string, index: number) => (
                      <Badge key={index} variant="secondary">{genre}</Badge>
                    ))}
                  </div>
                )}

                 {/* Contact info - Mobile optimized layout */}
                <div className="mt-4 space-y-1">
                  {profile.contact_info?.email && (
                    <div className="text-center md:text-left">
                      <span className="text-xs text-muted-foreground/70">Email: </span>
                      <span className="text-sm text-muted-foreground">{profile.contact_info.email}</span>
                    </div>
                  )}
                  {profile.contact_info?.phone && (
                    <div className="text-center md:text-left">
                      <span className="text-xs text-muted-foreground/70">Phone: </span>
                      <span className="text-sm text-muted-foreground">{profile.contact_info.phone}</span>
                    </div>
                  )}
                </div>
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

        <CardContent className="space-y-6 md:space-y-8 px-3 md:px-6">
          {/* Streaming Section */}
          {renderEditableSection(
            'streaming',
            (profile.streaming_links && Object.keys(profile.streaming_links).length > 0) || profile.featured_track_url ? (
              <div>
                <h3 className="font-semibold mb-3">Streaming</h3>
                
                {/* Streaming Links */}
                {profile.streaming_links && Object.keys(profile.streaming_links).length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-2">Listen</h4>
                    <div className="flex flex-wrap gap-2">
                      {profile.streaming_links.spotify && (
                        <a
                          href={profile.streaming_links.spotify}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 rounded-md hover:bg-white/10 transition-colors"
                        >
                          <img 
                            src={spotifyIcon} 
                            alt="Spotify" 
                            className="w-6 h-6"
                          />
                        </a>
                      )}
                      {profile.streaming_links.apple_music && (
                        <a
                          href={profile.streaming_links.apple_music}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 rounded-md hover:bg-white/10 transition-colors"
                        >
                          <img 
                            src={appleIcon} 
                            alt="Apple Music" 
                            className="w-6 h-6"
                          />
                        </a>
                      )}
                      {profile.streaming_links.bandcamp && (
                        <a
                          href={profile.streaming_links.bandcamp}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 rounded-md hover:bg-white/10 transition-colors"
                        >
                          <img 
                            src={bandcampIcon} 
                            alt="Bandcamp" 
                            className="w-6 h-6"
                          />
                        </a>
                      )}
                      {profile.streaming_links.soundcloud && (
                        <a
                          href={profile.streaming_links.soundcloud}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 rounded-md hover:bg-white/10 transition-colors"
                        >
                          <img 
                            src={soundcloudIcon} 
                            alt="SoundCloud" 
                            className="w-6 h-6"
                          />
                        </a>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Featured Track */}
                {profile.featured_track_url && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Featured Track</h4>
                    <FeaturedTrackEmbed trackUrl={profile.featured_track_url} />
                  </div>
                )}
              </div>
            ) : null,
            !!((profile.streaming_links && Object.keys(profile.streaming_links).length > 0) || profile.featured_track_url)
          )}

          {/* Social Links - Enhanced with proper icons */}
          {renderEditableSection(
            'social',
            profile.social_links && Object.keys(profile.social_links).length > 0 ? (
              <div>
                <h3 className="font-semibold mb-3">Social Links</h3>
                <div className="flex flex-wrap gap-2 md:gap-3">
                  {profile.social_links.website && (
                    <a
                      href={profile.social_links.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 rounded-md bg-white/5 hover:bg-white/10 transition-colors text-sm min-h-[44px]"
                    >
                      <Globe className="w-4 h-4 flex-shrink-0" />
                      <span className="hidden sm:inline">Website</span>
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    </a>
                  )}
                  {profile.social_links.instagram && (
                    <a
                      href={`https://instagram.com/${profile.social_links.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 rounded-md bg-white/5 hover:bg-white/10 transition-colors text-sm min-h-[44px]"
                    >
                      <Instagram className="w-4 h-4 flex-shrink-0" />
                      <span className="hidden sm:inline">Instagram</span>
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    </a>
                  )}
                  {profile.social_links.tiktok && (
                    <a
                      href={`https://tiktok.com/@${profile.social_links.tiktok.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 rounded-md bg-white/5 hover:bg-white/10 transition-colors text-sm min-h-[44px]"
                    >
                      <Music className="w-4 h-4 flex-shrink-0" />
                      <span className="hidden sm:inline">TikTok</span>
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
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
                {profile.blurb && (
                  <div className="mb-4 p-3 bg-primary/10 rounded-lg border-l-4 border-primary">
                    <h4 className="text-sm font-medium text-primary mb-1">Blurb</h4>
                    <p className="text-sm text-muted-foreground italic">{profile.blurb}</p>
                  </div>
                )}
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
              </div>
            ) : null,
            !!profile.bio
          )}

          {/* Gallery Section */}
          {renderEditableSection(
            'gallery',
            profile.gallery_photos && profile.gallery_photos.length > 0 ? (
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
            ) : null,
            !!(profile.gallery_photos && profile.gallery_photos.length > 0)
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

          {/* Two Column Layout: Press Quotes & Press Mentions/Shows - Stack on mobile */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            {/* Left Column: Press Quotes */}
            <div>
              {renderEditableSection(
                'quotes',
                profile.press_quotes && profile.press_quotes.length > 0 ? (
                  <div>
                    <h3 className="font-semibold mb-3">Press Quotes</h3>
                    <div className="space-y-4">
                      {profile.press_quotes.map((quote: any, index: number) => (
                        <Card key={index} className="border-l-4 border-l-primary bg-muted/30 animate-slide-in-up">
                          <CardContent className="pt-4">
                            <div className="flex items-start gap-3">
                              <Quote className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                              <div className="flex-1">
                                <blockquote className="text-sm italic leading-relaxed mb-2">
                                  "{quote.text}"
                                </blockquote>
                                <cite className="text-sm font-medium text-muted-foreground">
                                  — {quote.source}
                                </cite>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ) : null,
                !!(profile.press_quotes && profile.press_quotes.length > 0)
              )}
            </div>
            
            {/* Right Column: Press Mentions */}
            <div>
              {renderEditableSection(
                'mentions',
                profile.press_mentions && profile.press_mentions.length > 0 ? (
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
                ) : null,
                !!(profile.press_mentions && profile.press_mentions.length > 0)
              )}
            </div>
          </div>

          {/* Shows Section */}
          {renderEditableSection(
            'shows',
            renderShowsSection(),
            !!(
              (profile.upcoming_shows && profile.upcoming_shows.length > 0) ||
              (profile.past_shows && profile.past_shows.length > 0)
            )
          )}

        </CardContent>
      </Card>
    </div>
  );
}