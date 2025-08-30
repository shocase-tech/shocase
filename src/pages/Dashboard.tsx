import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";
import { Copy, ExternalLink, Edit3, Eye, EyeOff, CheckCircle, Circle } from "lucide-react";
import LivePreviewEditor from "@/components/LivePreviewEditor";

interface DashboardArtistProfile {
  id: string;
  user_id: string;
  artist_name: string;
  bio?: string;
  genre?: string[];
  social_links?: any;
  profile_photo_url?: string;
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
  is_published?: boolean;
  url_slug?: string;
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
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
    };

    getSession();

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

  const calculateCompletionPercentage = () => {
    if (!profile) return 0;
    
    const milestones = [
      { key: 'artist_name', label: 'Artist name', weight: 15 },
      { key: 'bio', label: 'Bio', weight: 20 },
      { key: 'profile_photo_url', label: 'Profile photo', weight: 15 },
      { key: 'gallery_photos', label: 'Gallery photos (min 2)', weight: 20, condition: (p: any) => p.gallery_photos?.length >= 2 },
      { key: 'show_videos', label: 'Videos (min 1)', weight: 15, condition: (p: any) => p.show_videos?.length >= 1 },
      { key: 'press_mentions', label: 'Press mentions (min 1)', weight: 10, condition: (p: any) => p.press_mentions?.length >= 1 },
      { key: 'social_links', label: 'Social links', weight: 5, condition: (p: any) => Object.keys(p.social_links || {}).length > 0 }
    ];

    let completedWeight = 0;
    milestones.forEach(milestone => {
      const isCompleted = milestone.condition 
        ? milestone.condition(profile)
        : profile[milestone.key as keyof DashboardArtistProfile];
      
      if (isCompleted) {
        completedWeight += milestone.weight;
      }
    });

    return completedWeight;
  };

  const getCompletionMilestones = () => {
    if (!profile) return [];
    
    return [
      { label: 'Add artist name', completed: !!profile.artist_name },
      { label: 'Write your bio', completed: !!profile.bio },
      { label: 'Upload profile photo', completed: !!profile.profile_photo_url },
      { label: 'Add 2+ gallery photos', completed: (profile.gallery_photos?.length || 0) >= 2 },
      { label: 'Add 1+ video', completed: (profile.show_videos?.length || 0) >= 1 },
      { label: 'Add 1+ press mention', completed: (profile.press_mentions?.length || 0) >= 1 },
      { label: 'Connect social links', completed: Object.keys(profile.social_links || {}).length > 0 }
    ];
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

  const handleProfileUpdated = () => {
    fetchProfile();
  };

  const togglePublishStatus = async () => {
    if (!profile || !user) return;

    // Show confirmation dialog
    const confirmed = window.confirm(
      profile.is_published 
        ? "Are you sure you want to unpublish your EPK? It will no longer be accessible to the public."
        : "Are you sure you want to publish your EPK? It will be accessible to anyone with the link."
    );

    if (!confirmed) return;

    try {
      const newStatus = !profile.is_published;
      let urlSlug = profile.url_slug;

      if (newStatus && !urlSlug) {
        console.log("Generating URL slug for:", profile.artist_name);
        const { data: slugData, error: slugError } = await supabase
          .rpc('generate_url_slug', { artist_name: profile.artist_name });
        
        if (slugError) throw slugError;
        urlSlug = slugData;
        console.log("Generated slug:", urlSlug);
      }

      console.log("Updating profile publish status:", { newStatus, urlSlug });

      const { error } = await supabase
        .from('artist_profiles')
        .update({ 
          is_published: newStatus,
          url_slug: urlSlug 
        })
        .eq('user_id', user.id);

      if (error) throw error;

      setProfile({ ...profile, is_published: newStatus, url_slug: urlSlug });
      
      toast({
        title: newStatus ? "Press kit published!" : "Press kit unpublished",
        description: newStatus 
          ? `Your press kit is now live at ${window.location.origin}/artist/${urlSlug}`
          : "Your press kit is now private",
      });
    } catch (error: any) {
      console.error("Toggle publish error:", error);
      toast({
        title: "Error",
        description: "Failed to update publish status: " + error.message,
        variant: "destructive",
      });
    }
  };

  const copyPublicLink = async () => {
    if (!profile || !profile.is_published) return;
    
    const publicUrl = `${window.location.origin}/artist/${profile.url_slug || profile.id}`;
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

  const previewProfile = () => {
    if (!profile) return;
    const previewUrl = `/artist/${profile.url_slug || profile.id}`;
    console.log("Opening preview URL:", previewUrl);
    window.open(previewUrl, '_blank');
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

  const completionPercentage = calculateCompletionPercentage();
  const milestones = getCompletionMilestones();
  const completedMilestones = milestones.filter(m => m.completed).length;

  const getStatusBadge = () => {
    if (!profile) return null;
    
    if (profile.is_published) {
      return <Badge variant="default" className="bg-green-500 hover:bg-green-600">Published</Badge>;
    } else if (completionPercentage >= 70) {
      return <Badge variant="secondary">Draft</Badge>;
    } else {
      return <Badge variant="outline">Private</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/80">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 backdrop-blur-sm bg-background/80">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold gradient-text">Press Kit Builder</h1>
            {getStatusBadge()}
          </div>
          <div className="flex items-center gap-3">
            {profile && (
              <>
                <Button
                  onClick={previewProfile}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  {profile.is_published ? "View EPK" : "Preview"}
                </Button>
                {profile.is_published ? (
                  <Button
                    onClick={copyPublicLink}
                    variant="secondary"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Copy Link
                  </Button>
                ) : null}
                <Button
                  onClick={togglePublishStatus}
                  variant={profile.is_published ? "outline" : "default"}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  {profile.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {profile.is_published ? "Unpublish" : "Publish"}
                </Button>
              </>
            )}
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Progress Section */}
          {profile && (
            <Card className="glass-card border-white/10">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold">Your kit is {completionPercentage}% complete</h2>
                    <p className="text-sm text-muted-foreground">
                      {completedMilestones} of {milestones.length} milestones completed
                    </p>
                  </div>
                  <div className="text-2xl font-bold text-primary">{completionPercentage}%</div>
                </div>
                <Progress value={completionPercentage} className="mb-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {milestones.map((milestone, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      {milestone.completed ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <Circle className="w-4 h-4 text-muted-foreground" />
                      )}
                      <span className={milestone.completed ? "text-foreground" : "text-muted-foreground"}>
                        {milestone.label}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Live Preview Editor */}
          <LivePreviewEditor 
            profile={profile} 
            onProfileUpdated={handleProfileUpdated}
            user={user}
          />
        </div>
      </main>
    </div>
  );
}