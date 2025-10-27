import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { AutoSaveInput, AutoSaveTextarea } from "@/components/ui/auto-save-input";
import { Input } from "@/components/ui/input";
import { FloatingLabelInput } from "@/components/ui/floating-label-input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast, toast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";
import { X, Save, Lightbulb, Upload, Camera, Loader2 } from "lucide-react";
import GenreInput from "@/components/GenreInput";
import StreamingLinksInput from "@/components/StreamingLinksInput";
import PhotoUpload from "@/components/PhotoUpload";
import PressQuotesEditor from "@/components/PressQuotesEditor";
import MentionsEditor from "@/components/MentionsEditor";
import ShowsEditor from "@/components/ShowsEditor";
import PrivateImage from "@/components/PrivateImage";
import { ImageStorageService } from "@/lib/imageStorage";
import { useClickOutside } from "@/hooks/useClickOutside";
import { BioPreviewModal } from "./BioPreviewModal";
import { VinylProgressIndicator } from "./VinylProgressIndicator";
import { formatUserUrl } from "@/lib/urlUtils";

interface InlineEditorProps {
  sectionId: string;
  profile: any;
  user: User | null;
  onSave: (updatedData?: any) => void;
  onCancel: () => void;
  isInitialSetup?: boolean;
  initialFormData?: Record<string, any>;
  onFormDataChange?: (data: Record<string, any>) => void;
  isInMobileModal?: boolean;
  isSwitchingEditor?: boolean; // Add this new prop
}

export default function InlineEditor({ 
  sectionId, 
  profile, 
  user, 
  onSave, 
  onCancel, 
  isInitialSetup = false, 
  initialFormData,
  onFormDataChange,
  isInMobileModal = false,
  isSwitchingEditor = false
}: InlineEditorProps) {
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Prioritize initialFormData over profile data for better persistence
    const baseData = profile ? {
      artist_name: profile.artist_name || '',
      bio: profile.bio || '',
      genre: profile.genre || [],
      social_links: profile.social_links || {},
      contact_info: profile.contact_info || {},
      streaming_links: profile.streaming_links || {},
      show_videos: profile.show_videos || [],
      profile_photo_url: profile.profile_photo_url || '',
      hero_photo_url: profile.hero_photo_url || '',
      gallery_photos: profile.gallery_photos || [],
      blurb: profile.blurb || '',
      performance_type: profile.performance_type || '',
      location: profile.location || '',
      featured_track_url: profile.featured_track_url || '',
    } : {
      artist_name: '',
      bio: '',
      genre: [],
      social_links: {},
      contact_info: {},
      streaming_links: {},
      show_videos: [],
      profile_photo_url: '',
      hero_photo_url: '',
      gallery_photos: [],
      blurb: '',
      performance_type: '',
      location: '',
      featured_track_url: '',
    };
    
    const restoredData = initialFormData || {};
    
    // Merge profile data with restored form data, giving priority to restored data
    const mergedData = { ...baseData, ...restoredData };
    
    setFormData(mergedData);
    
    // Notify parent of current form data immediately
    if (onFormDataChange && Object.keys(restoredData).length > 0) {
      onFormDataChange({ [sectionId]: restoredData });
    }
  }, [profile, initialFormData, sectionId]);

  // Refresh schema cache for bio section to prevent cache conflicts
  useEffect(() => {
    if (sectionId === 'bio') {
      refreshSchemaCache();
    }
  }, [sectionId]);

  // Notify parent of form data changes
  useEffect(() => {
    if (onFormDataChange) {
      onFormDataChange(formData);
    }
  }, [formData, onFormDataChange]);

const handleProfilePhotoUpload = async (file: File) => {
  console.log("🔥 handleProfilePhotoUpload called");
  
  if (!user) throw new Error('User not authenticated');
  const storagePath = await ImageStorageService.uploadFile(file, 'profile', user.id);
  console.log("🔥 Upload successful, path:", storagePath);
  
  // Update local state
  setFormData({ ...formData, profile_photo_url: storagePath });
  
  // SAVE TO DATABASE but DON'T CLOSE EDITOR
  console.log("🔥 Saving to database...");
  await handleSave(false, false); // isDoneAction=false, shouldClose=false
  console.log("🔥 Database save completed - editor stays open");
  
  return storagePath;
};

