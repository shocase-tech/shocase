import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Plus, X, ArrowLeft, Info } from "lucide-react";
import { Helmet } from "react-helmet-async";

interface OutreachComponents {
  id?: string;
  user_id: string;
  expected_draw: string;
  social_proof: string;
  notable_achievements: string[];
  created_at?: string;
  updated_at?: string;
}

export default function OutreachSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [components, setComponents] = useState<OutreachComponents>({
    user_id: "",
    expected_draw: "",
    social_proof: "",
    notable_achievements: [],
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  // Auto-save timer
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/auth");
        return;
      }
      setUserId(session.user.id);
      await fetchOrCreateComponents(session.user.id);
    };

    checkAuth();
  }, [navigate]);

  const fetchOrCreateComponents = async (userId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("outreach_components")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (data) {
        setComponents(data);
      } else {
        // Create empty record
        const { data: newData, error: insertError } = await supabase
          .from("outreach_components")
          .insert({
            user_id: userId,
            expected_draw: "",
            social_proof: "",
            notable_achievements: [],
          })
          .select()
          .single();

        if (insertError) throw insertError;
        setComponents(newData);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load outreach settings: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const triggerAutoSave = (updatedComponents: OutreachComponents) => {
    // Clear existing timeout
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }

    // Show saving indicator
    setSaveStatus("saving");

    // Set new timeout for 1 second
    const timeout = setTimeout(() => {
      saveComponents(updatedComponents);
    }, 1000);

    setSaveTimeout(timeout);
  };

  const saveComponents = async (componentsToSave: OutreachComponents) => {
    if (!userId) return;

    try {
      setSaving(true);
      const { error } = await supabase
        .from("outreach_components")
        .upsert({
          user_id: userId,
          expected_draw: componentsToSave.expected_draw,
          social_proof: componentsToSave.social_proof,
          notable_achievements: componentsToSave.notable_achievements,
        }, {
          onConflict: "user_id",
        });

      if (error) throw error;

      setSaveStatus("saved");
      setTimeout(() => setSaveStatus(null), 2000);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to save: " + error.message,
        variant: "destructive",
      });
      setSaveStatus(null);
    } finally {
      setSaving(false);
    }
  };

  const handleFieldChange = (field: keyof OutreachComponents, value: any) => {
    const updated = { ...components, [field]: value };
    setComponents(updated);
    triggerAutoSave(updated);
  };

  const addAchievement = () => {
    if (components.notable_achievements.length >= 5) return;
    const updated = {
      ...components,
      notable_achievements: [...components.notable_achievements, ""],
    };
    setComponents(updated);
  };

  const updateAchievement = (index: number, value: string) => {
    const updated = {
      ...components,
      notable_achievements: components.notable_achievements.map((a, i) =>
        i === index ? value : a
      ),
    };
    setComponents(updated);
    triggerAutoSave(updated);
  };

  const removeAchievement = (index: number) => {
    const updated = {
      ...components,
      notable_achievements: components.notable_achievements.filter((_, i) => i !== index),
    };
    setComponents(updated);
    triggerAutoSave(updated);
  };

  const getSectionBadge = (value: string | string[]) => {
    const isEmpty = Array.isArray(value) 
      ? value.length === 0 || value.every(v => !v.trim())
      : !value?.trim();

    return isEmpty ? (
      <Badge variant="secondary" className="bg-muted text-muted-foreground">
        Empty
      </Badge>
    ) : (
      <Badge variant="default" className="bg-green-500/20 text-green-400 border-green-500/30">
        Added ✓
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Outreach Settings - Shocase</title>
        <meta name="description" content="Manage your reusable outreach components for venue applications" />
      </Helmet>

      <div className="min-h-screen bg-gradient-dark pb-20">
        <div className="container max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/dashboard")}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
            {saveStatus && (
              <div className="flex items-center gap-2 text-sm">
                {saveStatus === "saving" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                    <span className="text-muted-foreground">Saving...</span>
                  </>
                ) : (
                  <span className="text-green-400">Saved ✓</span>
                )}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Outreach Settings</h1>
              <p className="text-muted-foreground">
                Create reusable components to strengthen your venue applications
              </p>
            </div>

            {/* Info Banner */}
            <Alert className="border-blue-500/30 bg-blue-500/10">
              <Info className="w-4 h-4 text-blue-400" />
              <AlertDescription className="text-blue-200">
                These details strengthen your venue pitches but are optional. They'll be suggested when you apply to venues.
              </AlertDescription>
            </Alert>

            {/* Expected Draw */}
            <Card className="bg-card/50 backdrop-blur border-white/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Expected Draw</CardTitle>
                  {getSectionBadge(components.expected_draw)}
                </div>
                <CardDescription>
                  How many people typically attend your shows in this area?
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Example: 50-100 in Brooklyn venues"
                  value={components.expected_draw}
                  onChange={(e) => {
                    if (e.target.value.length <= 200) {
                      handleFieldChange("expected_draw", e.target.value);
                    }
                  }}
                  maxLength={200}
                  rows={3}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {components.expected_draw.length}/200 characters
                </p>
              </CardContent>
            </Card>

            {/* Social Proof */}
            <Card className="bg-card/50 backdrop-blur border-white/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Social Proof</CardTitle>
                  {getSectionBadge(components.social_proof)}
                </div>
                <CardDescription>
                  Notable press mentions, blog features, or industry recognition
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Example: Featured in Brooklyn Vegan and Consequence"
                  value={components.social_proof}
                  onChange={(e) => {
                    if (e.target.value.length <= 300) {
                      handleFieldChange("social_proof", e.target.value);
                    }
                  }}
                  maxLength={300}
                  rows={4}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {components.social_proof.length}/300 characters
                </p>
              </CardContent>
            </Card>

            {/* Notable Achievements */}
            <Card className="bg-card/50 backdrop-blur border-white/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Notable Achievements</CardTitle>
                  {getSectionBadge(components.notable_achievements)}
                </div>
                <CardDescription>
                  Sold-out shows, streaming milestones, awards (max 5)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {components.notable_achievements.map((achievement, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Example: Sold out Baby's All Right (250 cap)"
                      value={achievement}
                      onChange={(e) => {
                        if (e.target.value.length <= 100) {
                          updateAchievement(index, e.target.value);
                        }
                      }}
                      maxLength={100}
                      className="flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeAchievement(index)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}

                {components.notable_achievements.length < 5 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addAchievement}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Achievement
                  </Button>
                )}

                {components.notable_achievements.length >= 5 && (
                  <p className="text-xs text-muted-foreground text-center">
                    Maximum of 5 achievements reached
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
