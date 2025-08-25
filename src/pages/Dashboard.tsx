import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";
import ArtistProfileForm from "@/components/ArtistProfileForm";
import ArtistProfileView from "@/components/ArtistProfileView";

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

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ArtistProfile | null>(null);
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

      setProfile(data);
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
          </Card>

          {profile ? (
            <div className="space-y-8">
              <ArtistProfileView profile={profile} />
              <ArtistProfileForm 
                profile={profile} 
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