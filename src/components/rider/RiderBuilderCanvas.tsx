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
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Fun Add Section Interface */}
      <Card className="overflow-hidden border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 hover:border-primary/50 transition-all duration-300 shadow-lg hover:shadow-glow">
        <div className="p-8">
          <div className="text-center mb-6">
            <div className="text-5xl mb-3 animate-bounce">✨</div>
            <h3 className="text-xl font-bold mb-2">Add a Section</h3>
            <p className="text-sm text-muted-foreground">
              Pick what you want to tell the venue about
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
            {sectionTypes.map(type => (
              <button
                key={type.value}
                onClick={() => setSelectedType(type.value)}
                className={`p-4 rounded-xl border-2 transition-all duration-200 text-left hover:scale-105 hover:shadow-lg ${
                  selectedType === type.value
                    ? 'border-primary bg-primary/10 shadow-glow'
                    : 'border-border bg-card/50 hover:border-primary/50'
                }`}
              >
                <div className="text-3xl mb-2">{type.icon}</div>
                <div className="text-sm font-medium line-clamp-2">
                  {type.label.replace(type.icon, '').trim()}
                </div>
              </button>
            ))}
          </div>

          <Button
            onClick={handleAddSection}
            disabled={!selectedType}
            className="w-full gap-2 h-12 text-base bg-gradient-primary hover:opacity-90 disabled:opacity-50 shadow-lg"
          >
            <Plus className="w-5 h-5" />
            {selectedType ? 'Add This Section' : 'Pick a section first'}
          </Button>
        </div>
      </Card>

      {/* Sections List with Encouragement */}
      {rider.sections.length === 0 ? (
        <Card className="p-16 text-center bg-gradient-card border-border/50">
          <div className="space-y-4 max-w-md mx-auto">
            <div className="text-6xl mb-4">🎵</div>
            <h3 className="text-2xl font-bold">Let's Get Started!</h3>
            <p className="text-muted-foreground text-lg">
              No sections yet — pick something above to begin building your rider.
            </p>
            <p className="text-sm text-muted-foreground">
              Don't worry, you can always change or remove sections later! 🎉
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <span className="text-lg">💡</span>
            <span>Drag sections to reorder them • Click to expand and edit</span>
          </div>
          <DragDropContainer items={sectionIds} onReorder={handleReorder}>
            <div className="space-y-4">
              {rider.sections.map(section => (
                <div key={section.id} className="animate-slide-in-up">
                  <RiderSection
                    section={section}
                    onUpdate={(updates) => handleUpdateSection(section.id, updates)}
                    onDelete={() => handleDeleteSection(section.id)}
                  />
                </div>
              ))}
            </div>
          </DragDropContainer>
        </div>
      )}
    </div>
  );
}
