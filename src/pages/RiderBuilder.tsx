import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Wand2, Eye, Download, Share2, ArrowLeft, Settings, Theater, Mic, Speaker, Zap, Lightbulb, FileText, UtensilsCrossed, DoorOpen, Hotel, Car, ClipboardList, Check } from "lucide-react";
import { toast } from "sonner";
import StagePlotEditor from "@/components/rider/StagePlotEditor";
import RiderPreview from "@/components/rider/RiderPreview";
import RiderTemplates from "@/components/rider/RiderTemplates";
import SaveIndicator from "@/components/SaveIndicator";
import { useAutoSave } from "@/hooks/useAutoSave";
import AppHeader from "@/components/AppHeader";
import Footer from "@/components/Footer";
import RiderSection from "@/components/rider/RiderSection";
import { cn } from "@/lib/utils";

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

const TECHNICAL_SECTIONS = [
  { type: "stage-plot", icon: Theater, title: "Stage Plot", description: "Visual layout of your stage setup" },
  { type: "input-list", icon: Mic, title: "Input List", description: "Channels and microphones needed" },
  { type: "monitoring", icon: Speaker, title: "Monitoring", description: "Monitor mixes and stage sound" },
  { type: "power", icon: Zap, title: "Power Requirements", description: "Electrical and power needs" },
  { type: "lighting", icon: Lightbulb, title: "Lighting", description: "Lighting requirements and cues" },
  { type: "notes", icon: FileText, title: "Additional Notes", description: "Any other technical requirements" },
];

const HOSPITALITY_SECTIONS = [
  { type: "catering", icon: UtensilsCrossed, title: "Catering", description: "Food and beverage requirements" },
  { type: "green-room", icon: DoorOpen, title: "Green Room", description: "Backstage amenities" },
  { type: "accommodation", icon: Hotel, title: "Accommodation", description: "Hotel and lodging needs" },
  { type: "transportation", icon: Car, title: "Transportation", description: "Travel and parking" },
  { type: "misc", icon: ClipboardList, title: "Miscellaneous", description: "Other hospitality needs" },
];

