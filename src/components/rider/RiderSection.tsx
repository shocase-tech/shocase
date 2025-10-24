import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Trash2, GripVertical, ChevronDown, ChevronUp } from "lucide-react";
import DragDropSection from "@/components/DragDropSection";
import { RiderSection as RiderSectionType } from "@/pages/RiderBuilder";
import StagePlotEditor from "./StagePlotEditor";

interface Props {
  section: RiderSectionType;
  onUpdate: (updates: Partial<RiderSectionType>) => void;
  onDelete: () => void;
}

export default function RiderSection({ section, onUpdate, onDelete }: Props) {
  const [isExpanded, setIsExpanded] = useState(true);

  const renderContent = () => {
    switch (section.type) {
      case "stage-plot":
        return (
          <StagePlotEditor
            data={section.content}
            onChange={(content) => onUpdate({ content })}
          />
        );

      case "input-list":
        return (
          <div className="space-y-4">
            <div>
              <Label>Input List (one per line)</Label>
              <Textarea
                value={section.content.inputs || ""}
                onChange={(e) => onUpdate({
                  content: { ...section.content, inputs: e.target.value }
                })}
                placeholder="1. Lead Vocals - Shure SM58&#10;2. Acoustic Guitar - DI Box&#10;3. Electric Guitar - Marshall Amp (mic'd)&#10;..."
                rows={8}
                className="font-mono text-sm"
              />
            </div>
          </div>
        );

      case "backline":
        return (
          <div className="space-y-4">
            <div>
              <Label>Venue Provides</Label>
              <Textarea
                value={section.content.venueProvides || ""}
                onChange={(e) => onUpdate({
                  content: { ...section.content, venueProvides: e.target.value }
                })}
                placeholder="List equipment the venue should provide..."
                rows={4}
              />
            </div>
            <div>
              <Label>Artist Brings</Label>
              <Textarea
                value={section.content.artistBrings || ""}
                onChange={(e) => onUpdate({
                  content: { ...section.content, artistBrings: e.target.value }
                })}
                placeholder="List equipment you'll bring..."
                rows={4}
              />
            </div>
          </div>
        );

      case "monitoring":
        return (
          <div className="space-y-4">
            <div>
              <Label>Monitor Requirements</Label>
              <Textarea
                value={section.content.requirements || ""}
                onChange={(e) => onUpdate({
                  content: { ...section.content, requirements: e.target.value }
                })}
                placeholder="Describe your monitoring needs..."
                rows={6}
              />
            </div>
          </div>
        );

      case "power":
        return (
          <div className="space-y-4">
            <div>
              <Label>Power Type</Label>
              <Input
                value={section.content.powerType || ""}
                onChange={(e) => onUpdate({
                  content: { ...section.content, powerType: e.target.value }
                })}
                placeholder="e.g., 110V, 220V, 3-phase"
              />
            </div>
            <div>
              <Label>Number of Outlets</Label>
              <Input
                type="number"
                value={section.content.outlets || ""}
                onChange={(e) => onUpdate({
                  content: { ...section.content, outlets: e.target.value }
                })}
                placeholder="How many power outlets needed?"
              />
            </div>
            <div>
              <Label>Additional Details</Label>
              <Textarea
                value={section.content.details || ""}
                onChange={(e) => onUpdate({
                  content: { ...section.content, details: e.target.value }
                })}
                placeholder="Any special power requirements..."
                rows={3}
              />
            </div>
          </div>
        );

      case "food-drink":
        return (
          <div className="space-y-4">
            <div>
              <Label>Food Requests</Label>
              <Textarea
                value={section.content.food || ""}
                onChange={(e) => onUpdate({
                  content: { ...section.content, food: e.target.value }
                })}
                placeholder="Meal preferences, dietary restrictions..."
                rows={4}
              />
            </div>
            <div>
              <Label>Drink Requests</Label>
              <Textarea
                value={section.content.drinks || ""}
                onChange={(e) => onUpdate({
                  content: { ...section.content, drinks: e.target.value }
                })}
                placeholder="Beverages, water, etc..."
                rows={4}
              />
            </div>
          </div>
        );

      case "dressing-room":
        return (
          <div className="space-y-4">
            <div>
              <Label>Dressing Room Requirements</Label>
              <Textarea
                value={section.content.requirements || ""}
                onChange={(e) => onUpdate({
                  content: { ...section.content, requirements: e.target.value }
                })}
                placeholder="Number of rooms, amenities needed, etc..."
                rows={6}
              />
            </div>
          </div>
        );

      case "accommodation":
        return (
          <div className="space-y-4">
            <div>
              <Label>Accommodation Needs</Label>
              <Textarea
                value={section.content.needs || ""}
                onChange={(e) => onUpdate({
                  content: { ...section.content, needs: e.target.value }
                })}
                placeholder="Hotel requirements, number of rooms, dates..."
                rows={6}
              />
            </div>
          </div>
        );

      case "transportation":
        return (
          <div className="space-y-4">
            <div>
              <Label>Transportation Details</Label>
              <Textarea
                value={section.content.details || ""}
                onChange={(e) => onUpdate({
                  content: { ...section.content, details: e.target.value }
                })}
                placeholder="Airport pickup, parking, load-in access..."
                rows={6}
              />
            </div>
          </div>
        );

      case "guest-list":
        return (
          <div className="space-y-4">
            <div>
              <Label>Number of Guest List Spots</Label>
              <Input
                type="number"
                value={section.content.count || ""}
                onChange={(e) => onUpdate({
                  content: { ...section.content, count: e.target.value }
                })}
                placeholder="How many?"
              />
            </div>
            <div>
              <Label>Additional Notes</Label>
              <Textarea
                value={section.content.notes || ""}
                onChange={(e) => onUpdate({
                  content: { ...section.content, notes: e.target.value }
                })}
                placeholder="Any special guest list requests..."
                rows={3}
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <div>
              <Label>Notes</Label>
              <Textarea
                value={section.content.notes || ""}
                onChange={(e) => onUpdate({
                  content: { ...section.content, notes: e.target.value }
                })}
                placeholder="Enter your notes here..."
                rows={6}
              />
            </div>
          </div>
        );
    }
  };

  return (
    <DragDropSection id={section.id} isDraggable>
      <Card className="group hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-3 flex-1">
            <GripVertical className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
            <Input
              value={section.title}
              onChange={(e) => onUpdate({ title: e.target.value })}
              className="font-semibold text-lg border-none shadow-none px-0 focus-visible:ring-0"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        {isExpanded && (
          <CardContent className="animate-accordion-down">
            {renderContent()}
          </CardContent>
        )}
      </Card>
    </DragDropSection>
  );
}