const handleBackgroundImageUpload = async (file: File) => {
  if (!user) throw new Error('User not authenticated');
  const storagePath = await ImageStorageService.uploadFile(file, 'hero', user.id);
  
  // Update local state
  setFormData({ ...formData, hero_photo_url: storagePath });
  
  // SAVE TO DATABASE but DON'T CLOSE EDITOR
  await handleSave(false, false); // isDoneAction=false, shouldClose=false
  
  return storagePath;
};

const handleGalleryUpload = async (file: File) => {
  console.log("🔥 handleGalleryUpload called");
  
  if (!user) throw new Error('User not authenticated');
  const storagePath = await ImageStorageService.uploadFile(file, 'gallery', user.id);
  console.log("🔥 Gallery upload successful, path:", storagePath);
  
  // Add to current gallery photos array
  const currentPhotos = formData.gallery_photos || [];
  const updatedPhotos = [...currentPhotos, { url: storagePath, label: '' }];
  
  // Update local state
  setFormData({ ...formData, gallery_photos: updatedPhotos });
  console.log("🔥 Updated local gallery photos:", updatedPhotos);
  
  // SAVE TO DATABASE but DON'T CLOSE EDITOR
  console.log("🔥 Saving gallery to database...");
  await handleSave(false, false); // isDoneAction=false, shouldClose=false
  console.log("🔥 Gallery database save completed - editor stays open");
  
  return storagePath;
};

  const updateGalleryPhotos = (photos: any[]) => {
    setFormData({ ...formData, gallery_photos: photos });
  };

  const reorderGalleryPhotos = (photos: any[]) => {
    setFormData({ ...formData, gallery_photos: photos });
  };

  // Helper function to handle schema errors
  const handleSchemaError = (error: any) => {
    if (error.message && error.message.includes('schema cache')) {
      return {
        title: "Database Schema Error",
        description: "There was a temporary database issue. Please try again in a moment.",
        variant: "destructive" as const
      };
    }
    return {
      title: "Error",
      description: error.message || "Failed to save changes",
      variant: "destructive" as const
    };
  };

  // Schema cache refresh function
  const refreshSchemaCache = async () => {
    try {
      // Force refresh Supabase schema cache by making a simple query
      const { error } = await supabase
        .from('artist_profiles')
        .select('id')
        .limit(1);
      
      if (error) {
        console.warn('Schema refresh warning:', error);
      }
    } catch (error) {
      console.warn('Failed to refresh schema cache:', error);
    }
  };

  const handleSave = async (isDoneAction = false, shouldClose = true) => {
  if (!user) return;

  try {
    setLoading(true);

    // Create section-specific data to avoid schema conflicts
    let updateData: any = {};
    
    switch (sectionId) {
      case 'bio':
        updateData = {
          bio: formData.bio,
          blurb: formData.blurb,
          artist_name: formData.artist_name,
          genre: formData.genre,
        };
        break;
      case 'basic':
        updateData = {
          artist_name: formData.artist_name,
          genre: formData.genre,
          blurb: formData.blurb,
          performance_type: formData.performance_type,
          location: formData.location,
          featured_track_url: formData.featured_track_url,
          contact_info: formData.contact_info,
          profile_photo_url: formData.profile_photo_url,
        };
        break;
      case 'streaming':
        updateData = {
          streaming_links: formData.streaming_links,
          featured_track_url: formData.featured_track_url,
        };
        break;
      case 'social':
        updateData = {
          social_links: formData.social_links,
        };
        break;
      case 'videos':
        updateData = {
          show_videos: formData.show_videos,
        };
        break;
      case 'background':
        updateData = {
          hero_photo_url: formData.hero_photo_url,
        };
        break;
      case 'gallery':
        updateData = {
          gallery_photos: formData.gallery_photos,
        };
        break;
      default:
        updateData = { ...formData };
        delete updateData.featured_track_url;
        break;
    }

    if (profile) {
      // Update existing profile with section-specific data only
      const { error } = await supabase
        .from('artist_profiles')
        .update(updateData)
        .eq('user_id', user.id);

      if (error) {
        console.error('Save error details:', error);
        throw error;
      }
    } else {
      // Create new profile logic...
      const createData = { ...formData };
      if (!createData.featured_track_url) {
        createData.featured_track_url = null;
      }
      
      const { error } = await supabase
        .from('artist_profiles')
        .insert({
          ...createData,
          user_id: user.id,
        });

      if (error) {
        console.error('Create error details:', error);
        throw error;
      }
    }

    toast({
      title: isDoneAction ? "Profile created!" : "Section updated!",
      description: isDoneAction ? "Welcome to your press kit dashboard!" : "Your changes have been saved.",
    });

    // ONLY call onSave (which closes editor) if shouldClose is true
    if (shouldClose) {
      onSave(updateData);
    }
    
    // For initial setup completion, reload the page to show full dashboard
    if (isDoneAction) {
      window.location.reload();
    }
  } catch (error: any) {
    console.error('Save error:', error);
    const errorMessage = handleSchemaError(error);
    toast(errorMessage);
    throw error;
  } finally {
    setLoading(false);
  }
};

  // Auto-save and close handler
  const handleAutoSaveAndClose = useCallback(async () => {
    console.log("🔍 InlineEditor: Click-outside detected, handleAutoSaveAndClose called");
    
    // Don't auto-close if we're in the middle of switching editors
    if (isSwitchingEditor || isSaving) {
      console.log("🔍 InlineEditor: Ignoring click-outside during editor switch or save");
      return;
    }
    
    console.log("🔍 InlineEditor: Current form data before save:", formData);
    console.log("🔍 InlineEditor: Section ID:", sectionId);
    
    try {
      setIsSaving(true);
      console.log("🔍 InlineEditor: Calling handleSave()");
      await handleSave(false);
      console.log("🔍 InlineEditor: handleSave() completed successfully");
      
      // Force close the editor after successful save
      setTimeout(() => {
        console.log("🔍 InlineEditor: Force closing editor");
        onCancel(); // Close the editor
      }, 100);
      
    } catch (error) {
      console.error("🔍 InlineEditor: handleSave() failed:", error);
      // Don't close editor on error so user can retry
    } finally {
      setIsSaving(false);
    }
  }, [isSaving, onCancel, formData, sectionId, isSwitchingEditor]);
  
  // Click outside detection
  const editorRef = useClickOutside<HTMLDivElement>(handleAutoSaveAndClose);

  const addGenre = (genre: string) => {
    if (genre && !(formData.genre || []).includes(genre)) {
      setFormData({
        ...formData,
        genre: [...(formData.genre || []), genre]
      });
    }
  };

  const removeGenre = (genreToRemove: string) => {
    setFormData({
      ...formData,
      genre: (formData.genre || []).filter((g: string) => g !== genreToRemove)
    });
  };

  const addVideo = (videoUrl: string) => {
    if (videoUrl && !(formData.show_videos || []).includes(videoUrl)) {
      setFormData({
        ...formData,
        show_videos: [...(formData.show_videos || []), videoUrl]
      });
    }
  };

  const removeVideo = (index: number) => {
    setFormData({
      ...formData,
      show_videos: (formData.show_videos || []).filter((_: any, i: number) => i !== index)
    });
  };

  const bioToneOptions = [
    { value: "punchy", label: "Short & Punchy", example: "Direct, impactful, gets straight to the point" },
    { value: "narrative", label: "Long & Narrative", example: "Tells your story in detail, more personal and descriptive" },
    { value: "professional", label: "Professional", example: "Industry-focused, highlights achievements and credentials" },
    { value: "casual", label: "Casual", example: "Conversational, approachable, like talking to a friend" }
  ];

  const [bioConfig, setBioConfig] = useState({
    style: '',
    influences: '',
    notable_performances: '',
    musical_background: ''
  });
  const [generatingBio, setGeneratingBio] = useState(false);
  const [bioMode, setBioMode] = useState<'manual' | 'ai'>('manual');
  const [lastGenerationTime, setLastGenerationTime] = useState(0);
  const GENERATION_COOLDOWN = 3000; // 3 seconds between requests
  const [generatedBioPreview, setGeneratedBioPreview] = useState('');
  const [bioModalOpen, setBioModalOpen] = useState(false);
  
  // Character counter for bio
  const bioWordCount = formData.bio ? formData.bio.trim().split(/\s+/).filter(word => word.length > 0).length : 0;

  const generateBio = async (isRemix = false) => {
    // Check cooldown to prevent rapid requests
    const now = Date.now();
    const timeSinceLastGeneration = now - lastGenerationTime;
    
    if (timeSinceLastGeneration < GENERATION_COOLDOWN) {
      const remainingTime = Math.ceil((GENERATION_COOLDOWN - timeSinceLastGeneration) / 1000);
      toast({
        title: "Please wait",
        description: `Please wait ${remainingTime} more seconds before generating another bio.`,
        variant: "default",
      });
      return;
    }

    if (!formData.artist_name.trim()) {
      toast({
        title: "Artist name required",
        description: "Please enter an artist name before generating a bio.",
        variant: "destructive",
      });
      return;
    }

    if (generatingBio) {
      toast({
        title: "Generation in progress",
        description: "Please wait for the current bio generation to complete.",
        variant: "default",
      });
      return;
    }

    try {
      setGeneratingBio(true);
      setLastGenerationTime(now);

      const requestBody = {
        artist_name: formData.artist_name,
        genre: Array.isArray(formData.genre) ? formData.genre.join(', ') : formData.genre,
        performance_type: formData.performance_type,
        influences: bioConfig.influences,
        location: formData.location,
        vibe: bioConfig.style,
        notable_performances: bioConfig.notable_performances,
        musical_background: bioConfig.musical_background,
        existing_bio: isRemix ? formData.bio : null,
        is_remix: isRemix
      };

      console.log('Sending bio generation request:', requestBody);

      const { data, error } = await supabase.functions.invoke('generate-bio', {
        body: requestBody
      });

      console.log('Bio generation response:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      if (data?.error) {
        console.error('Edge function returned error:', data.error);
        
        // Handle rate limiting with retry option
        if (data.retryable) {
          toast({
            title: "Service Busy",
            description: data.error + " You can try again in a few moments.",
            variant: "default",
          });
        } else {
          toast({
            title: "Error",
            description: data.error,
            variant: "destructive",
          });
        }
        return;
      }

      if (data?.bio) {
        setGeneratedBioPreview(data.bio);
        setBioModalOpen(true);
        toast({
          title: "Bio generated!",
          description: `Your ${isRemix ? 'remixed' : 'new'} bio has been created. Review it in the preview.`,
        });
      } else {
        throw new Error('No bio content received from the API');
      }
    } catch (error: any) {
      console.error('Bio generation failed:', error);
      
      // Handle different error types
      if (error.message?.includes('429') || error.message?.includes('rate limit') || error.message?.includes('temporarily busy')) {
        toast({
          title: "Service Busy",
          description: "AI service is temporarily busy. Please wait a moment and try again.",
          variant: "default",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to generate bio. Please try again later.",
          variant: "destructive",
        });
      }
    } finally {
      setGeneratingBio(false);
    }
  };

  const renderBasicSection = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Artist Details</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <FloatingLabelInput
            id="artist_name"
            label="Artist Name"
            value={formData.artist_name}
            onChange={(e) => setFormData({ ...formData, artist_name: e.target.value })}
            placeholder="Your artist name"
          />
        </div>
        
        <div>
          <FloatingLabelInput
            id="email"
            label="Contact Email"
            type="email"
            value={formData.contact_info?.email || ''}
            onChange={(e) => setFormData({
              ...formData,
              contact_info: { ...formData.contact_info, email: e.target.value }
            })}
            placeholder="your@email.com"
          />
        </div>

        <div>
          <FloatingLabelInput
            id="phone"
            label="Phone Number"
            type="tel"
            value={formData.contact_info?.phone || ''}
            onChange={(e) => setFormData({
              ...formData,
              contact_info: { ...formData.contact_info, phone: e.target.value }
            })}
            placeholder="+1 (555) 123-4567"
          />
        </div>

        <div>
          <Label htmlFor="performance_type">Performance Type</Label>
          <Select 
            value={formData.performance_type || ''} 
            onValueChange={(value) => setFormData({ ...formData, performance_type: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Solo">Solo</SelectItem>
              <SelectItem value="Duo">Duo</SelectItem>
              <SelectItem value="Full Band">Full Band</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <FloatingLabelInput
            id="location"
            label="Location"
            value={formData.location || ''}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="City, State/Country"
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="genre">Genres</Label>
          <GenreInput
            genres={Array.isArray(formData.genre) ? formData.genre : []}
            onChange={(genres) => setFormData({ ...formData, genre: genres })}
          />
        </div>
      </div>

      <div className="space-y-3">
        <Label>Profile Photo</Label>
        {formData.profile_photo_url ? (
          <div className="relative block">
            <PrivateImage
              storagePath={formData.profile_photo_url}
              alt="Profile photo"
              className="w-32 h-32 object-cover rounded-lg"
            />
            <Button
              size="sm"
              variant="outline"
              className="absolute top-2 right-2"
              onClick={() => setFormData({ ...formData, profile_photo_url: '' })}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="border-2 border-dashed border-muted-foreground/30 p-4 text-center rounded-lg">
            <Label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    try {
                      await handleProfilePhotoUpload(file);
                      toast({
                        title: "Photo uploaded",
                        description: "Profile photo uploaded successfully",
                      });
                    } catch (error) {
                      toast({
                        title: "Upload failed",
                        description: "Failed to upload profile photo",
                        variant: "destructive",
                      });
                    }
                  }
                }}
                className="hidden"
              />
              <Camera className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Upload profile photo</p>
            </Label>
          </div>
        )}
      </div>


    </div>
  );

  const renderBioSection = () => (
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          Artist Bio
          <Lightbulb className="w-4 h-4 text-primary" />
        </h3>
        <p className="text-sm text-muted-foreground mt-1">Write your own or use AI assistance</p>
      </div>

      {/* Choice Tabs */}
      <Tabs value={bioMode} onValueChange={(value) => setBioMode(value as 'manual' | 'ai')} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual">Write Manually</TabsTrigger>
          <TabsTrigger value="ai">Use AI Helper</TabsTrigger>
        </TabsList>

        {/* Manual Tab Content */}
        <TabsContent value="manual" className="space-y-4 mt-6">
          <div className="space-y-3">
            <Textarea
              id="bio"
              rows={10}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell your story, describe your sound, mention achievements..."
              className="text-sm leading-relaxed resize-none"
            />
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>Recommended: 150-300 words</span>
              <span className={bioWordCount < 150 || bioWordCount > 300 ? "text-orange-500" : "text-green-500"}>
                {bioWordCount} words
              </span>
            </div>
          </div>

          {/* Blurb Section */}
          <div className="space-y-3 pt-4 border-t">
            <div className="flex items-center justify-between">
              <Label htmlFor="blurb">Blurb</Label>
              <span className="text-xs text-muted-foreground">
                {(formData.blurb || '').split(' ').filter(w => w.length > 0).length}/20 words
              </span>
            </div>
            <div className="flex gap-2">
              <Input
                id="blurb"
                value={formData.blurb || ''}
                onChange={(e) => {
                  const words = e.target.value.split(' ').filter(w => w.length > 0);
                  if (words.length <= 20) {
                    setFormData({ ...formData, blurb: e.target.value });
                  }
                }}
                placeholder="A catchy one-liner about your music..."
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={async () => {
                  if (!formData.bio?.trim()) {
                    toast({
                      title: "Bio required",
                      description: "Please write a bio first before generating a blurb.",
                      variant: "destructive",
                    });
                    return;
                  }
                  
                  try {
                    const { data, error } = await supabase.functions.invoke('generate-bio', {
                      body: {
                        artist_name: formData.artist_name,
                        existing_bio: formData.bio,
                        is_blurb: true,
                        word_limit: 20
                      }
                    });

                    if (error) throw error;
                    if (data?.error) throw new Error(data.error);
                    
                    if (data?.bio) {
                      setFormData({ ...formData, blurb: data.bio });
                      toast({
                        title: "Blurb generated!",
                        description: "Your catchy blurb has been created from your bio.",
                      });
                    }
                  } catch (error: any) {
                    toast({
                      title: "Error",
                      description: error.message || "Failed to generate blurb",
                      variant: "destructive",
                    });
                  }
                }}
                disabled={!formData.bio?.trim()}
              >
                Generate with AI
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Maximum 20 words - a catchy summary of your bio
            </p>
          </div>
          
          {formData.bio?.trim() && (
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground mb-2">
                💡 <strong>Tip:</strong> Want to improve your bio? Switch to the AI Helper tab and click "Remix Existing Bio"
              </p>
            </div>
          )}
        </TabsContent>

        {/* AI Helper Tab Content */}
        <TabsContent value="ai" className="space-y-6 mt-6">
          <div className="p-4 bg-muted/30 rounded-lg space-y-6">
            <div>
              <h4 className="text-md font-semibold mb-2">AI Bio Generator</h4>
              <p className="text-sm text-muted-foreground">
                Fill out the fields below and we'll generate a professional bio for you
              </p>
            </div>
            
            {/* Writing Style Options */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Choose Writing Style</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {bioToneOptions.map((option) => (
                  <Card 
                    key={option.value} 
                    className={`cursor-pointer transition-all ${
                      bioConfig.style === option.value 
                        ? 'ring-2 ring-primary bg-primary/10 shadow-md' 
                        : 'hover:bg-muted/50 hover:shadow-sm'
                    }`}
                    onClick={() => setBioConfig({ ...bioConfig, style: option.value })}
                  >
                    <CardContent className="p-4">
                      <p className="font-medium text-sm mb-1">{option.label}</p>
                      <p className="text-xs text-muted-foreground">{option.example}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* AI Configuration Inputs */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="ai_influences">Musical Influences</Label>
                <Input
                  id="ai_influences"
                  value={bioConfig.influences}
                  onChange={(e) => setBioConfig({ ...bioConfig, influences: e.target.value })}
                  placeholder="Radiohead, Aphex Twin, Miles Davis"
                />
                <p className="text-xs text-muted-foreground mt-1">Artists or styles that inspire your music</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ai_notable_performances">Notable Performances (Optional)</Label>
                <Input
                  id="ai_notable_performances"
                  value={bioConfig.notable_performances}
                  onChange={(e) => setBioConfig({ ...bioConfig, notable_performances: e.target.value })}
                  placeholder="e.g., Coachella 2023, sold out Madison Square Garden, opened for [Artist Name]"
                />
                <p className="text-xs text-muted-foreground mt-1">Major venues, festivals, tours, or memorable shows</p>
              </div>

              <div>
                <Label htmlFor="ai_musical_background">Musical Background (Optional)</Label>
                <Input
                  id="ai_musical_background"
                  value={bioConfig.musical_background}
                  onChange={(e) => setBioConfig({ ...bioConfig, musical_background: e.target.value })}
                  placeholder="e.g., Berklee College of Music, 10+ years touring, classically trained pianist"
                />
                <p className="text-xs text-muted-foreground mt-1">Education, training, years of experience, or career highlights</p>
              </div>
            </div>


            {/* AI Action Buttons */}
            <div className="space-y-3">
              {formData.bio?.trim() ? (
                <Button
                  onClick={() => generateBio(true)}
                  disabled={generatingBio}
                  className="w-full"
                  size="lg"
                >
                  <VinylProgressIndicator isLoading={generatingBio} size={16} className="mr-2" />
                  {generatingBio ? "Remixing Your Bio..." : "Remix Existing Bio"}
                </Button>
              ) : (
                <Button
                  onClick={() => generateBio(false)}
                  disabled={generatingBio || !bioConfig.style}
                  className="w-full"
                  size="lg"
                >
                  <VinylProgressIndicator isLoading={generatingBio} size={16} className="mr-2" />
                  {generatingBio ? "Generating Bio..." : "Generate New Bio"}
                </Button>
              )}
              
              <p className="text-xs text-muted-foreground text-center">
                {formData.bio?.trim() 
                  ? "Remix will improve your existing bio using AI" 
                  : "Please select a writing style to generate a bio"
                }
              </p>
            </div>
          </div>

        </TabsContent>
      </Tabs>

      <BioPreviewModal
        isOpen={bioModalOpen}
        onClose={() => setBioModalOpen(false)}
        generatedBio={generatedBioPreview}
        onUseBio={(bio) => {
          setFormData({ ...formData, bio });
          setBioMode('manual');
          toast({
            title: "Bio applied!",
            description: "The bio has been set and you're now in manual editing mode.",
          });
        }}
        onRegenerate={() => generateBio(formData.bio?.trim())}
        isRegenerating={generatingBio}
      />
    </div>
  );

  const renderSocialSection = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Social Links</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">        
        <div>
          <Label htmlFor="instagram">Instagram</Label>
          <Input
            id="instagram"
            value={formData.social_links?.instagram || ''}
            onChange={(e) => setFormData({
              ...formData,
              social_links: { ...formData.social_links, instagram: e.target.value }
            })}
            placeholder="@username"
          />
        </div>

        <div>
          <Label htmlFor="tiktok">TikTok</Label>
          <Input
            id="tiktok"
            value={formData.social_links?.tiktok || ''}
            onChange={(e) => setFormData({
              ...formData,
              social_links: { ...formData.social_links, tiktok: e.target.value }
            })}
            placeholder="@username"
          />
        </div>

        <div>
          <Label htmlFor="youtube">YouTube</Label>
          <Input
            id="youtube"
            value={formData.social_links?.youtube || ''}
            onChange={(e) => setFormData({
              ...formData,
              social_links: { ...formData.social_links, youtube: e.target.value }
            })}
            placeholder="YouTube channel URL"
          />
        </div>
      </div>
    </div>
  );

  const renderBackgroundImageSection = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Background Image</h3>
      {formData.hero_photo_url ? (
        <div className="relative inline-block">
          <PrivateImage
            storagePath={formData.hero_photo_url}
            alt="Background image"
            className="w-full max-w-md h-48 object-cover rounded-lg"
          />
          <Button
            size="sm"
            variant="outline"
            className="absolute top-2 right-2"
            onClick={() => setFormData({ ...formData, hero_photo_url: '' })}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-muted-foreground/30 p-4 text-center rounded-lg">
          <Label className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  try {
                    await handleBackgroundImageUpload(file);
                    toast({
                      title: "Photo uploaded",
                      description: "Background image uploaded successfully",
                    });
                  } catch (error) {
                    toast({
                      title: "Upload failed",
                      description: "Failed to upload background image",
                      variant: "destructive",
                    });
                  }
                }
              }}
              className="hidden"
            />
            <Camera className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Upload background image</p>
          </Label>
        </div>
      )}
    </div>
  );

  const renderVideosSection = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Videos (Max 3)</h3>
      
      <div className="space-y-2">
        {(formData.show_videos || []).map((video: string, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <Input value={video} readOnly />
            <Button
              variant="outline"
              size="sm"
              onClick={() => removeVideo(index)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>

      {(formData.show_videos || []).length < 3 && (
        <div>
          <Input
            placeholder="Paste YouTube or Vimeo URL here..."
            onBlur={(e) => {
              const url = formatUserUrl(e.target.value.trim());
              if (url && !(formData.show_videos || []).includes(url)) {
                addVideo(url);
                e.target.value = '';
              }
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                const input = e.target as HTMLInputElement;
                const url = formatUserUrl(input.value.trim());
                if (url && !(formData.show_videos || []).includes(url)) {
                  addVideo(url);
                  input.value = '';
                }
              }
            }}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Video will be saved automatically when you paste the URL
          </p>
        </div>
      )}
    </div>
  );

  const renderStreamingSection = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Streaming & Music Links</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="text-md font-medium mb-4">Streaming Platforms</h4>
          <StreamingLinksInput
            streamingLinks={formData.streaming_links || {}}
            onChange={(links) => setFormData({ ...formData, streaming_links: links })}
          />
        </div>

        <div className="space-y-4">
          <h4 className="text-md font-medium mb-4">Featured Track</h4>
          <div>
            <Label htmlFor="featured_track_url">Track URL</Label>
            <Input
              id="featured_track_url"
              value={formData.featured_track_url || ''}
              onChange={(e) => setFormData({ ...formData, featured_track_url: e.target.value })}
              onBlur={(e) => {
                const formattedUrl = formatUserUrl(e.target.value);
                if (formattedUrl !== e.target.value) {
                  setFormData({ ...formData, featured_track_url: formattedUrl });
                }
              }}
              placeholder="Paste Spotify, Apple Music, or SoundCloud URL..."
            />
            <p className="text-xs text-muted-foreground mt-1">
              Supports Spotify, Apple Music, and SoundCloud track links
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderGallerySection = () => (
    <div className="space-y-4">
      <PhotoUpload
        title="Gallery Photos"
        photos={formData.gallery_photos || []}
        onUpload={handleGalleryUpload}
        onUpdate={updateGalleryPhotos}
        onReorder={reorderGalleryPhotos}
        maxPhotos={12}
        maxSizeText="Max 5MB per photo"
      />
    </div>
  );

  const renderQuotesSection = () => (
    <div className="space-y-4">
      <PressQuotesEditor
        quotes={profile?.press_quotes || []}
        onUpdate={(quotes) => {
          const updatedProfile = { ...profile, press_quotes: quotes };
          onSave(updatedProfile);
        }}
      />
    </div>
  );

  const renderMentionsSection = () => (
    <div className="space-y-4">
      <MentionsEditor
        profile={profile}
        user={user}
        onSave={onSave}
        onCancel={() => {}}
        onFormDataChange={onFormDataChange}
        sectionId={sectionId}
      />
    </div>
  );

  const renderShowsSection = () => (
    <div className="space-y-4">
      <ShowsEditor
        profile={profile}
        user={user}
        onSave={onSave}
        onCancel={() => {}}
        onFormDataChange={onFormDataChange}
        sectionId={sectionId}
      />
    </div>
  );

  const renderSection = () => {
    switch (sectionId) {
      case 'basic':
        return renderBasicSection();
      case 'bio':
        return renderBioSection();
      case 'social':
        return renderSocialSection();
      case 'streaming':
        return renderStreamingSection();
      case 'background':
        return renderBackgroundImageSection();
      case 'videos':
        return renderVideosSection();
      case 'gallery':
        return renderGallerySection();
      case 'quotes':
        return renderQuotesSection();
      case 'mentions':
        return renderMentionsSection();
      case 'shows':
        return renderShowsSection();
      default:
        return <div>Section not found</div>;
    }
  };

  return (
    <div ref={editorRef} className="space-y-4">
      {isSaving && (
        <div className="flex items-center justify-center gap-2 p-2 bg-muted/30 rounded-lg">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Saving...</span>
        </div>
      )}
      {renderSection()}
      
      {/* Action Buttons - Hidden in mobile modal mode since modal has its own buttons */}
      {!isInMobileModal && (
        <div className="flex items-center justify-center gap-4 pt-6 border-t border-white/10">
          {isInitialSetup ? (
            <Button
              onClick={() => handleSave(true)}
              disabled={loading || !formData.artist_name}
              className="bg-gradient-primary hover:shadow-glow transition-all duration-300 px-8 py-3 text-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  Done & Enter Dashboard
                </>
              )}
            </Button>
          ) : (
            <>
              <Button
                variant="minimal"
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleSave(false)}
                disabled={loading}
                variant="minimal"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}