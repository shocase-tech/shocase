import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Wand2, Eye, Download, Share2, ArrowLeft, Settings, Theater, Mic, Speaker, Zap, Lightbulb, FileText, UtensilsCrossed, DoorOpen, Hotel, Car, ClipboardList } from "lucide-react";
import { toast } from "sonner";
import StagePlotEditor from "@/components/rider/StagePlotEditor";
import RiderPreview from "@/components/rider/RiderPreview";
import RiderTemplates from "@/components/rider/RiderTemplates";
import SaveIndicator from "@/components/SaveIndicator";
import { useAutoSave } from "@/hooks/useAutoSave";
import AppHeader from "@/components/AppHeader";
import Footer from "@/components/Footer";
import RiderSection from "@/components/rider/RiderSection";

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
    <>
      <AppHeader />
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
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <div className="flex justify-center mb-12">
            <TabsList className="bg-card/90 backdrop-blur-sm p-2 shadow-xl border-2 border-border/30 h-auto gap-2">
              <TabsTrigger 
                value="technical" 
                className="gap-3 px-10 py-5 text-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all rounded-lg"
              >
                <Settings className="w-6 h-6" />
                <div className="text-left">
                  <div className="font-bold">Technical Rider</div>
                  <div className="text-xs opacity-80 font-normal">Stage & Equipment</div>
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="hospitality" 
                className="gap-3 px-10 py-5 text-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-accent data-[state=active]:to-accent/80 data-[state=active]:text-accent-foreground data-[state=active]:shadow-lg transition-all rounded-lg"
              >
                <UtensilsCrossed className="w-6 h-6" />
                <div className="text-left">
                  <div className="font-bold">Hospitality Rider</div>
                  <div className="text-xs opacity-80 font-normal">Catering & Amenities</div>
                </div>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="technical" className="space-y-6">
            <Accordion type="multiple" defaultValue={["stage-plot"]} className="space-y-4">
              <AccordionItem value="stage-plot" className="border-2 rounded-xl overflow-hidden bg-card shadow-sm">
                <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Theater className="w-5 h-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-base">Stage Plot</div>
                      <div className="text-xs text-muted-foreground">Visual layout of your stage setup</div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 py-6">
                  <StagePlotEditor
                    data={technicalRider.sections.find(s => s.type === "stage-plot")?.content || {}}
                    onChange={(content) => {
                      const existingSection = technicalRider.sections.find(s => s.type === "stage-plot");
                      if (existingSection) {
                        setTechnicalRider({
                          ...technicalRider,
                          sections: technicalRider.sections.map(s =>
                            s.type === "stage-plot" ? { ...s, content } : s
                          ),
                        });
                      } else {
                        const newSection: RiderSection = {
                          id: crypto.randomUUID(),
                          title: "Stage Plot",
                          type: "stage-plot",
                          content,
                        };
                        setTechnicalRider({
                          ...technicalRider,
                          sections: [...technicalRider.sections, newSection],
                        });
                      }
                    }}
                  />
                </AccordionContent>
              </AccordionItem>

              {[
                { type: "input-list", icon: Mic, title: "Input List", description: "Channels and microphones needed" },
                { type: "monitoring", icon: Speaker, title: "Monitoring", description: "Monitor mixes and stage sound" },
                { type: "power", icon: Zap, title: "Power Requirements", description: "Electrical and power needs" },
                { type: "lighting", icon: Lightbulb, title: "Lighting", description: "Lighting requirements and cues" },
                { type: "notes", icon: FileText, title: "Additional Notes", description: "Any other technical requirements" },
              ].map((sectionConfig) => {
                const section = technicalRider.sections.find(s => s.type === sectionConfig.type);
                const defaultSection: RiderSection = {
                  id: crypto.randomUUID(),
                  title: sectionConfig.title,
                  type: sectionConfig.type,
                  content: {},
                };
                const Icon = sectionConfig.icon;
                return (
                  <AccordionItem key={sectionConfig.type} value={sectionConfig.type} className="border-2 rounded-xl overflow-hidden bg-card shadow-sm">
                    <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="text-left">
                          <div className="font-semibold text-base">{sectionConfig.title}</div>
                          <div className="text-xs text-muted-foreground">{sectionConfig.description}</div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 py-6">
                      <RiderSection
                        section={section || defaultSection}
                        onUpdate={(updates) => {
                          if (section) {
                            setTechnicalRider({
                              ...technicalRider,
                              sections: technicalRider.sections.map(s =>
                                s.id === section.id ? { ...s, ...updates } : s
                              ),
                            });
                          } else {
                            setTechnicalRider({
                              ...technicalRider,
                              sections: [...technicalRider.sections, { ...defaultSection, ...updates }],
                            });
                          }
                        }}
                        onDelete={() => {
                          if (section) {
                            setTechnicalRider({
                              ...technicalRider,
                              sections: technicalRider.sections.filter(s => s.id !== section.id),
                            });
                          }
                        }}
                      />
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </TabsContent>

          <TabsContent value="hospitality" className="space-y-6">
            <Accordion type="multiple" className="space-y-4">
              {[
                { type: "catering", icon: UtensilsCrossed, title: "Catering", description: "Food and beverage requirements" },
                { type: "green-room", icon: DoorOpen, title: "Green Room", description: "Backstage amenities" },
                { type: "accommodation", icon: Hotel, title: "Accommodation", description: "Hotel and lodging needs" },
                { type: "transportation", icon: Car, title: "Transportation", description: "Travel and parking" },
                { type: "misc", icon: ClipboardList, title: "Miscellaneous", description: "Other hospitality needs" },
              ].map((sectionConfig) => {
                const section = hospitalityRider.sections.find(s => s.type === sectionConfig.type);
                const defaultSection: RiderSection = {
                  id: crypto.randomUUID(),
                  title: sectionConfig.title,
                  type: sectionConfig.type,
                  content: {},
                };
                const Icon = sectionConfig.icon;
                return (
                  <AccordionItem key={sectionConfig.type} value={sectionConfig.type} className="border-2 rounded-xl overflow-hidden bg-card shadow-sm">
                    <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-accent-foreground" />
                        </div>
                        <div className="text-left">
                          <div className="font-semibold text-base">{sectionConfig.title}</div>
                          <div className="text-xs text-muted-foreground">{sectionConfig.description}</div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 py-6">
                      <RiderSection
                        section={section || defaultSection}
                        onUpdate={(updates) => {
                          if (section) {
                            setHospitalityRider({
                              ...hospitalityRider,
                              sections: hospitalityRider.sections.map(s =>
                                s.id === section.id ? { ...s, ...updates } : s
                              ),
                            });
                          } else {
                            setHospitalityRider({
                              ...hospitalityRider,
                              sections: [...hospitalityRider.sections, { ...defaultSection, ...updates }],
                            });
                          }
                        }}
                        onDelete={() => {
                          if (section) {
                            setHospitalityRider({
                              ...hospitalityRider,
                              sections: hospitalityRider.sections.filter(s => s.id !== section.id),
                            });
                          }
                        }}
                      />
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
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
      <Footer />
    </>
  );
}
