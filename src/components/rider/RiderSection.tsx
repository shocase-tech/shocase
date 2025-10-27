import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Trash2, Theater, Mic, Speaker, Zap, Lightbulb, FileText, UtensilsCrossed, DoorOpen, Hotel, Car, ClipboardList, Sparkles, Guitar } from "lucide-react";
import { RiderSection as RiderSectionType } from "@/pages/RiderBuilder";
import StagePlotEditor from "./StagePlotEditor";
import InputListTable from "./InputListTable";

interface Props {
  section: RiderSectionType;
  onUpdate: (updates: Partial<RiderSectionType>) => void;
  onDelete: () => void;
}

export default function RiderSection({ section, onUpdate, onDelete }: Props) {
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
            <InputListTable
              data={Array.isArray(section.content.inputs) ? section.content.inputs : []}
              onChange={(inputs) => onUpdate({
                content: { ...section.content, inputs }
              })}
            />
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

  const getSectionIcon = () => {
    const iconMap: Record<string, any> = {
      "stage-plot": Theater,
      "input-list": Mic,
      "backline": Guitar,
      "monitoring": Speaker,
      "power": Zap,
      "lighting": Lightbulb,
      "notes": FileText,
      "food-drink": UtensilsCrossed,
      "dressing-room": DoorOpen,
      "accommodation": Hotel,
      "transportation": Car,
      "guest-list": ClipboardList,
      "other": Sparkles,
    };
    return iconMap[section.type] || FileText;
  };

  const isContentFilled = section.content && Object.keys(section.content).length > 0;
  const SectionIcon = getSectionIcon();

  return (
    <Card className="overflow-hidden border border-border/50 bg-card shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-primary/20">
            <SectionIcon className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <Input
              value={section.title}
              onChange={(e) => {
                e.stopPropagation();
                onUpdate({ title: e.target.value });
              }}
              onClick={(e) => e.stopPropagation()}
              className="font-semibold text-base border-none shadow-none px-0 focus-visible:ring-1 focus-visible:ring-primary bg-transparent h-auto py-0"
            />
            {isContentFilled && (
              <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                Content added
              </div>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </CardHeader>

      <CardContent className="pt-0 border-t border-border/50">
        <div className="pt-6">
          {renderContent()}
        </div>
      </CardContent>
    </Card>
  );
}
