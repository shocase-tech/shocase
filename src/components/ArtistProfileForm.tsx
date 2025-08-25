import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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
  });
  const [loading, setLoading] = useState(false);
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

  const handleFileUpload = async (file: File, type: 'profile' | 'press' | 'pdf') => {
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
        } else if (type === 'press') {
          const currentPhotos = profile.press_photos || [];
          updateData.press_photos = [...currentPhotos, data.publicUrl];
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

  return (
    <Card className="glass-card border-white/10">
      <CardHeader>
        <CardTitle>{profile ? "Edit Profile" : "Create Your Artist Profile"}</CardTitle>
        <CardDescription>
          {profile ? "Update your artist information" : "Fill out your artist information to create your EPK"}
        </CardDescription>
      </CardHeader>
      <CardContent>
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

          <div className="space-y-2">
            <Label htmlFor="bio">Artist Bio</Label>
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

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Saving..." : (profile ? "Update Profile" : "Create Profile")}
          </Button>
        </form>

        {profile && (
          <div className="mt-8 space-y-6">
            <div className="border-t border-white/10 pt-6">
              <h3 className="text-lg font-semibold mb-4">Upload Files</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FileUpload
                  label="Profile Photo"
                  accept="image/*"
                  onUpload={(file) => handleFileUpload(file, 'profile')}
                />
                <FileUpload
                  label="Press Photos"
                  accept="image/*"
                  onUpload={(file) => handleFileUpload(file, 'press')}
                />
                <FileUpload
                  label="PDFs"
                  accept=".pdf"
                  onUpload={(file) => handleFileUpload(file, 'pdf')}
                />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}