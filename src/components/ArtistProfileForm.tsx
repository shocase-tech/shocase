import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ImageStorageService } from "@/lib/imageStorage";
import { Loader2, Sparkles, Plus, Trash2, User, Users, Music, MapPin } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FileUpload from "./FileUpload";
import GenreInput from "./GenreInput";
import PrivateImage from "./PrivateImage";
import PhotoUpload from "./PhotoUpload";
import SectionSaveButton from "./SectionSaveButton";

interface ArtistProfile {
  id: string;
  user_id: string;
  artist_name: string;
  bio?: string;
  blurb?: string;
  genre?: string[];
  gallery_photos?: { url: string; label?: string }[];
  press_photos?: { url: string; label?: string }[];
  social_links?: any;
  profile_photo_url?: string;
  performance_type?: 'Solo' | 'Duo' | 'Full Band';
  location?: string;
  spotify_track_url?: string;
  
  pdf_urls?: string[];
  hero_photo_url?: string;
  show_videos?: string[];
  press_quotes?: any[];
  press_mentions?: any[];
  streaming_links?: any;
  playlists?: string[];
  past_shows?: any[];
  upcoming_shows?: any[];
  contact_info?: any;
}

interface ArtistProfileFormProps {
  profile?: ArtistProfile | any; // Allow flexibility for different profile types
  onSaved: () => void;
  userEmail?: string; // Auto-populate from signup
  userPhone?: string; // Auto-populate from signup
}

