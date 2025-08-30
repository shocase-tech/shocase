import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";
import { X, Save, Lightbulb, Upload, Camera } from "lucide-react";
import PhotoUpload from "@/components/PhotoUpload";
import PrivateImage from "@/components/PrivateImage";
import { ImageStorageService } from "@/lib/imageStorage";

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

      // Call onSave to refresh the data but don't close the editor
      onSave();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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

        <div>
          <Label htmlFor="genre">Genres</Label>
          <Input
            id="genre"
            value={Array.isArray(formData.genre) ? formData.genre.join(', ') : formData.genre || ''}
            onChange={(e) => setFormData({ 
              ...formData, 
              genre: e.target.value.split(',').map(g => g.trim()).filter(g => g.length > 0)
            })}
            placeholder="Rock, Pop, Indie"
          />
        </div>
      </div>

      <div>
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

      <div>
        <h4 className="text-md font-medium">Streaming Links</h4>
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
    </div>
  );

  const renderBioSection = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold">Artist Bio</h3>
        <Lightbulb className="w-4 h-4 text-primary" />
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        {bioToneOptions.map((option) => (
          <Card key={option.value} className="cursor-pointer hover:bg-muted/20 transition-colors">
            <CardContent className="p-3">
              <p className="font-medium text-sm">{option.label}</p>
              <p className="text-xs text-muted-foreground mt-1">{option.example}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          rows={6}
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          placeholder="Tell your story..."
        />
      </div>
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
    <div className="space-y-4">
      {renderSection()}
      
      <Separator />
      
      <div className="flex justify-between gap-3">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Done Editing
        </Button>
        <Button onClick={handleSave} disabled={loading} className="flex-1">
          <Save className="w-4 h-4 mr-2" />
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}