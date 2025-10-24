import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Rider } from "@/pages/RiderBuilder";
import { User, Users, Music } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTemplate: (template: Rider) => void;
}

const TEMPLATES: Rider[] = [
  {
    name: "Solo Artist Technical Rider",
    type: "technical",
    sections: [
      {
        id: "1",
        title: "🎤 Input List",
        type: "input-list",
        content: {
          inputs: "1. Lead Vocals - Shure SM58 or equivalent\n2. Acoustic Guitar - DI Box required\n3. Backing Track - Stereo 1/4\" or XLR"
        }
      },
      {
        id: "2",
        title: "🔊 Monitoring",
        type: "monitoring",
        content: {
          requirements: "1 x Floor monitor (wedge)\nPrefer vocals and backing track in monitor"
        }
      },
      {
        id: "3",
        title: "⚡ Power Requirements",
        type: "power",
        content: {
          powerType: "110V standard",
          outlets: "2",
          details: "1 outlet for laptop/backing tracks\n1 outlet for tuner/pedals"
        }
      }
    ]
  },
  {
    name: "3-Piece Band Technical Rider",
    type: "technical",
    sections: [
      {
        id: "1",
        title: "🎤 Input List",
        type: "input-list",
        content: {
          inputs: "1. Lead Vocals - SM58\n2. Backing Vocals - SM58\n3. Electric Guitar - Marshall amp (mic'd with SM57)\n4. Bass - DI Box + Ampeg amp (optional mic)\n5. Kick Drum - Beta 52 or equivalent\n6. Snare - SM57\n7. Overhead - Pair of condenser mics"
        }
      },
      {
        id: "2",
        title: "🎸 Backline",
        type: "backline",
        content: {
          venueProvides: "Full drum kit (kick, snare, toms, cymbals with stands)\nBass amp (Ampeg or equivalent, minimum 300W)\nGuitar amp for monitoring (optional)",
          artistBrings: "All guitars, bass, pedals, and sticks\nMicrophone preferences if needed"
        }
      },
      {
        id: "3",
        title: "🔊 Monitoring",
        type: "monitoring",
        content: {
          requirements: "3 x Floor monitors (1 per member)\nVocals, guitar, and bass in all mixes\nDrummer needs click track capability"
        }
      }
    ]
  },
  {
    name: "Full Band Technical Rider",
    type: "technical",
    sections: [
      {
        id: "1",
        title: "🎤 Input List",
        type: "input-list",
        content: {
          inputs: "VOCALS:\n1. Lead Vocals - Shure SM58\n2. Backing Vocals 1 - SM58\n3. Backing Vocals 2 - SM58\n\nINSTRUMENTS:\n4. Electric Guitar 1 - Marshall amp (SM57)\n5. Electric Guitar 2 - Fender amp (SM57)\n6. Bass Guitar - DI + Ampeg SVT (Beta 52)\n7. Keyboard Left - DI Box\n8. Keyboard Right - DI Box\n\nDRUMS:\n9. Kick - Beta 52\n10. Snare Top - SM57\n11. Snare Bottom - SM57\n12. Hi-Hat - Condenser\n13. Tom 1 - Sennheiser e604\n14. Tom 2 - Sennheiser e604\n15. Floor Tom - Sennheiser e604\n16. Overhead L - Condenser\n17. Overhead R - Condenser"
        }
      },
      {
        id: "2",
        title: "🎸 Backline",
        type: "backline",
        content: {
          venueProvides: "Full drum kit with double bass pedal\nBass amp (Ampeg SVT or equivalent, 500W+)\nKeyboard stands and power\nGuitar amps (2x Marshall or Fender equivalents)",
          artistBrings: "All instruments, pedals, cables, and drum hardware\nKeyboards and synths\nWireless systems for guitars"
        }
      },
      {
        id: "3",
        title: "🔊 Monitoring",
        type: "monitoring",
        content: {
          requirements: "6 x Floor monitors (wedges)\n- Lead vocals: Own mix with heavy vocals\n- Guitar 1: Guitar + vocals\n- Guitar 2: Guitar + vocals  \n- Bass: Bass + kick + vocals\n- Keys: Keys + vocals\n- Drums: In-ear monitors preferred (provide belt packs) or 2 wedges\n\nAll members need click track capability"
        }
      },
      {
        id: "4",
        title: "💡 Lighting",
        type: "lighting",
        content: {
          notes: "Basic stage wash with color options\nSpotlights for lead vocalist\nNo strobes or flashing lights\nDimmer control for dramatic moments"
        }
      }
    ]
  },
  {
    name: "Standard Hospitality Rider",
    type: "hospitality",
    sections: [
      {
        id: "1",
        title: "🍽️ Food & Drink",
        type: "food-drink",
        content: {
          food: "Light meal or substantial snacks for band (4 people)\nVegetarian options required\nNo peanuts or tree nuts",
          drinks: "12 bottles of water\n6 soft drinks (variety)\n2 energy drinks\nCoffee/tea service"
        }
      },
      {
        id: "2",
        title: "🚪 Dressing Room",
        type: "dressing-room",
        content: {
          requirements: "1 secure, private dressing room\nMirrors and adequate lighting\nSeating for 4-6 people\nTable for food and drinks\nPower outlets for charging devices"
        }
      },
      {
        id: "3",
        title: "📋 Guest List",
        type: "guest-list",
        content: {
          count: "6",
          notes: "Guest list names will be provided 24 hours before show"
        }
      },
      {
        id: "4",
        title: "🚗 Transportation",
        type: "transportation",
        content: {
          details: "Load-in access for van at stage door\n2 parking passes for crew vehicles\nPrefer covered loading area if available"
        }
      }
    ]
  }
];

export default function RiderTemplates({ open, onOpenChange, onSelectTemplate }: Props) {
  const technicalTemplates = TEMPLATES.filter(t => t.type === "technical");
  const hospitalityTemplates = TEMPLATES.filter(t => t.type === "hospitality");

  const getIcon = (name: string) => {
    if (name.includes("Solo")) return <User className="w-6 h-6" />;
    if (name.includes("3-Piece")) return <Users className="w-6 h-6" />;
    if (name.includes("Full")) return <Music className="w-6 h-6" />;
    return <Music className="w-6 h-6" />;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Choose a Template</DialogTitle>
          <DialogDescription>
            Start with a pre-built template and customize it to your needs
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8 py-4">
          {/* Technical Templates */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              🎛️ Technical Rider Templates
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              {technicalTemplates.map((template, index) => (
                <Card
                  key={index}
                  className="hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => onSelectTemplate(template)}
                >
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        {getIcon(template.name)}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-base group-hover:text-primary transition-colors">
                          {template.name}
                        </CardTitle>
                        <CardDescription className="text-sm mt-1">
                          {template.sections.length} sections included
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      Use This Template
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Hospitality Templates */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              🍎 Hospitality Rider Templates
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              {hospitalityTemplates.map((template, index) => (
                <Card
                  key={index}
                  className="hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => onSelectTemplate(template)}
                >
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <Music className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-base group-hover:text-primary transition-colors">
                          {template.name}
                        </CardTitle>
                        <CardDescription className="text-sm mt-1">
                          {template.sections.length} sections included
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      Use This Template
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
