import { useState } from "react";
import { Plus, Theater, Mic, Speaker, Zap, Lightbulb, FileText, UtensilsCrossed, DoorOpen, Hotel, Car, ClipboardList, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import RiderSection from "./RiderSection";
import { Rider, RiderSection as RiderSectionType } from "@/pages/RiderBuilder";

const TECHNICAL_SECTION_TYPES = [
  { value: "stage-plot", label: "Stage Plot", icon: Theater },
  { value: "input-list", label: "Input List", icon: Mic },
  { value: "monitoring", label: "Monitoring", icon: Speaker },
  { value: "power", label: "Power Requirements", icon: Zap },
  { value: "lighting", label: "Lighting", icon: Lightbulb },
  { value: "notes", label: "Additional Notes", icon: FileText },
];

const HOSPITALITY_SECTION_TYPES = [
  { value: "food-drink", label: "Food & Drink", icon: UtensilsCrossed },
  { value: "dressing-room", label: "Dressing Room", icon: DoorOpen },
  { value: "accommodation", label: "Accommodation", icon: Hotel },
  { value: "transportation", label: "Transportation", icon: Car },
  { value: "guest-list", label: "Guest List", icon: ClipboardList },
  { value: "other", label: "Other Requests", icon: Sparkles },
];

interface Props {
  rider: Rider;
  onChange: (rider: Rider) => void;
}

export default function RiderBuilderCanvas({ rider, onChange }: Props) {
  const [selectedType, setSelectedType] = useState<string>("");

  const sectionTypes = rider.type === "technical" 
    ? TECHNICAL_SECTION_TYPES 
    : HOSPITALITY_SECTION_TYPES;

  const handleAddSection = () => {
    if (!selectedType) return;

    const sectionType = sectionTypes.find(s => s.value === selectedType);
    if (!sectionType) return;

    const newSection: RiderSectionType = {
      id: `${Date.now()}-${Math.random()}`,
      title: sectionType.label,
      type: selectedType,
      content: {},
    };

    onChange({
      ...rider,
      sections: [...rider.sections, newSection],
    });

    setSelectedType("");
  };

  const handleUpdateSection = (sectionId: string, updates: Partial<RiderSectionType>) => {
    onChange({
      ...rider,
      sections: rider.sections.map(s =>
        s.id === sectionId ? { ...s, ...updates } : s
      ),
    });
  };

  const handleDeleteSection = (sectionId: string) => {
    onChange({
      ...rider,
      sections: rider.sections.filter(s => s.id !== sectionId),
    });
  };


  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Add Section Interface */}
      <Card className="overflow-hidden border border-border/50 bg-card/80 backdrop-blur-sm shadow-xl">
        <div className="p-8">
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">Add Section</h3>
            <p className="text-sm text-muted-foreground">
              Select the sections you need for your rider
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
            {sectionTypes.map(type => {
              const IconComponent = type.icon;
              return (
                <button
                  key={type.value}
                  onClick={() => setSelectedType(type.value)}
                  className={`group p-5 rounded-lg border-2 transition-all duration-200 text-left hover:scale-[1.02] ${
                    selectedType === type.value
                      ? 'border-primary bg-primary/10'
                      : 'border-border/50 bg-card hover:border-primary/40 hover:bg-card/80'
                  }`}
                >
                  <IconComponent className={`w-8 h-8 mb-3 transition-colors ${
                    selectedType === type.value ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                  }`} />
                  <div className="text-sm font-medium">
                    {type.label}
                  </div>
                </button>
              );
            })}
          </div>

          <Button
            onClick={handleAddSection}
            disabled={!selectedType}
            className="w-full gap-2 h-11 bg-primary hover:bg-primary/90 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            {selectedType ? 'Add Section' : 'Select a section type'}
          </Button>
        </div>
      </Card>

      {/* Sections List */}
      {rider.sections.length === 0 ? (
        <Card className="p-20 text-center bg-card/50 border-border/50">
          <div className="space-y-4 max-w-lg mx-auto">
            <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold">No Sections Yet</h3>
            <p className="text-muted-foreground">
              Add your first section above to start building your rider.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {rider.sections.map(section => (
            <div key={section.id} className="animate-fade-in">
              <RiderSection
                section={section}
                onUpdate={(updates) => handleUpdateSection(section.id, updates)}
                onDelete={() => handleDeleteSection(section.id)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
