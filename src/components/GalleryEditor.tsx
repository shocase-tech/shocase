import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";
import { Save, X, GripVertical, Upload, AlertTriangle } from "lucide-react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ImageStorageService } from "@/lib/imageStorage";

interface GalleryEditorProps {
  profile: any;
  user: User | null;
  onSave: () => void;
  onCancel: () => void;
}

interface SortablePhotoProps {
  photo: { url: string; label?: string };
  index: number;
  onDelete: (index: number) => void;
}

function SortablePhoto({ photo, index, onDelete }: SortablePhotoProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `photo-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group bg-white/5 rounded-lg overflow-hidden"
    >
      <img
        src={typeof photo === 'string' ? photo : photo.url}
        alt={typeof photo === 'string' ? `Gallery ${index + 1}` : photo.label || `Gallery ${index + 1}`}
        className="w-full h-32 object-cover"
      />
      
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="bg-white/20 border-white/30 text-white hover:bg-white/30"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-4 h-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(index)}
          className="bg-red-500/20 border-red-400/30 text-red-200 hover:bg-red-500/30"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="absolute top-2 left-2">
        <Badge variant="secondary" className="text-xs">
          {index + 1}
        </Badge>
      </div>
    </div>
  );
}

export default function GalleryEditor({ profile, user, onSave, onCancel }: GalleryEditorProps) {
  const [photos, setPhotos] = useState<{ url: string; label?: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // File validation constants
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const MAX_PHOTOS = 12;

  useEffect(() => {
    if (profile?.gallery_photos) {
      setPhotos(profile.gallery_photos);
    }
  }, [profile]);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setPhotos((items) => {
        const activeIndex = items.findIndex((_, index) => `photo-${index}` === active.id);
        const overIndex = items.findIndex((_, index) => `photo-${index}` === over.id);

        return arrayMove(items, activeIndex, overIndex);
      });
    }
  };

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return `File size too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Invalid file type. Please upload JPG, PNG, or WebP images only.';
    }

    if (photos.length >= MAX_PHOTOS) {
      return `Maximum ${MAX_PHOTOS} photos allowed in gallery.`;
    }

    return null;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploadError(null);
    
    const validationError = validateFile(file);
    if (validationError) {
      setUploadError(validationError);
      toast({
        title: "Upload failed",
        description: validationError,
        variant: "destructive",
      });
      e.target.value = "";
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const storagePath = await ImageStorageService.uploadFile(file, 'gallery', user.id);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      const newPhoto = { url: storagePath, label: "" };
      setPhotos([...photos, newPhoto]);

      toast({
        title: "Photo uploaded",
        description: "Photo uploaded successfully to gallery.",
      });

      setTimeout(() => {
        setUploadProgress(0);
      }, 1000);

    } catch (error: any) {
      const errorMessage = error.message || "Failed to upload photo. Please try again.";
      setUploadError(errorMessage);
      toast({
        title: "Upload failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDeletePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const { error } = await supabase
        .from('artist_profiles')
        .update({ gallery_photos: photos as any })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Gallery updated successfully.",
      });

      onSave();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const progressPercentage = (photos.length / MAX_PHOTOS) * 100;

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="pt-6 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Gallery Photos</h3>
          <Badge variant="outline">
            {photos.length} / {MAX_PHOTOS}
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Gallery Progress</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* File Upload Section */}
        {photos.length < MAX_PHOTOS && (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-primary/30 bg-primary/5 p-6 text-center rounded-lg">
              <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">Upload gallery photos</p>
              <p className="text-xs text-muted-foreground mb-4">
                Max {MAX_FILE_SIZE / 1024 / 1024}MB • JPG, PNG, WebP only • Up to {MAX_PHOTOS} photos
              </p>
              
              <Label htmlFor="gallery-upload" className="cursor-pointer">
                <input
                  id="gallery-upload"
                  type="file"
                  accept={ALLOWED_TYPES.join(',')}
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={uploading}
                />
                <Button className="mt-2" disabled={uploading}>
                  {uploading ? "Uploading..." : "Choose Files"}
                </Button>
              </Label>
            </div>

            {/* Upload Progress */}
            {uploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading photo...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            {/* Upload Error */}
            {uploadError && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <p className="text-sm text-red-600">{uploadError}</p>
              </div>
            )}
          </div>
        )}

        {/* Photos Grid */}
        {photos.length > 0 && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={photos.map((_, index) => `photo-${index}`)}
              strategy={verticalListSortingStrategy}
            >
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {photos.map((photo, index) => (
                  <SortablePhoto
                    key={`photo-${index}`}
                    photo={photo}
                    index={index}
                    onDelete={handleDeletePhoto}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {photos.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Upload className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No photos in gallery yet. Upload your first photo above!</p>
          </div>
        )}

        <div className="flex justify-between pt-4 border-t border-white/10">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? "Saving..." : "Save Gallery"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}