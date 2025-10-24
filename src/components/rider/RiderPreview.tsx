import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Rider } from "@/pages/RiderBuilder";
import { Separator } from "@/components/ui/separator";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  technicalRider: Rider;
  hospitalityRider: Rider;
}

export default function RiderPreview({
  open,
  onOpenChange,
  technicalRider,
  hospitalityRider,
}: Props) {
  const renderSectionContent = (section: any) => {
    switch (section.type) {
      case "stage-plot":
        return (
          <div className="space-y-4">
            {section.content.imageUrl && (
              <img
                src={section.content.imageUrl}
                alt="Stage plot"
                className="w-full rounded-lg border"
              />
            )}
            {section.content.notes && (
              <p className="text-sm whitespace-pre-wrap">{section.content.notes}</p>
            )}
          </div>
        );

      case "input-list":
        return (
          <pre className="text-sm whitespace-pre-wrap font-sans">
            {section.content.inputs || "Not specified"}
          </pre>
        );

      case "backline":
        return (
          <div className="space-y-4">
            {section.content.venueProvides && (
              <div>
                <p className="font-semibold text-sm mb-2">Venue Provides:</p>
                <p className="text-sm whitespace-pre-wrap">{section.content.venueProvides}</p>
              </div>
            )}
            {section.content.artistBrings && (
              <div>
                <p className="font-semibold text-sm mb-2">Artist Brings:</p>
                <p className="text-sm whitespace-pre-wrap">{section.content.artistBrings}</p>
              </div>
            )}
          </div>
        );

      case "power":
        return (
          <div className="space-y-2 text-sm">
            {section.content.powerType && (
              <p><span className="font-semibold">Power Type:</span> {section.content.powerType}</p>
            )}
            {section.content.outlets && (
              <p><span className="font-semibold">Outlets Needed:</span> {section.content.outlets}</p>
            )}
            {section.content.details && (
              <p className="whitespace-pre-wrap mt-2">{section.content.details}</p>
            )}
          </div>
        );

      case "food-drink":
        return (
          <div className="space-y-4">
            {section.content.food && (
              <div>
                <p className="font-semibold text-sm mb-2">Food:</p>
                <p className="text-sm whitespace-pre-wrap">{section.content.food}</p>
              </div>
            )}
            {section.content.drinks && (
              <div>
                <p className="font-semibold text-sm mb-2">Drinks:</p>
                <p className="text-sm whitespace-pre-wrap">{section.content.drinks}</p>
              </div>
            )}
          </div>
        );

      case "guest-list":
        return (
          <div className="space-y-2 text-sm">
            {section.content.count && (
              <p><span className="font-semibold">Number of Spots:</span> {section.content.count}</p>
            )}
            {section.content.notes && (
              <p className="whitespace-pre-wrap mt-2">{section.content.notes}</p>
            )}
          </div>
        );

      default:
        return (
          <p className="text-sm whitespace-pre-wrap">
            {section.content.requirements || section.content.needs || section.content.details || section.content.notes || "Not specified"}
          </p>
        );
    }
  };

  const renderRider = (rider: Rider) => {
    if (rider.sections.length === 0) {
      return (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            No sections added yet
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-6">
        {rider.sections.map((section, index) => (
          <div key={section.id}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{section.title}</CardTitle>
              </CardHeader>
              <CardContent>
                {renderSectionContent(section)}
              </CardContent>
            </Card>
            {index < rider.sections.length - 1 && <Separator className="my-4" />}
          </div>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Rider Preview</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="technical" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="technical" className="flex-1">
              🎛️ Technical Rider
            </TabsTrigger>
            <TabsTrigger value="hospitality" className="flex-1">
              🍎 Hospitality Rider
            </TabsTrigger>
            <TabsTrigger value="both" className="flex-1">
              Both
            </TabsTrigger>
          </TabsList>

          <TabsContent value="technical" className="space-y-6 mt-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">{technicalRider.name}</h2>
              <p className="text-sm text-muted-foreground mb-6">Technical Rider</p>
              {renderRider(technicalRider)}
            </div>
          </TabsContent>

          <TabsContent value="hospitality" className="space-y-6 mt-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">{hospitalityRider.name}</h2>
              <p className="text-sm text-muted-foreground mb-6">Hospitality Rider</p>
              {renderRider(hospitalityRider)}
            </div>
          </TabsContent>

          <TabsContent value="both" className="space-y-8 mt-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">{technicalRider.name}</h2>
              <p className="text-sm text-muted-foreground mb-6">Technical Rider</p>
              {renderRider(technicalRider)}
            </div>

            <Separator className="my-8" />

            <div>
              <h2 className="text-2xl font-bold mb-2">{hospitalityRider.name}</h2>
              <p className="text-sm text-muted-foreground mb-6">Hospitality Rider</p>
              {renderRider(hospitalityRider)}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
