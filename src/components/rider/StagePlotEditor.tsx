import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface Props {
  data: any;
  onChange: (data: any) => void;
}

export default function StagePlotEditor({ data, onChange }: Props) {
  const [previewUrl, setPreviewUrl] = useState<string>(data?.imageUrl || "");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      setPreviewUrl(url);
      onChange({
        ...data,
        imageUrl: url,
        fileName: file.name,
      });
      toast.success("Stage plot image uploaded!");
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Stage Plot Diagram</Label>
        <Card className="p-8 border-dashed border-2 hover:border-primary/50 transition-colors">
          <input
            type="file"
            id="stage-plot-upload"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          
          {previewUrl ? (
            <div className="space-y-4">
              <img
                src={previewUrl}
                alt="Stage plot"
                className="w-full h-auto rounded-lg border"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById("stage-plot-upload")?.click()}
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                Replace Image
              </Button>
            </div>
          ) : (
            <label
              htmlFor="stage-plot-upload"
              className="flex flex-col items-center justify-center cursor-pointer py-8"
            >
              <ImageIcon className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-sm font-medium mb-1">Upload Stage Plot</p>
              <p className="text-xs text-muted-foreground">
                Click to upload an image or diagram
              </p>
            </label>
          )}
        </Card>
      </div>

      <div>
        <Label>Stage Dimensions & Notes</Label>
        <Textarea
          value={data?.notes || ""}
          onChange={(e) => onChange({
            ...data,
            notes: e.target.value,
          })}
          placeholder="Stage dimensions, special requirements, positioning notes..."
          rows={6}
        />
      </div>
    </div>
  );
}
