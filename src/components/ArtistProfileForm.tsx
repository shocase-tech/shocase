import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles, Plus, Trash2 } from "lucide-react";
import FileUpload from "./FileUpload";

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
  hero_photo_url?: string;
  show_videos?: string[];
  gallery_photos?: string[];
  press_quotes?: any[];
  press_mentions?: any[];
  streaming_links?: any;
  playlists?: string[];
  past_shows?: any[];
  upcoming_shows?: any[];
  contact_info?: any;
}

interface ArtistProfileFormProps {
  profile?: ArtistProfile;
  onSaved: () => void;
}

export default function ArtistProfileForm({ profile, onSaved }: ArtistProfileFormProps) {
  const [formData, setFormData] = useState({
    artist_name: profile?.artist_name || "",
    bio: profile?.bio || "",
    genre: profile?.genre || "",
    website: profile?.social_links?.website || "",
    instagram: profile?.social_links?.instagram || "",
    spotify: profile?.social_links?.spotify || "",
    show_videos: profile?.show_videos || [],
    press_quotes: profile?.press_quotes || [],
    press_mentions: profile?.press_mentions || [],
    streaming_links: profile?.streaming_links || {},
    playlists: profile?.playlists || [],
    past_shows: profile?.past_shows || [],
    upcoming_shows: profile?.upcoming_shows || [],
    contact_info: profile?.contact_info || { email: "", phone: "" },
  });
  const [loading, setLoading] = useState(false);
  const [bioGenerating, setBioGenerating] = useState(false);
  const [bioInputs, setBioInputs] = useState({
    influences: "",
    location: "",
    vibe: ""
  });
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
        genre: formData.genre,
        social_links: {
          website: formData.website,
          instagram: formData.instagram,
          spotify: formData.spotify,
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

  const generateBio = async () => {
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

  const handleFileUpload = async (file: File, type: 'profile' | 'press' | 'pdf' | 'hero' | 'gallery') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${type}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('artist-uploads')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('artist-uploads')
        .getPublicUrl(fileName);

      // Update profile with new file URL
      if (profile) {
        let updateData: any = {};
        
        if (type === 'profile') {
          updateData.profile_photo_url = data.publicUrl;
        } else if (type === 'hero') {
          updateData.hero_photo_url = data.publicUrl;
        } else if (type === 'press') {
          const currentPhotos = profile.press_photos || [];
          updateData.press_photos = [...currentPhotos, data.publicUrl];
        } else if (type === 'gallery') {
          const currentGallery = profile.gallery_photos || [];
          updateData.gallery_photos = [...currentGallery, data.publicUrl];
        } else if (type === 'pdf') {
          const currentPdfs = profile.pdf_urls || [];
          updateData.pdf_urls = [...currentPdfs, data.publicUrl];
        }

        const { error: updateError } = await supabase
          .from("artist_profiles")
          .update(updateData)
          .eq("id", profile.id);

        if (updateError) throw updateError;

        onSaved();
        toast({
          title: "Success!",
          description: "File uploaded successfully.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to upload file: " + error.message,
        variant: "destructive",
      });
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
        <Tabs defaultValue="basic" className="space-y-6">
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
                  <Label htmlFor="genre">Genre</Label>
                  <Input
                    id="genre"
                    value={formData.genre}
                    onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                    placeholder="e.g., Rock, Pop, Hip-Hop"
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Saving..." : (profile ? "Update Profile" : "Create Profile")}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="media" className="space-y-6">
            {profile && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Photos</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <FileUpload
                      label="Profile Photo"
                      accept="image/*"
                      onUpload={(file) => handleFileUpload(file, 'profile')}
                    />
                    <FileUpload
                      label="Hero Photo"
                      accept="image/*"
                      onUpload={(file) => handleFileUpload(file, 'hero')}
                    />
                    <FileUpload
                      label="Press Photos"
                      accept="image/*"
                      onUpload={(file) => handleFileUpload(file, 'press')}
                    />
                    <FileUpload
                      label="Gallery Photos"
                      accept="image/*"
                      onUpload={(file) => handleFileUpload(file, 'gallery')}
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Videos (Up to 3)</h3>
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

                <div>
                  <h3 className="text-lg font-semibold mb-4">Documents</h3>
                  <FileUpload
                    label="PDFs"
                    accept=".pdf"
                    onUpload={(file) => handleFileUpload(file, 'pdf')}
                  />
                </div>
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
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}