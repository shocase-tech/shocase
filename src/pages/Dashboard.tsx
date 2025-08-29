import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";
import ArtistProfileForm from "@/components/ArtistProfileForm";
import ArtistProfileView from "@/components/ArtistProfileView";
import { Copy, ExternalLink } from "lucide-react";

// Use the database type but with transformed data for the UI
interface DashboardArtistProfile {
  id: string;
  user_id: string;
  artist_name: string;
  bio?: string;
  genre?: string[];
  social_links?: any;
  profile_photo_url?: string;
  press_photos?: { url: string; label?: string }[];
  pdf_urls?: string[];
  gallery_photos?: { url: string; label?: string }[];
  hero_photo_url?: string;
  show_videos?: string[];
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

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<DashboardArtistProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session?.user) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("artist_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      // Transform the data to match our interface
      if (data) {
        const transformedProfile: DashboardArtistProfile = {
          ...data,
          genre: data.genre ? (typeof data.genre === 'string' ? JSON.parse(data.genre) : data.genre) : [],
          press_quotes: Array.isArray(data.press_quotes) ? data.press_quotes : [],
          press_mentions: Array.isArray(data.press_mentions) ? data.press_mentions : [],
          past_shows: Array.isArray(data.past_shows) ? data.past_shows : [],
          upcoming_shows: Array.isArray(data.upcoming_shows) ? data.upcoming_shows : [],
          gallery_photos: data.gallery_photos ? 
            (data.gallery_photos.length > 0 && typeof data.gallery_photos[0] === 'string' ? 
              (data.gallery_photos as unknown as string[]).map((url: string) => ({ url })) : 
              data.gallery_photos as unknown as { url: string; label?: string }[]) : [],
          press_photos: data.press_photos ? 
            (data.press_photos.length > 0 && typeof data.press_photos[0] === 'string' ? 
              (data.press_photos as unknown as string[]).map((url: string) => ({ url })) : 
              data.press_photos as unknown as { url: string; label?: string }[]) : [],
        };
        setProfile(transformedProfile);
      } else {
        setProfile(null);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load profile: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleProfileSaved = () => {
    fetchProfile();
    toast({
      title: "Success!",
      description: "Profile saved successfully.",
    });
  };

  const copyPublicLink = async () => {
    if (!profile) return;
    
    const publicUrl = `${window.location.origin}/artist/${profile.id}`;
    try {
      await navigator.clipboard.writeText(publicUrl);
      toast({
        title: "Link copied!",
        description: "Your public press kit link has been copied to clipboard.",
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Please copy the link manually.",
        variant: "destructive",
      });
    }
  };

  const openPublicProfile = () => {
    if (!profile) return;
    window.open(`/artist/${profile.id}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/80">
      <header className="border-b border-white/10 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold gradient-text">WinningEPK Dashboard</h1>
          <Button variant="outline" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-8 glass-card border-white/10">
            <CardHeader>
              <CardTitle>Welcome, {user?.email}</CardTitle>
              <CardDescription>
                {profile ? "Manage your artist profile" : "Create your first artist profile to get started"}
              </CardDescription>
            </CardHeader>
            {profile && (
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={copyPublicLink}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Copy Public Link
                  </Button>
                  <Button
                    onClick={openPublicProfile}
                    variant="secondary"
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Press Kit
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Share your professional press kit: {window.location.origin}/artist/{profile.id}
                </p>
              </CardContent>
            )}
          </Card>

          {profile ? (
            <div className="space-y-8">
              <ArtistProfileView profile={profile} />
              <ArtistProfileForm 
                profile={profile as any} 
                onSaved={handleProfileSaved} 
              />
            </div>
          ) : (
            <ArtistProfileForm 
              onSaved={handleProfileSaved}
            />
          )}
        </div>
      </main>
    </div>
  );
}