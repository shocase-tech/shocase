import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { AutoSaveInput, AutoSaveTextarea } from "@/components/ui/auto-save-input";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";
import { X, Save, Lightbulb, Upload, Camera, Loader2 } from "lucide-react";
import GenreInput from "@/components/GenreInput";
import StreamingLinksInput from "@/components/StreamingLinksInput";
import PhotoUpload from "@/components/PhotoUpload";
import PrivateImage from "@/components/PrivateImage";
import { ImageStorageService } from "@/lib/imageStorage";
import { useClickOutside } from "@/hooks/useClickOutside";

interface InlineEditorProps {
  sectionId: string;
  profile: any;
  user: User | null;
  onSave: () => void;
  onCancel: () => void;
}

export default function InlineEditor({ sectionId, profile, user, onSave, onCancel }: InlineEditorProps) {
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (profile) {
      setFormData({
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
      });
    } else {
      setFormData({
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
      });
    }
  }, [profile]);

  // File upload handlers
  const handleProfilePhotoUpload = async (file: File) => {
    if (!user) throw new Error('User not authenticated');
    const storagePath = await ImageStorageService.uploadFile(file, 'profile', user.id);
    setFormData({ ...formData, profile_photo_url: storagePath });
    return storagePath;
  };

  const handleHeroPhotoUpload = async (file: File) => {
    if (!user) throw new Error('User not authenticated');
    const storagePath = await ImageStorageService.uploadFile(file, 'hero', user.id);
    setFormData({ ...formData, hero_photo_url: storagePath });
    return storagePath;
  };

  const handleGalleryUpload = async (file: File) => {
    if (!user) throw new Error('User not authenticated');
    const storagePath = await ImageStorageService.uploadFile(file, 'gallery', user.id);
    return storagePath;
  };

  const updateGalleryPhotos = (photos: any[]) => {
    setFormData({ ...formData, gallery_photos: photos });
  };

  const reorderGalleryPhotos = (photos: any[]) => {
    setFormData({ ...formData, gallery_photos: photos });
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setLoading(true);

      if (profile) {
        // Update existing profile
        const { error } = await supabase
          .from('artist_profiles')
          .update(formData)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Create new profile
        const { error } = await supabase
          .from('artist_profiles')
          .insert({
            ...formData,
            user_id: user.id,
          });

        if (error) throw error;
      }

      toast({
        title: "Section updated!",
        description: "Your changes have been saved.",
      });

      // Update parent with new data instead of triggering refetch
      onSave();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      throw error; // Re-throw for handleAutoSaveAndClose error handling
    } finally {
      setLoading(false);
    }
  };

  // Auto-save and close handler
  const handleAutoSaveAndClose = useCallback(async () => {
    if (isSaving) return; // Prevent multiple saves
    try {
      setIsSaving(true);
      await handleSave();
      onCancel(); // Close the editor
    } catch (error) {
      // Error already handled in handleSave
    } finally {
      setIsSaving(false);
    }
  }, [isSaving, onCancel]);
  
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
    genres: '',
    influences: '',
    location: ''
  });
  const [generatingBio, setGeneratingBio] = useState(false);
  const [bioMode, setBioMode] = useState<'manual' | 'ai'>('manual');
  const [generatedBioPreview, setGeneratedBioPreview] = useState('');
  
  // Character counter for bio
  const bioWordCount = formData.bio ? formData.bio.trim().split(/\s+/).filter(word => word.length > 0).length : 0;

  const generateBio = async (isRemix = false) => {
    if (!user || !formData.artist_name) {
      toast({
        title: "Error",
        description: "Artist name is required to generate bio",
        variant: "destructive",
      });
      return;
    }

    try {
      setGeneratingBio(true);

      const { data, error } = await supabase.functions.invoke('generate-bio', {
        body: {
          artist_name: formData.artist_name,
          genre: bioConfig.genres || formData.genre,
          influences: bioConfig.influences,
          location: bioConfig.location,
          vibe: bioConfig.style,
          existing_bio: isRemix ? formData.bio : null,
          is_remix: isRemix
        }
      });

      if (error) throw error;

      if (data?.bio) {
        setGeneratedBioPreview(data.bio);
        toast({
          title: "Bio generated!",
          description: `Your ${isRemix ? 'remixed' : 'new'} bio has been created. Review it below.`,
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate bio",
        variant: "destructive",
      });
    } finally {
      setGeneratingBio(false);
    }
  };

  const renderBasicSection = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Artist Details</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="artist_name">Artist Name</Label>
          <Input
            id="artist_name"
            value={formData.artist_name}
            onChange={(e) => setFormData({ ...formData, artist_name: e.target.value })}
            placeholder="Your artist name"
          />
        </div>
        
        <div>
          <Label htmlFor="email">Contact Email</Label>
          <Input
            id="email"
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
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.contact_info?.phone || ''}
            onChange={(e) => setFormData({
              ...formData,
              contact_info: { ...formData.contact_info, phone: e.target.value }
            })}
            placeholder="+1 (555) 123-4567"
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
          <div className="relative inline-block">
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

      <div className="space-y-4">
        <h4 className="text-md font-medium mb-4">Streaming Links</h4>
        <StreamingLinksInput
          streamingLinks={formData.streaming_links || {}}
          onChange={(links) => setFormData({ ...formData, streaming_links: links })}
        />
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="ai_genres">Genres</Label>
                <Input
                  id="ai_genres"
                  value={bioConfig.genres}
                  onChange={(e) => setBioConfig({ ...bioConfig, genres: e.target.value })}
                  placeholder="Electronic, Ambient, Jazz"
                />
              </div>
              
              <div>
                <Label htmlFor="ai_influences">Musical Influences</Label>
                <Input
                  id="ai_influences"
                  value={bioConfig.influences}
                  onChange={(e) => setBioConfig({ ...bioConfig, influences: e.target.value })}
                  placeholder="Radiohead, Aphex Twin, Miles Davis"
                />
              </div>

              <div>
                <Label htmlFor="ai_location">Location</Label>
                <Input
                  id="ai_location"
                  value={bioConfig.location}
                  onChange={(e) => setBioConfig({ ...bioConfig, location: e.target.value })}
                  placeholder="Brooklyn, NY"
                />
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
                  <Lightbulb className="w-4 h-4 mr-2" />
                  {generatingBio ? "Remixing Your Bio..." : "Remix Existing Bio"}
                </Button>
              ) : (
                <Button
                  onClick={() => generateBio(false)}
                  disabled={generatingBio || !bioConfig.style}
                  className="w-full"
                  size="lg"
                >
                  <Lightbulb className="w-4 h-4 mr-2" />
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

          {/* Generated Bio Preview */}
          {generatedBioPreview && (
            <div className="space-y-4 p-4 border rounded-lg bg-background">
              <div className="flex items-center justify-between">
                <h5 className="font-medium">Generated Bio Preview</h5>
                <div className="text-xs text-muted-foreground">
                  {generatedBioPreview.trim().split(/\s+/).length} words
                </div>
              </div>
              
              <div className="text-sm leading-relaxed p-3 bg-muted/30 rounded border-l-4 border-primary">
                {generatedBioPreview}
              </div>
              
              <div className="flex gap-3">
                <Button 
                  onClick={() => {
                    setFormData({ ...formData, bio: generatedBioPreview });
                    setGeneratedBioPreview('');
                    toast({
                      title: "Bio applied!",
                      description: "The generated bio has been set as your artist bio.",
                    });
                  }}
                  className="flex-1"
                >
                  Use This Bio
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => generateBio(false)}
                  disabled={generatingBio}
                  className="flex-1"
                >
                  Regenerate
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );

  const renderSocialSection = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Social Links</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            value={formData.social_links?.website || ''}
            onChange={(e) => setFormData({
              ...formData,
              social_links: { ...formData.social_links, website: e.target.value }
            })}
            placeholder="https://yourwebsite.com"
          />
        </div>
        
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
      </div>
    </div>
  );

  const renderHeroSection = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Hero Image</h3>
      {formData.hero_photo_url ? (
        <div className="relative inline-block">
          <PrivateImage
            storagePath={formData.hero_photo_url}
            alt="Hero image"
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
                    await handleHeroPhotoUpload(file);
                    toast({
                      title: "Photo uploaded",
                      description: "Hero image uploaded successfully",
                    });
                  } catch (error) {
                    toast({
                      title: "Upload failed",
                      description: "Failed to upload hero image",
                      variant: "destructive",
                    });
                  }
                }
              }}
              className="hidden"
            />
            <Camera className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Upload hero image</p>
          </Label>
        </div>
      )}
    </div>
  );

  const renderVideosSection = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Videos</h3>
      
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

      <div className="flex gap-2">
        <Input
          placeholder="YouTube URL"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              const input = e.target as HTMLInputElement;
              addVideo(input.value);
              input.value = '';
            }
          }}
        />
        <Button
          variant="outline"
          onClick={(e) => {
            const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement;
            addVideo(input.value);
            input.value = '';
          }}
        >
          Add
        </Button>
      </div>
    </div>
  );

  const renderStreamingSection = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Streaming Links</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="spotify_streaming">Spotify</Label>
          <Input
            id="spotify_streaming"
            value={formData.streaming_links?.spotify || ''}
            onChange={(e) => setFormData({
              ...formData,
              streaming_links: { ...formData.streaming_links, spotify: e.target.value }
            })}
            placeholder="https://open.spotify.com/..."
          />
        </div>
        
        <div>
          <Label htmlFor="apple_music">Apple Music</Label>
          <Input
            id="apple_music"
            value={formData.streaming_links?.apple_music || ''}
            onChange={(e) => setFormData({
              ...formData,
              streaming_links: { ...formData.streaming_links, apple_music: e.target.value }
            })}
            placeholder="https://music.apple.com/..."
          />
        </div>

        <div>
          <Label htmlFor="bandcamp">Bandcamp</Label>
          <Input
            id="bandcamp"
            value={formData.streaming_links?.bandcamp || ''}
            onChange={(e) => setFormData({
              ...formData,
              streaming_links: { ...formData.streaming_links, bandcamp: e.target.value }
            })}
            placeholder="https://yourband.bandcamp.com"
          />
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

  const renderSection = () => {
    switch (sectionId) {
      case 'basic':
        return renderBasicSection();
      case 'bio':
        return renderBioSection();
      case 'social':
        return renderSocialSection();
      case 'hero':
        return renderHeroSection();
      case 'videos':
        return renderVideosSection();
      case 'gallery':
        return renderGallerySection();
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
    </div>
  );
}