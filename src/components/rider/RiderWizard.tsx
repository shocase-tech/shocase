import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Rider } from "@/pages/RiderBuilder";
import { ChevronLeft, ChevronRight, Check, Users, Plus, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { generateStageLayout } from "@/lib/stagePositioning";
import { Badge } from "@/components/ui/badge";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (rider: Rider) => void;
  riderType: "technical" | "hospitality";
}

interface BandMember {
  id: string;
  name: string;
  instruments: string[];
  needsMonitor: boolean;
  needsDI: boolean;
}

const INSTRUMENT_OPTIONS = [
  "Lead Vocals",
  "Backing Vocals",
  "Electric Guitar",
  "Acoustic Guitar",
  "Bass Guitar",
  "Drums",
  "Keyboards/Piano",
  "Synthesizer",
  "DJ Equipment",
  "Other",
];

export default function RiderWizard({ open, onOpenChange, onComplete, riderType }: Props) {
  const [step, setStep] = useState(1);
  const [members, setMembers] = useState<BandMember[]>([
    {
      id: crypto.randomUUID(),
      name: "Member 1",
      instruments: [],
      needsMonitor: true,
      needsDI: false,
    },
  ]);
  const [needsBackline, setNeedsBackline] = useState(true);
  const [needsLighting, setNeedsLighting] = useState(false);

  const addMember = () => {
    setMembers((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: `Member ${prev.length + 1}`,
        instruments: [],
        needsMonitor: true,
        needsDI: false,
      },
    ]);
  };

  const removeMember = (id: string) => {
    if (members.length > 1) {
      setMembers((prev) => prev.filter((m) => m.id !== id));
    }
  };

  const updateMember = (id: string, field: keyof BandMember, value: any) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  const generateRider = (): Rider & { stagePlotData?: any } => {
    const sections: any[] = [];
    const stagePlotData: any = { elements: [] };
    const bandSize = members.length;

    if (riderType === "technical") {
      // Generate Stage Plot Data using smart positioning
      const stageLayout = generateStageLayout(members);
      
      stageLayout.forEach((memberPos) => {
        memberPos.elements.forEach((element) => {
          stagePlotData.elements.push({
            id: crypto.randomUUID(),
            type: element.type,
            x: element.x,
            y: element.y,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
          });
        });
      });

      // Generate Input List
      const inputRows = members.flatMap((member) => {
        return member.instruments.flatMap((instrument) => {
          const baseInput = {
            id: crypto.randomUUID(),
            instrument: instrument || "Unknown",
            mic: getMicRecommendation(instrument),
            notes: member.needsDI ? "DI Box required" : "",
          };

          // Add drum inputs if drummer
          if (instrument.toLowerCase().includes("drum")) {
            return [
              { ...baseInput, instrument: "Kick Drum", mic: "Beta 52 or equivalent", notes: "" },
              { ...baseInput, instrument: "Snare", mic: "SM57", notes: "" },
              { ...baseInput, instrument: "Hi-Hat", mic: "Condenser", notes: "" },
              { ...baseInput, instrument: "Tom 1", mic: "Sennheiser e604", notes: "" },
              { ...baseInput, instrument: "Tom 2", mic: "Sennheiser e604", notes: "" },
              { ...baseInput, instrument: "Floor Tom", mic: "Sennheiser e604", notes: "" },
              { ...baseInput, instrument: "Overhead L", mic: "Condenser", notes: "" },
              { ...baseInput, instrument: "Overhead R", mic: "Condenser", notes: "" },
            ];
          }

          return [baseInput];
        });
      });

      sections.push({
        id: crypto.randomUUID(),
        title: "Input List",
        type: "input-list",
        content: { inputs: inputRows },
      });

      // Generate Backline
      if (needsBackline) {
        const venueProvides: string[] = [];
        const artistBrings: string[] = [];

        members.forEach((m) => {
          m.instruments.forEach((instrument) => {
            const inst = instrument.toLowerCase();
            if (inst.includes("drum")) {
              venueProvides.push("Full drum kit with hardware");
            } else if (inst.includes("bass")) {
              venueProvides.push("Bass amp (Ampeg or equivalent, 300W+)");
            } else if (inst.includes("guitar") && inst.includes("electric")) {
              venueProvides.push("Guitar amp (Marshall or Fender equivalent)");
            } else if (inst.includes("keyboard") || inst.includes("piano")) {
              venueProvides.push("Keyboard stands and power");
            }
          });
        });

        artistBrings.push("All instruments, cables, and personal equipment");
        artistBrings.push("Pedals and effects");

        sections.push({
          id: crypto.randomUUID(),
          title: "Backline",
          type: "backline",
          content: {
            venueProvides: [...new Set(venueProvides)].join("\n"),
            artistBrings: artistBrings.join("\n"),
          },
        });
      }

      // Generate Monitoring
      const monitorCount = members.filter((m) => m.needsMonitor).length;
      sections.push({
        id: crypto.randomUUID(),
        title: "Monitoring",
        type: "monitoring",
        content: {
          requirements: `${monitorCount} x Floor monitors (wedges)\nMix preferences:\n${members
            .filter((m) => m.needsMonitor)
            .map((m) => `- ${m.name}: ${m.instruments.join(", ")} in mix`)
            .join("\n")}`,
        },
      });

      // Generate Power Requirements
      sections.push({
        id: crypto.randomUUID(),
        title: "Power Requirements",
        type: "power",
        content: {
          powerType: "110V standard",
          outlets: String(Math.max(2, Math.ceil(bandSize / 2))),
          details: "Power for pedals, laptops, and charging devices",
        },
      });

      // Generate Lighting (if requested)
      if (needsLighting) {
        sections.push({
          id: crypto.randomUUID(),
          title: "Lighting",
          type: "lighting",
          content: {
            notes: "Basic stage wash with color options\nSpotlights for lead vocalist\nNo strobes or flashing lights",
          },
        });
      }
    } else {
      // Hospitality Rider
      sections.push({
        id: crypto.randomUUID(),
        title: "Food & Drink",
        type: "food-drink",
        content: {
          food: `Light meal or substantial snacks for ${bandSize} people\nVegetarian options preferred\nNo major allergens`,
          drinks: `${bandSize * 3} bottles of water\n${bandSize * 2} soft drinks (variety)\nCoffee/tea service`,
        },
      });

      sections.push({
        id: crypto.randomUUID(),
        title: "Dressing Room",
        type: "dressing-room",
        content: {
          requirements: `1 secure, private dressing room\nSeating for ${bandSize + 2} people\nMirrors and adequate lighting\nTable for food and drinks\nPower outlets for devices`,
        },
      });

      sections.push({
        id: crypto.randomUUID(),
        title: "Guest List",
        type: "guest-list",
        content: {
          count: String(bandSize + 2),
          notes: "Guest list names provided 24 hours before show",
        },
      });

      sections.push({
        id: crypto.randomUUID(),
        title: "Transportation",
        type: "transportation",
        content: {
          details: "Load-in access at stage door\n2 parking passes\nPrefer covered loading area",
        },
      });
    }

    return {
      name: `${riderType === "technical" ? "Technical" : "Hospitality"} Rider - ${bandSize} Members`,
      type: riderType,
      sections,
      stagePlotData,
    };
  };

  const getMicRecommendation = (instrument: string): string => {
    const inst = instrument.toLowerCase();
    if (inst.includes("vocal")) return "Shure SM58 or equivalent";
    if (inst.includes("guitar") && inst.includes("acoustic")) return "DI Box";
    if (inst.includes("guitar")) return "SM57 on amp";
    if (inst.includes("bass")) return "DI + Beta 52 on amp";
    if (inst.includes("keyboard") || inst.includes("piano") || inst.includes("synth")) return "DI Box (stereo)";
    if (inst.includes("sax") || inst.includes("trumpet") || inst.includes("horn")) return "SM57 or condenser";
    return "SM57 or equivalent";
  };

  const handleNext = () => {
    if (step === 1) {
      if (riderType === "technical") {
        setStep(2);
      } else {
        // Skip to generation for hospitality
        const rider = generateRider();
        onComplete(rider);
        resetWizard();
      }
    } else if (step === 2) {
      const rider = generateRider();
      onComplete(rider);
      resetWizard();
    }
  };

  const resetWizard = () => {
    setStep(1);
    setMembers([
      {
        id: crypto.randomUUID(),
        name: "Member 1",
        instruments: [],
        needsMonitor: true,
        needsDI: false,
      },
    ]);
    setNeedsBackline(true);
    setNeedsLighting(false);
    onOpenChange(false);
  };

  const toggleInstrument = (memberId: string, instrument: string) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id === memberId) {
          const instruments = m.instruments.includes(instrument)
            ? m.instruments.filter((i) => i !== instrument)
            : [...m.instruments, instrument];
          return { ...m, instruments };
        }
        return m;
      })
    );
  };

  const removeInstrument = (memberId: string, instrument: string) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id === memberId) {
          return { ...m, instruments: m.instruments.filter((i) => i !== instrument) };
        }
        return m;
      })
    );
  };

  const canProceed = () => {
    if (step === 1) return members.every((m) => m.instruments.length > 0 && m.name.trim());
    return true;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Create Your {riderType === "technical" ? "Technical" : "Hospitality"} Rider
          </DialogTitle>
          <DialogDescription>
            Step {step} of {riderType === "technical" ? 2 : 1} - Let's build a customized rider for your band
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Step 1: Band Member Mapping */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold">
                  Tell us about each band member
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addMember}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Member
                </Button>
              </div>
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {members.map((member, idx) => (
                  <div key={member.id} className="border rounded-lg p-4 space-y-3 bg-card">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <Label htmlFor={`name-${member.id}`}>Band Member Name</Label>
                        <Input
                          id={`name-${member.id}`}
                          value={member.name}
                          onChange={(e) => updateMember(member.id, "name", e.target.value)}
                          placeholder="e.g., John Smith"
                        />
                      </div>
                      {members.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeMember(member.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="pl-11 space-y-2">
                      <Label>Instruments</Label>
                      <Select
                        onValueChange={(value) => toggleInstrument(member.id, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select instruments..." />
                        </SelectTrigger>
                        <SelectContent>
                          {INSTRUMENT_OPTIONS.map((inst) => (
                            <SelectItem key={inst} value={inst}>
                              {inst}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {member.instruments.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {member.instruments.map((inst) => (
                            <Badge
                              key={inst}
                              variant="secondary"
                              className="gap-1 pr-1"
                            >
                              {inst}
                              <button
                                type="button"
                                onClick={() => removeInstrument(member.id, inst)}
                                className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    {riderType === "technical" && member.instruments.length > 0 && (
                      <div className="flex items-center gap-4 pl-11 pt-2 border-t">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id={`monitor-${member.id}`}
                            checked={member.needsMonitor}
                            onCheckedChange={(checked) =>
                              updateMember(member.id, "needsMonitor", checked)
                            }
                          />
                          <label
                            htmlFor={`monitor-${member.id}`}
                            className="text-sm cursor-pointer"
                          >
                            Needs monitor
                          </label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id={`di-${member.id}`}
                            checked={member.needsDI}
                            onCheckedChange={(checked) =>
                              updateMember(member.id, "needsDI", checked)
                            }
                          />
                          <label htmlFor={`di-${member.id}`} className="text-sm cursor-pointer">
                            Needs DI
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Additional Options (Technical only) */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-semibold mb-4">Additional Requirements</h3>
                <div className="space-y-3">
                  <label className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                    <Checkbox
                      id="backline"
                      checked={needsBackline}
                      onCheckedChange={(checked) => setNeedsBackline(checked as boolean)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="font-medium mb-1">
                        Include Backline Section
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Specify equipment venue should provide (amps, drums, etc.)
                      </p>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                    <Checkbox
                      id="lighting"
                      checked={needsLighting}
                      onCheckedChange={(checked) => setNeedsLighting(checked as boolean)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="font-medium mb-1">
                        Include Lighting Requirements
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Add basic lighting preferences to your rider
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4 border-t">
            {step > 1 && riderType === "technical" ? (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            ) : (
              <div />
            )}
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="gap-2 bg-gradient-primary"
            >
              {step === 1 && riderType === "technical"
                ? "Next: Additional Options"
                : "Generate Rider"}
              {step === 2 || riderType === "hospitality" ? (
                <Check className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
