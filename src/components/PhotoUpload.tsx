import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, X, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import DragDropSection from "@/components/DragDropSection";
import PrivateImage from "@/components/PrivateImage";

interface PhotoItem {
  url: string;
  label?: string;
}

interface PhotoUploadProps {
  title: string;
  photos: PhotoItem[];
  onUpload: (file: File) => Promise<string>;
  onUpdate: (photos: PhotoItem[]) => void;
  maxPhotos?: number;
  maxSizeText?: string;
  accept?: string;
}

export default function PhotoUpload({ 
  title, 
  photos, 
  onUpload, 
  onUpdate, 
  maxPhotos = 10,
  maxSizeText = "Max 5MB per photo",
  accept = "image/*"
}: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const { toast } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (photos.length >= maxPhotos) {
      toast({
        title: "Upload limit reached",
        description: `Maximum ${maxPhotos} photos allowed`,
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const url = await onUpload(file);
      const newPhoto: PhotoItem = { url, label: "" };
      onUpdate([...photos, newPhoto]);
      toast({
        title: "Photo uploaded",
        description: "Photo uploaded successfully",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload photo",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      // Reset the input
      e.target.value = "";
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    onUpdate(newPhotos);
  };

  const updateLabel = (index: number) => {
    const newPhotos = [...photos];
    newPhotos[index] = { ...newPhotos[index], label: editLabel };
    onUpdate(newPhotos);
    setEditingIndex(null);
    setEditLabel("");
  };

  const startEdit = (index: number) => {
    setEditingIndex(index);
    setEditLabel(photos[index].label || "");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="text-sm text-muted-foreground">
          {photos.length}/{maxPhotos} photos • {maxSizeText}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((photo, index) => (
          <DragDropSection
            key={index}
            id={`photo-${index}`}
            onDelete={() => removePhoto(index)}
            isDraggable={false}
          >
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="relative group">
                  <PrivateImage
                    storagePath={photo.url}
                    alt={photo.label || `Photo ${index + 1}`}
                    className="w-full h-32 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => startEdit(index)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="p-2">
                  {editingIndex === index ? (
                    <div className="space-y-2">
                      <Input
                        value={editLabel}
                        onChange={(e) => setEditLabel(e.target.value)}
                        placeholder="Add caption..."
                        className="text-xs"
                      />
                      <div className="flex gap-1">
                        <Button size="sm" onClick={() => updateLabel(index)}>
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingIndex(null)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground truncate">
                      {photo.label || "No caption"}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </DragDropSection>
        ))}

        {photos.length < maxPhotos && (
          <Card className="border-dashed">
            <CardContent className="p-0">
              <Label className="cursor-pointer">
                <input
                  type="file"
                  accept={accept}
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={uploading}
                />
                <div className="h-32 flex flex-col items-center justify-center gap-2 hover:bg-accent/50 transition-colors">
                  <Upload className="w-6 h-6 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {uploading ? "Uploading..." : "Add Photo"}
                  </span>
                </div>
              </Label>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}