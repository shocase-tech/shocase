import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Wand2, Eye, Download, Share2, ArrowLeft, Music2, Utensils, Settings, Sliders } from "lucide-react";
import { toast } from "sonner";
import RiderBuilderCanvas from "@/components/rider/RiderBuilderCanvas";
import RiderPreview from "@/components/rider/RiderPreview";
import RiderTemplates from "@/components/rider/RiderTemplates";
import SaveIndicator from "@/components/SaveIndicator";
import { useAutoSave } from "@/hooks/useAutoSave";

export interface RiderSection {
  id: string;
  title: string;
  type: string;
  content: any;
}

export interface Rider {
  id?: string;
  name: string;
  type: "technical" | "hospitality";
  sections: RiderSection[];
}

export default function RiderBuilder() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"technical" | "hospitality">("technical");
  const [technicalRider, setTechnicalRider] = useState<Rider>({
    name: "Technical Rider",
    type: "technical",
    sections: [],
  });
  const [hospitalityRider, setHospitalityRider] = useState<Rider>({
    name: "Hospitality Rider",
    type: "hospitality",
    sections: [],
  });
  const [showPreview, setShowPreview] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [loading, setLoading] = useState(true);

  const currentRider = activeTab === "technical" ? technicalRider : hospitalityRider;
  const setCurrentRider = activeTab === "technical" ? setTechnicalRider : setHospitalityRider;

  // Load riders from database
  useEffect(() => {
    loadRiders();
  }, []);

  const loadRiders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to use Rider Builder");
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("riders")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_template", false);

      if (error) throw error;

      if (data && data.length > 0) {
        const tech = data.find(r => r.type === "technical");
        const hosp = data.find(r => r.type === "hospitality");

        if (tech) {
          setTechnicalRider({
            id: tech.id,
            name: tech.name,
            type: "technical",
            sections: (tech.sections as unknown) as RiderSection[],
          });
        }

        if (hosp) {
          setHospitalityRider({
            id: hosp.id,
            name: hosp.name,
            type: "hospitality",
            sections: (hosp.sections as unknown) as RiderSection[],
          });
        }
      }
    } catch (error: any) {
      console.error("Error loading riders:", error);
      toast.error("Failed to load riders");
    } finally {
      setLoading(false);
    }
  };

  const saveRider = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const riderToSave = currentRider;
      
      if (riderToSave.id) {
        // Update existing
        const { error } = await supabase
          .from("riders")
          .update({
            name: riderToSave.name,
            sections: riderToSave.sections as any,
          })
          .eq("id", riderToSave.id);

        if (error) throw error;
      } else {
        // Insert new
        const { data, error } = await supabase
          .from("riders")
          .insert([{
            user_id: user.id,
            name: riderToSave.name,
            type: riderToSave.type,
            sections: riderToSave.sections as any,
          }])
          .select()
          .single();

        if (error) throw error;
        
        if (data) {
          setCurrentRider({ ...riderToSave, id: data.id });
        }
      }
    } catch (error: any) {
      console.error("Error saving rider:", error);
      throw error;
    }
  };

  const { hasUnsavedChanges, isSaving, lastSaved } = useAutoSave({
    data: currentRider,
    onSave: saveRider,
    delay: 2000,
    enabled: !loading,
  });

  const handleExportPDF = () => {
    toast.success("PDF export coming soon!");
  };

  const handleShare = async () => {
    const url = window.location.href;
    await navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
  };

  const getCompletionPercentage = (rider: Rider) => {
    if (rider.sections.length === 0) return 0;
    const filledSections = rider.sections.filter(s => 
      s.content && Object.keys(s.content).length > 0
    ).length;
    return Math.round((filledSections / rider.sections.length) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/80 backdrop-blur-lg sticky top-0 z-10 shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/epk")}
                className="mt-2"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
                    <Settings className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <h1 className="text-4xl font-bold tracking-tight">
                    Rider Builder
                  </h1>
                </div>
                <p className="text-muted-foreground text-base ml-[52px]">
                  Professional technical and hospitality requirements for your shows
                </p>
              </div>
            </div>
            <SaveIndicator
              isSaving={isSaving}
              lastSaved={lastSaved}
              hasUnsavedChanges={hasUnsavedChanges}
            />
          </div>

          {/* Action Bar */}
          <div className="flex items-center gap-3 flex-wrap">
            <Button
              onClick={() => setShowTemplates(true)}
              className="gap-2 bg-gradient-primary hover:opacity-90 transition-opacity"
              size="default"
            >
              <Wand2 className="w-4 h-4" />
              Use Template
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowPreview(true)}
              className="gap-2 border-border/50 hover:border-primary/50"
            >
              <Eye className="w-4 h-4" />
              Preview
            </Button>
            <Button
              variant="outline"
              onClick={handleShare}
              className="gap-2 border-border/50 hover:border-primary/50"
            >
              <Share2 className="w-4 h-4" />
              Share
            </Button>
            <Button
              variant="outline"
              onClick={handleExportPDF}
              className="gap-2 border-border/50 hover:border-primary/50"
            >
              <Download className="w-4 h-4" />
              Export PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <div className="flex justify-center mb-10">
            <TabsList className="bg-card/80 backdrop-blur-sm p-1.5 shadow-lg border border-border/50 h-auto">
              <TabsTrigger 
                value="technical" 
                className="gap-3 px-8 py-4 text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all rounded-lg"
              >
                <Sliders className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-semibold">Technical Rider</div>
                  {technicalRider.sections.length > 0 && (
                    <div className="text-xs opacity-70 font-normal">
                      {getCompletionPercentage(technicalRider)}% complete
                    </div>
                  )}
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="hospitality" 
                className="gap-3 px-8 py-4 text-base data-[state=active]:bg-accent data-[state=active]:text-accent-foreground transition-all rounded-lg"
              >
                <Utensils className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-semibold">Hospitality Rider</div>
                  {hospitalityRider.sections.length > 0 && (
                    <div className="text-xs opacity-70 font-normal">
                      {getCompletionPercentage(hospitalityRider)}% complete
                    </div>
                  )}
                </div>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="technical" className="animate-fade-in">
            <RiderBuilderCanvas
              rider={technicalRider}
              onChange={setTechnicalRider}
            />
          </TabsContent>

          <TabsContent value="hospitality" className="animate-fade-in">
            <RiderBuilderCanvas
              rider={hospitalityRider}
              onChange={setHospitalityRider}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <RiderPreview
        open={showPreview}
        onOpenChange={setShowPreview}
        technicalRider={technicalRider}
        hospitalityRider={hospitalityRider}
      />

      <RiderTemplates
        open={showTemplates}
        onOpenChange={setShowTemplates}
        onSelectTemplate={(template) => {
          if (template.type === "technical") {
            setTechnicalRider(template);
          } else {
            setHospitalityRider(template);
          }
          setShowTemplates(false);
          toast.success("Template applied!");
        }}
      />
    </div>
  );
}
