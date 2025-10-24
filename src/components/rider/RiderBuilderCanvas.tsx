import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import DragDropContainer from "@/components/DragDropContainer";
import RiderSection from "./RiderSection";
import { Rider, RiderSection as RiderSectionType } from "@/pages/RiderBuilder";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TECHNICAL_SECTION_TYPES = [
  { value: "stage-plot", label: "🎭 Stage Plot", icon: "🎭" },
  { value: "input-list", label: "🎤 Input List", icon: "🎤" },
  { value: "backline", label: "🎸 Backline", icon: "🎸" },
  { value: "monitoring", label: "🔊 Monitoring", icon: "🔊" },
  { value: "power", label: "⚡ Power Requirements", icon: "⚡" },
  { value: "lighting", label: "💡 Lighting", icon: "💡" },
  { value: "notes", label: "📝 Notes", icon: "📝" },
];

const HOSPITALITY_SECTION_TYPES = [
  { value: "food-drink", label: "🍽️ Food & Drink", icon: "🍽️" },
  { value: "dressing-room", label: "🚪 Dressing Room", icon: "🚪" },
  { value: "accommodation", label: "🏨 Accommodation", icon: "🏨" },
  { value: "transportation", label: "🚗 Transportation", icon: "🚗" },
  { value: "guest-list", label: "📋 Guest List", icon: "📋" },
  { value: "other", label: "✨ Other Requests", icon: "✨" },
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

  const handleReorder = (newOrder: string[]) => {
    const reordered = newOrder.map(id =>
      rider.sections.find(s => s.id === id)!
    );
    onChange({
      ...rider,
      sections: reordered,
    });
  };

  const sectionIds = rider.sections.map(s => s.id);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Add Section Card */}
      <Card className="p-6 bg-primary/5 border-primary/20">
        <div className="flex items-center gap-4">
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Choose a section to add..." />
            </SelectTrigger>
            <SelectContent>
              {sectionTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={handleAddSection}
            disabled={!selectedType}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Section
          </Button>
        </div>
      </Card>

      {/* Sections List */}
      {rider.sections.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="space-y-2">
            <p className="text-lg text-muted-foreground">
              No sections yet. Add your first section above!
            </p>
            <p className="text-sm text-muted-foreground">
              Drag sections to reorder them once you've added a few.
            </p>
          </div>
        </Card>
      ) : (
        <DragDropContainer items={sectionIds} onReorder={handleReorder}>
          <div className="space-y-4">
            {rider.sections.map(section => (
              <RiderSection
                key={section.id}
                section={section}
                onUpdate={(updates) => handleUpdateSection(section.id, updates)}
                onDelete={() => handleDeleteSection(section.id)}
              />
            ))}
          </div>
        </DragDropContainer>
      )}
    </div>
  );
}
