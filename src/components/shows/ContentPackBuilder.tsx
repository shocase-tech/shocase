import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Download, Image as ImageIcon, QrCode, FileImage } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Show {
  venue: string;
  city: string;
  date: string;
  ticket_link?: string;
}

const templateStyles = [
  { id: "minimalist", name: "Minimalist", description: "Clean and modern" },
  { id: "retro", name: "Retro", description: "Vintage vibes" },
  { id: "grunge", name: "Grunge", description: "Raw and edgy" },
  { id: "dreamy", name: "Dreamy", description: "Soft and ethereal" }
];

export function ContentPackBuilder({ show }: { show: Show }) {
  const [selectedStyle, setSelectedStyle] = useState("minimalist");
  const { toast } = useToast();

  const handleDownload = (assetType: string) => {
    toast({
      title: "Coming soon!",
      description: `${assetType} generation will be available in a future update.`
    });
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Content Pack Builder</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Generate visual assets for your show promotion. Choose a style and download your content pack.
        </p>

        <div className="max-w-xs">
          <label className="text-sm font-medium mb-2 block">Template Style</label>
          <Select value={selectedStyle} onValueChange={setSelectedStyle}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {templateStyles.map((style) => (
                <SelectItem key={style.id} value={style.id}>
                  <div>
                    <div className="font-medium">{style.name}</div>
                    <div className="text-xs text-muted-foreground">{style.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-primary" />
              <CardTitle className="text-base">Show Poster</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Instagram/Facebook post (1080x1080)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="aspect-square bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center mb-3">
              <div className="text-center p-6">
                <p className="font-bold text-lg">{show.venue}</p>
                <p className="text-sm text-muted-foreground">{show.city}</p>
                <p className="text-sm text-muted-foreground mt-2">{show.date}</p>
                <Badge className="mt-4">{templateStyles.find(s => s.id === selectedStyle)?.name}</Badge>
              </div>
            </div>
            <Button
              size="sm"
              className="w-full"
              onClick={() => handleDownload("Show Poster")}
            >
              <Download className="w-3 h-3 mr-2" />
              Download Poster
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <FileImage className="w-5 h-5 text-primary" />
              <CardTitle className="text-base">Story Template</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Instagram/Facebook story (1080x1920)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="aspect-[9/16] bg-gradient-to-br from-accent/20 to-primary/20 rounded-lg flex items-center justify-center mb-3">
              <div className="text-center p-6">
                <p className="font-bold text-base">{show.venue}</p>
                <p className="text-xs text-muted-foreground">{show.city}</p>
                <p className="text-xs text-muted-foreground mt-2">{show.date}</p>
                <Badge className="mt-3 text-xs">{templateStyles.find(s => s.id === selectedStyle)?.name}</Badge>
              </div>
            </div>
            <Button
              size="sm"
              className="w-full"
              onClick={() => handleDownload("Story Template")}
            >
              <Download className="w-3 h-3 mr-2" />
              Download Story
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-primary" />
              <CardTitle className="text-base">QR Code</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Links to your EPK or ticket page
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="aspect-square bg-white rounded-lg flex items-center justify-center mb-3 border-2">
              <div className="w-32 h-32 bg-black/10 rounded-lg flex items-center justify-center">
                <QrCode className="w-16 h-16 text-muted-foreground" />
              </div>
            </div>
            <Button
              size="sm"
              className="w-full"
              onClick={() => handleDownload("QR Code")}
            >
              <Download className="w-3 h-3 mr-2" />
              Download QR Code
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-primary" />
              <CardTitle className="text-base">Tour Flyer</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Multi-show promotional flyer
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="aspect-[3/4] bg-gradient-to-br from-primary/10 via-accent/10 to-primary/10 rounded-lg flex items-center justify-center mb-3">
              <div className="text-center p-6">
                <p className="font-bold text-sm">TOUR DATES</p>
                <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                  <p>{show.city}</p>
                  <p>{show.date}</p>
                </div>
                <Badge className="mt-4 text-xs">{templateStyles.find(s => s.id === selectedStyle)?.name}</Badge>
              </div>
            </div>
            <Button
              size="sm"
              className="w-full"
              onClick={() => handleDownload("Tour Flyer")}
            >
              <Download className="w-3 h-3 mr-2" />
              Download Flyer
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Download className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium mb-1">Download All Assets</p>
              <p className="text-sm text-muted-foreground mb-3">
                Get all visual assets for this show in one convenient package
              </p>
              <Button onClick={() => handleDownload("Content Pack")}>
                <Download className="w-4 h-4 mr-2" />
                Download Complete Pack
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