export default function ArtistProfileForm({ profile, onSaved, userEmail, userPhone }: ArtistProfileFormProps) {
  const [formData, setFormData] = useState({
    artist_name: profile?.artist_name || "",
    bio: profile?.bio || "",
    blurb: profile?.blurb || "",
    genre: Array.isArray(profile?.genre) ? profile.genre : (profile?.genre ? (typeof profile.genre === 'string' ? JSON.parse(profile.genre) : [profile.genre]) : []),
    website: profile?.social_links?.website || "",
    instagram: profile?.social_links?.instagram || "",
    spotify: profile?.social_links?.spotify || "",
    tiktok: profile?.social_links?.tiktok || "",
    performance_type: profile?.performance_type || "",
    location: profile?.location || "",
    spotify_track_url: profile?.spotify_track_url || "",
    show_videos: profile?.show_videos || [],
    press_quotes: profile?.press_quotes || [],
    press_mentions: profile?.press_mentions || [],
    streaming_links: profile?.streaming_links || {},
    playlists: profile?.playlists || [],
    past_shows: profile?.past_shows || [],
    upcoming_shows: profile?.upcoming_shows || [],
    contact_info: {
      email: profile?.contact_info?.email || userEmail || "",
      phone: profile?.contact_info?.phone || userPhone || "",
    },
  });
  const [loading, setLoading] = useState(false);
  const [bioGenerating, setBioGenerating] = useState(false);
  const [bioInputs, setBioInputs] = useState({
    influences: "",
    location: "",
    vibe: ""
  });
  const [activeTab, setActiveTab] = useState("basic");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const profileData = {
        user_id: user.id,
        artist_name: formData.artist_name,
        bio: formData.bio,
        blurb: formData.blurb,
        genre: JSON.stringify(formData.genre),
        performance_type: formData.performance_type,
        location: formData.location,
        spotify_track_url: formData.spotify_track_url,
        social_links: {
          website: formData.website,
          instagram: formData.instagram,
          spotify: formData.spotify,
          tiktok: formData.tiktok,
        },
        show_videos: formData.show_videos,
        press_quotes: formData.press_quotes,
        press_mentions: formData.press_mentions,
        streaming_links: formData.streaming_links,
        playlists: formData.playlists,
        past_shows: formData.past_shows,
        upcoming_shows: formData.upcoming_shows,
        contact_info: formData.contact_info,
      };

      if (profile) {
        // Update existing profile
        const { error } = await supabase
          .from("artist_profiles")
          .update(profileData)
          .eq("id", profile.id);

        if (error) throw error;
      } else {
        // Create new profile
        const { error } = await supabase
          .from("artist_profiles")
          .insert([profileData]);

        if (error) throw error;
      }

      onSaved();
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

  // AI Blurb Generation Function
  const [blurbGenerating, setBlurbGenerating] = useState(false);
  
  // Rate limiting for API calls
  const [lastGenerationTime, setLastGenerationTime] = useState(0);
  const GENERATION_COOLDOWN = 2000; // 2 seconds between requests
  
  const generateBlurbWithAI = async () => {
    // Check cooldown to prevent rapid requests
    const now = Date.now();
    const timeSinceLastGeneration = now - lastGenerationTime;
    
    if (timeSinceLastGeneration < GENERATION_COOLDOWN) {
      const remainingTime = Math.ceil((GENERATION_COOLDOWN - timeSinceLastGeneration) / 1000);
      toast({
        title: "Please wait",
        description: `Please wait ${remainingTime} second${remainingTime !== 1 ? 's' : ''} before generating again.`,
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.bio || formData.bio.trim().length < 50) {
      toast({
        title: "Bio required",
        description: "Please write a bio first before generating a blurb.",
        variant: "destructive",
      });
      return;
    }
    
    setLastGenerationTime(now);
    setBlurbGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-bio', {
        body: {
          artist_name: formData.artist_name,
          existing_bio: formData.bio,
          is_blurb: true,
          word_limit: 20
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to generate blurb');
      }

      if (data?.bio) {
        setFormData({ ...formData, blurb: data.bio });
        toast({
          title: "Blurb generated!",
          description: "Your AI-generated blurb has been created.",
        });
      } else {
        throw new Error('No blurb content received');
      }
    } catch (error: any) {
      console.error("Error generating blurb:", error);
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate blurb. Please try again.",
        variant: "destructive",
      });
    } finally {
      setBlurbGenerating(false);
    }
  };

  // Spotify URL Validation
  const isValidSpotifyUrl = (url: string): boolean => {
    const spotifyPattern = /^https:\/\/open\.spotify\.com\/track\/[a-zA-Z0-9]+(\?.*)?$/;
    return spotifyPattern.test(url);
  };

  const updateField = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const generateBio = async () => {
    // Check cooldown to prevent rapid requests
    const now = Date.now();
    const timeSinceLastGeneration = now - lastGenerationTime;
    
    if (timeSinceLastGeneration < GENERATION_COOLDOWN) {
      const remainingTime = Math.ceil((GENERATION_COOLDOWN - timeSinceLastGeneration) / 1000);
      toast({
        title: "Please wait",
        description: `Please wait ${remainingTime} second${remainingTime !== 1 ? 's' : ''} before generating again.`,
        variant: "destructive",
      });
      return;
    }
    
    setLastGenerationTime(now);
    setBioGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-bio', {
        body: {
          artist_name: formData.artist_name,
          genre: formData.genre,
          influences: bioInputs.influences,
          location: bioInputs.location,
          vibe: bioInputs.vibe,
        }
      });

      if (error) throw error;

      setFormData({ ...formData, bio: data.bio });
      toast({
        title: "Bio Generated!",
        description: "AI has generated a bio for you. You can edit it before saving.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to generate bio: " + error.message,
        variant: "destructive",
      });
    } finally {
      setBioGenerating(false);
    }
  };

  const handleFileUpload = async (file: File, type: 'profile' | 'press' | 'pdf' | 'hero' | 'gallery'): Promise<string> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    // Upload file and get storage path (not URL)
    const storagePath = await ImageStorageService.uploadFile(file, type, user.id);

    // For immediate display in the form, generate a signed URL
    const signedUrl = await ImageStorageService.getSignedUrl(storagePath);
    
    // Save the storage path to the database, but return the signed URL for immediate display
    if (type === 'profile') {
      await saveSection({ profile_photo_url: storagePath });
    } else if (type === 'hero') {
      await saveSection({ hero_photo_url: storagePath });
    }
    
    return signedUrl;
  };

  const saveSection = async (sectionData: any) => {
    if (!profile) return;
    
    try {
      setLoading(true);
      const { error } = await supabase
        .from("artist_profiles")
        .update(sectionData)
        .eq("id", profile.id);

      if (error) throw error;
      
      onSaved();
      toast({
        title: "Success!",
        description: "Section updated successfully.",
      });
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

  const addItem = (field: string, item: any) => {
    setFormData({
      ...formData,
      [field]: [...(formData[field] || []), item]
    });
  };

  const removeItem = (field: string, index: number) => {
    const items = [...(formData[field] || [])];
    items.splice(index, 1);
    setFormData({ ...formData, [field]: items });
  };

  const updateItem = (field: string, index: number, item: any) => {
    const items = [...(formData[field] || [])];
    items[index] = item;
    setFormData({ ...formData, [field]: items });
  };

  return (
    <Card className="glass-card border-white/10">
      <CardHeader>
        <CardTitle>{profile ? "Edit Profile" : "Create Your Artist Profile"}</CardTitle>
        <CardDescription>
          {profile ? "Update your artist information and press kit" : "Fill out your artist information to create your EPK"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
            <TabsTrigger value="press">Press Kit</TabsTrigger>
            <TabsTrigger value="shows">Shows</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="artist_name">Artist Name *</Label>
                  <Input
                    id="artist_name"
                    value={formData.artist_name}
                    onChange={(e) => setFormData({ ...formData, artist_name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="genre">Genres</Label>
                  <GenreInput
                    genres={formData.genre}
                    onChange={(genres) => setFormData({ ...formData, genre: genres })}
                    placeholder="Add genres (e.g., Rock, Pop, Hip-Hop)"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="bio">Artist Bio</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={generateBio}
                    disabled={bioGenerating || !formData.artist_name}
                    className="gap-2"
                  >
                    {bioGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Generate with AI
                      </>
                    )}
                  </Button>
                </div>
                
                {!formData.bio && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white/5 rounded-lg">
                    <div className="space-y-2">
                      <Label htmlFor="influences">Influences (for AI)</Label>
                      <Input
                        id="influences"
                        value={bioInputs.influences}
                        onChange={(e) => setBioInputs({ ...bioInputs, influences: e.target.value })}
                        placeholder="e.g., The Beatles, Radiohead"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location (for AI)</Label>
                      <Input
                        id="location"
                        value={bioInputs.location}
                        onChange={(e) => setBioInputs({ ...bioInputs, location: e.target.value })}
                        placeholder="e.g., Los Angeles, CA"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vibe">Musical Vibe (for AI)</Label>
                      <Input
                        id="vibe"
                        value={bioInputs.vibe}
                        onChange={(e) => setBioInputs({ ...bioInputs, vibe: e.target.value })}
                        placeholder="e.g., Melancholic, Upbeat"
                      />
                    </div>
                  </div>
                )}
                
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell your story..."
                  rows={4}
                />
              </div>

              {/* Blurb Section - NEW */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="blurb" className="text-sm font-medium">
                    Artist Blurb (Optional)
                  </Label>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={generateBlurbWithAI}
                    disabled={!formData.bio || formData.bio.trim().length < 50 || blurbGenerating}
                  >
                    {blurbGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        AI Generate
                      </>
                    )}
                  </Button>
                </div>
                <Textarea
                  id="blurb"
                  placeholder="A short 20-word summary of your artist bio (optional)..."
                  value={formData.blurb || ""}
                  onChange={(e) => {
                    const words = e.target.value.split(' ').filter(word => word.length > 0);
                    if (words.length <= 20) {
                      updateField('blurb', e.target.value);
                    }
                  }}
                  maxLength={200}
                  rows={2}
                  className="resize-none"
                />
                <div className="flex justify-between items-center">
                  <p className="text-xs text-muted-foreground">
                    Perfect for hero sections and quick introductions
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formData.blurb ? formData.blurb.split(' ').filter(w => w.length > 0).length : 0}/20 words
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://yourwebsite.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    value={formData.instagram}
                    onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                    placeholder="@yourusername"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="spotify">Spotify</Label>
                  <Input
                    id="spotify"
                    type="url"
                    value={formData.spotify}
                    onChange={(e) => setFormData({ ...formData, spotify: e.target.value })}
                    placeholder="Spotify profile URL"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tiktok">TikTok</Label>
                  <Input
                    id="tiktok"
                    value={formData.tiktok}
                    onChange={(e) => setFormData({ ...formData, tiktok: e.target.value })}
                    placeholder="@yourusername"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label>Contact Information</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Email address"
                    value={formData.contact_info.email || ""}
                    onChange={(e) => setFormData({
                      ...formData,
                      contact_info: { ...formData.contact_info, email: e.target.value }
                    })}
                  />
                  <Input
                    placeholder="Phone number"
                    value={formData.contact_info.phone || ""}
                    onChange={(e) => setFormData({
                      ...formData,
                      contact_info: { ...formData.contact_info, phone: e.target.value }
                    })}
                  />
                </div>
              </div>

              {/* Performance Type - NEW */}
              <div className="space-y-2">
                <Label htmlFor="performance_type" className="text-sm font-medium">
                  Performance Type
                </Label>
                <Select
                  value={formData.performance_type || ""}
                  onValueChange={(value) => updateField('performance_type', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select your performance setup" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Solo">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Solo
                      </div>
                    </SelectItem>
                    <SelectItem value="Duo">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Duo
                      </div>
                    </SelectItem>
                    <SelectItem value="Full Band">
                      <div className="flex items-center gap-2">
                        <Music className="w-4 h-4" />
                        Full Band
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Location - NEW */}
              <div className="space-y-2">
                <Label htmlFor="location" className="text-sm font-medium">
                  Location
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="location"
                    placeholder="e.g., Nashville, TN or London, UK"
                    value={formData.location || ""}
                    onChange={(e) => updateField('location', e.target.value)}
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Your city and state/country for booking inquiries
                </p>
              </div>

              {/* Spotify Track Embed - NEW */}
              <div className="space-y-2">
                <Label htmlFor="spotify_track_url" className="text-sm font-medium">
                  Featured Spotify Track (Optional)
                </Label>
                <div className="relative">
                  <Music className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="spotify_track_url"
                    placeholder="Paste Spotify track URL here (e.g., https://open.spotify.com/track/...)"
                    value={formData.spotify_track_url || ""}
                    onChange={(e) => updateField('spotify_track_url', e.target.value)}
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  This track will be embedded on your EPK page for visitors to play
                </p>
                {formData.spotify_track_url && !isValidSpotifyUrl(formData.spotify_track_url) && (
                  <p className="text-xs text-red-500">
                    Please enter a valid Spotify track URL
                  </p>
                )}
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Saving..." : (profile ? "Update Profile" : "Create Profile")}
              </Button>
            </form>
            
            {profile && (
              <SectionSaveButton
                sectionName="Basic Info"
                loading={loading}
                onSave={() => saveSection({
                  artist_name: formData.artist_name,
                  bio: formData.bio,
                  blurb: formData.blurb,
                  genre: JSON.stringify(formData.genre),
                  performance_type: formData.performance_type,
                  location: formData.location,
                  spotify_track_url: formData.spotify_track_url,
                  social_links: {
                    website: formData.website,
                    instagram: formData.instagram,
                    spotify: formData.spotify,
                    tiktok: formData.tiktok,
                  },
                  contact_info: formData.contact_info,
                })}
              />
            )}
          </TabsContent>

          <TabsContent value="media" className="space-y-6">
            {profile && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Profile & Hero Photos</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <FileUpload
                          label="Profile Photo"
                          accept="image/*"
                          onUpload={(file) => handleFileUpload(file, 'profile')}
                        />
                        {profile.profile_photo_url && (
                          <div className="relative group">
                            <p className="text-sm text-muted-foreground mb-2">Profile Photo</p>
                            <div className="relative">
                              <PrivateImage 
                                storagePath={profile.profile_photo_url} 
                                alt="Profile" 
                                className="w-full h-24 object-cover rounded" 
                              />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded">
                                <span className="text-white text-sm font-medium">Replace</span>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="absolute top-2 right-2 h-6 w-6 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Profile Photo</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete this profile photo? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => saveSection({ profile_photo_url: null })}>
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <FileUpload
                          label="Hero Photo"
                          accept="image/*"
                          onUpload={(file) => handleFileUpload(file, 'hero')}
                        />
                        {profile.hero_photo_url && (
                          <div className="relative group">
                            <p className="text-sm text-muted-foreground mb-2">Hero Photo</p>
                            <div className="relative">
                              <PrivateImage 
                                storagePath={profile.hero_photo_url} 
                                alt="Hero" 
                                className="w-full h-24 object-cover rounded" 
                              />
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="absolute top-2 right-2 h-6 w-6 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Hero Photo</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this hero photo? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => saveSection({ hero_photo_url: null })}>
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Documents</h3>
                    <FileUpload
                      label="Upload PDFs"
                      accept=".pdf"
                      onUpload={(file) => handleFileUpload(file, 'pdf')}
                    />
                    {profile.pdf_urls && profile.pdf_urls.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm text-muted-foreground mb-2">Uploaded PDFs:</p>
                        <div className="space-y-2">
                          {profile.pdf_urls.map((url, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <span>📄</span>
                              <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                Document {index + 1}
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <PhotoUpload
                  title="Gallery Photos"
                  photos={profile.gallery_photos?.map(url => typeof url === 'string' ? { url } : url) || []}
                  onUpload={async (file) => {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (!user) throw new Error("Not authenticated");
                    
                    // Upload and get storage path
                    const storagePath = await ImageStorageService.uploadFile(file, 'gallery', user.id);
                    
                    // Add to current photos
                    const currentPhotos = profile.gallery_photos || [];
                    const updatedPhotos = [...currentPhotos, storagePath];
                    await saveSection({ gallery_photos: updatedPhotos });
                    
                    // Return signed URL for immediate display
                    return ImageStorageService.getSignedUrl(storagePath);
                  }}
                  onUpdate={(photos) => {
                    const updateData = { gallery_photos: photos.map(p => p.url) };
                    saveSection(updateData);
                  }}
                  onReorder={(photos) => {
                    const updateData = { gallery_photos: photos.map(p => p.url) };
                    saveSection(updateData);
                  }}
                  maxPhotos={12}
                  maxSizeText="Max 5MB per photo, up to 12 photos"
                />

                <div>
                  <h3 className="text-lg font-semibold mb-4">Videos (Up to 3)</h3>
                  <p className="text-sm text-muted-foreground mb-4">Add YouTube or Vimeo links to showcase your performances</p>
                  {formData.show_videos.map((video, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <Input
                        placeholder="YouTube/Vimeo URL"
                        value={video}
                        onChange={(e) => updateItem('show_videos', index, e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeItem('show_videos', index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  {formData.show_videos.length < 3 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => addItem('show_videos', '')}
                      className="gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Video
                    </Button>
                  )}
                </div>

                <SectionSaveButton
                  sectionName="Media"
                  loading={loading}
                  onSave={() => saveSection({
                    show_videos: formData.show_videos,
                  })}
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="press" className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Press Quotes</h3>
              {formData.press_quotes.map((quote: any, index: number) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                  <Input
                    placeholder="Quote text"
                    value={quote.text || ''}
                    onChange={(e) => updateItem('press_quotes', index, { ...quote, text: e.target.value })}
                  />
                  <Input
                    placeholder="Source (e.g., Rolling Stone)"
                    value={quote.source || ''}
                    onChange={(e) => updateItem('press_quotes', index, { ...quote, source: e.target.value })}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => removeItem('press_quotes', index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => addItem('press_quotes', { text: '', source: '' })}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Quote
              </Button>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Press Mentions</h3>
              {formData.press_mentions.map((mention: any, index: number) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                  <Input
                    placeholder="Publication name"
                    value={mention.publication || ''}
                    onChange={(e) => updateItem('press_mentions', index, { ...mention, publication: e.target.value })}
                  />
                  <Input
                    placeholder="Article URL"
                    value={mention.url || ''}
                    onChange={(e) => updateItem('press_mentions', index, { ...mention, url: e.target.value })}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => removeItem('press_mentions', index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => addItem('press_mentions', { publication: '', url: '' })}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Mention
              </Button>
            </div>
            
            <SectionSaveButton
              sectionName="Press Kit"
              loading={loading}
              onSave={() => saveSection({
                press_quotes: formData.press_quotes,
                press_mentions: formData.press_mentions,
              })}
            />
          </TabsContent>

          <TabsContent value="shows" className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Past Shows</h3>
              {formData.past_shows.map((show: any, index: number) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
                  <Input
                    placeholder="Venue"
                    value={show.venue || ''}
                    onChange={(e) => updateItem('past_shows', index, { ...show, venue: e.target.value })}
                  />
                  <Input
                    placeholder="City"
                    value={show.city || ''}
                    onChange={(e) => updateItem('past_shows', index, { ...show, city: e.target.value })}
                  />
                  <Input
                    type="date"
                    value={show.date || ''}
                    onChange={(e) => updateItem('past_shows', index, { ...show, date: e.target.value })}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => removeItem('past_shows', index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => addItem('past_shows', { venue: '', city: '', date: '' })}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Show
              </Button>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Upcoming Shows</h3>
              {formData.upcoming_shows.map((show: any, index: number) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-2">
                  <Input
                    placeholder="Venue"
                    value={show.venue || ''}
                    onChange={(e) => updateItem('upcoming_shows', index, { ...show, venue: e.target.value })}
                  />
                  <Input
                    placeholder="City"
                    value={show.city || ''}
                    onChange={(e) => updateItem('upcoming_shows', index, { ...show, city: e.target.value })}
                  />
                  <Input
                    type="date"
                    value={show.date || ''}
                    onChange={(e) => updateItem('upcoming_shows', index, { ...show, date: e.target.value })}
                  />
                  <Input
                    placeholder="Ticket URL"
                    value={show.ticket_link || ''}
                    onChange={(e) => updateItem('upcoming_shows', index, { ...show, ticket_link: e.target.value })}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => removeItem('upcoming_shows', index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => addItem('upcoming_shows', { venue: '', city: '', date: '', ticket_link: '' })}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Show
              </Button>
            </div>
            
            <SectionSaveButton
              sectionName="Shows"
              loading={loading}
              onSave={() => saveSection({
                past_shows: formData.past_shows,
                upcoming_shows: formData.upcoming_shows,
              })}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}