export default function RiderBuilder() {
  const navigate = useNavigate();
  const [riderType, setRiderType] = useState<"technical" | "hospitality">("technical");
  const [activeSection, setActiveSection] = useState<string>("stage-plot");
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

  const currentRider = riderType === "technical" ? technicalRider : hospitalityRider;
  const setCurrentRider = riderType === "technical" ? setTechnicalRider : setHospitalityRider;
  const sections = riderType === "technical" ? TECHNICAL_SECTIONS : HOSPITALITY_SECTIONS;

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

  const isSectionComplete = (sectionType: string) => {
    const section = currentRider.sections.find(s => s.type === sectionType);
    return section && section.content && Object.keys(section.content).length > 0;
  };

  const handleRiderTypeChange = (type: "technical" | "hospitality") => {
    setRiderType(type);
    setActiveSection(type === "technical" ? "stage-plot" : "catering");
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
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/epk")}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
                    <Settings className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                      Rider Builder
                    </h1>
                    <p className="text-muted-foreground text-sm">
                      Professional technical and hospitality requirements
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  onClick={() => setShowTemplates(true)}
                  className="gap-2 bg-gradient-primary hover:opacity-90 transition-opacity"
                  size="sm"
                >
                  <Wand2 className="w-4 h-4" />
                  Use Template
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowPreview(true)}
                  className="gap-2 border-border/50 hover:border-primary/50"
                  size="sm"
                >
                  <Eye className="w-4 h-4" />
                  Preview
                </Button>
                <Button
                  variant="outline"
                  onClick={handleShare}
                  className="gap-2 border-border/50 hover:border-primary/50"
                  size="sm"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
                <Button
                  variant="outline"
                  onClick={handleExportPDF}
                  className="gap-2 border-border/50 hover:border-primary/50"
                  size="sm"
                >
                  <Download className="w-4 h-4" />
                  Export PDF
                </Button>
                <SaveIndicator
                  isSaving={isSaving}
                  lastSaved={lastSaved}
                  hasUnsavedChanges={hasUnsavedChanges}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Main Layout */}
        <div className="flex w-full">
          {/* Sidebar Navigation */}
          <div className="w-80 border-r border-border/50 bg-card/50 backdrop-blur-sm min-h-[calc(100vh-180px)] sticky top-[180px]">
            {/* Rider Type Switcher */}
            <div className="p-6 border-b border-border/50">
              <div className="flex gap-2">
                <Button
                  onClick={() => handleRiderTypeChange("technical")}
                  variant={riderType === "technical" ? "default" : "outline"}
                  className={cn(
                    "flex-1 gap-2",
                    riderType === "technical" && "bg-gradient-to-r from-primary to-primary/80"
                  )}
                >
                  <Settings className="w-4 h-4" />
                  Technical
                </Button>
                <Button
                  onClick={() => handleRiderTypeChange("hospitality")}
                  variant={riderType === "hospitality" ? "default" : "outline"}
                  className={cn(
                    "flex-1 gap-2",
                    riderType === "hospitality" && "bg-gradient-to-r from-accent to-accent/80"
                  )}
                >
                  <UtensilsCrossed className="w-4 h-4" />
                  Hospitality
                </Button>
              </div>
            </div>

            {/* Section Navigation */}
            <nav className="p-4 space-y-1">
              {sections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.type;
                const isComplete = isSectionComplete(section.type);
                
                return (
                  <button
                    key={section.type}
                    onClick={() => setActiveSection(section.type)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left group",
                      isActive
                        ? "bg-primary/10 text-primary shadow-sm"
                        : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <div className={cn(
                      "w-9 h-9 rounded-lg flex items-center justify-center transition-colors",
                      isActive 
                        ? "bg-primary/20" 
                        : "bg-muted group-hover:bg-muted/80"
                    )}>
                      <Icon className={cn(
                        "w-5 h-5",
                        isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={cn(
                        "font-medium text-sm",
                        isActive && "font-semibold"
                      )}>
                        {section.title}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {section.description}
                      </div>
                    </div>
                    {isComplete && (
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 p-8 max-w-7xl">
            {sections.map((sectionConfig) => {
              if (activeSection !== sectionConfig.type) return null;

              const section = currentRider.sections.find(s => s.type === sectionConfig.type);
              const defaultSection: RiderSection = {
                id: crypto.randomUUID(),
                title: sectionConfig.title,
                type: sectionConfig.type,
                content: {},
              };

              return (
                <Card key={sectionConfig.type} className="p-8 animate-fade-in">
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center">
                        <sectionConfig.icon className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">{sectionConfig.title}</h2>
                        <p className="text-sm text-muted-foreground">{sectionConfig.description}</p>
                      </div>
                    </div>
                  </div>

                  {sectionConfig.type === "stage-plot" ? (
                    <StagePlotEditor
                      data={section?.content || {}}
                      onChange={(content) => {
                        if (section) {
                          setCurrentRider({
                            ...currentRider,
                            sections: currentRider.sections.map(s =>
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
                          setCurrentRider({
                            ...currentRider,
                            sections: [...currentRider.sections, newSection],
                          });
                        }
                      }}
                    />
                  ) : (
                    <RiderSection
                      section={section || defaultSection}
                      onUpdate={(updates) => {
                        if (section) {
                          setCurrentRider({
                            ...currentRider,
                            sections: currentRider.sections.map(s =>
                              s.id === section.id ? { ...s, ...updates } : s
                            ),
                          });
                        } else {
                          setCurrentRider({
                            ...currentRider,
                            sections: [...currentRider.sections, { ...defaultSection, ...updates }],
                          });
                        }
                      }}
                      onDelete={() => {
                        if (section) {
                          setCurrentRider({
                            ...currentRider,
                            sections: currentRider.sections.filter(s => s.id !== section.id),
                          });
                        }
                      }}
                    />
                  )}
                </Card>
              );
            })}
          </div>
        </div>
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
      <Footer />
    </>
  );
}
