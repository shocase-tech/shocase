import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { AutoSaveInput } from "@/components/ui/auto-save-input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";
import { Save, X, GripVertical, Upload, AlertTriangle, Edit, Loader2 } from "lucide-react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ImageStorageService } from "@/lib/imageStorage";
import PrivateImage from "@/components/PrivateImage";
import { useClickOutside } from "@/hooks/useClickOutside";

interface GalleryEditorProps {
  profile: any;
  user: User | null;
  onSave: (updatedData?: any) => void;
  onCancel: () => void;
}

interface SortablePhotoProps {
  photo: { url: string; label?: string };
  index: number;
  onDelete: (index: number) => void;
  onUpdateCaption: (index: number, caption: string) => void;
}

function SortablePhoto({ photo, index, onDelete, onUpdateCaption }: SortablePhotoProps) {
  const [isEditingCaption, setIsEditingCaption] = useState(false);
  const [captionValue, setCaptionValue] = useState(photo.label || "");

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

  const handleSaveCaption = () => {
    onUpdateCaption(index, captionValue);
    setIsEditingCaption(false);
  };

  const handleCancelCaption = () => {
    setCaptionValue(photo.label || "");
    setIsEditingCaption(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group bg-white/5 rounded-lg overflow-hidden border border-white/10"
    >
      {/* Image */}
      <PrivateImage
        storagePath={photo.url}
        alt={photo.label || `Gallery ${index + 1}`}
        className="w-full h-32 object-cover"
      />
      
      {/* Hover Controls */}
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
          onClick={() => setIsEditingCaption(true)}
          className="bg-blue-500/20 border-blue-400/30 text-blue-200 hover:bg-blue-500/30"
        >
          <Edit className="w-4 h-4" />
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
      
      {/* Photo Index Badge */}
      <div className="absolute top-2 left-2">
        <Badge variant="secondary" className="text-xs">
          {index + 1}
        </Badge>
      </div>

      {/* Caption Section */}
      <div className="p-3 bg-white/5 border-t border-white/10">
        {isEditingCaption ? (
          <div className="space-y-3">
            <AutoSaveInput
              value={captionValue}
              onChange={(e) => setCaptionValue(e.target.value)}
              onAutoSave={async (value) => {
                onUpdateCaption(index, value);
                setIsEditingCaption(false);
              }}
              placeholder="Press Enter to save caption"
              className="text-sm h-9 bg-background border-input focus:ring-2 focus:ring-ring focus:border-transparent"
              maxLength={100}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  handleCancelCaption();
                }
              }}
            />
            <p className="text-xs text-muted-foreground">
              Press Enter to save • Escape to cancel
            </p>
          </div>
        ) : (
          <div 
            className="min-h-[2rem] flex items-center cursor-pointer hover:bg-white/5 rounded p-1 transition-colors"
            onClick={() => setIsEditingCaption(true)}
          >
            <p 
              className="text-sm text-muted-foreground truncate"
              title={photo.label || "Click to add caption"}
            >
              {photo.label || "Click to add caption"}
            </p>
          </div>
        )}
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
  const [isSaving, setIsSaving] = useState(false);
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
      console.log("GalleryEditor: Raw gallery_photos from profile:", profile.gallery_photos);
      
      // Normalize gallery photos - extract actual storage paths from nested objects
      const photoObjects = profile.gallery_photos.map((item: any, index: number) => {
        console.log(`Processing gallery item ${index}:`, item);
        
        // Handle deeply nested objects (the bug case)
        if (typeof item === 'object' && item?.url) {
          let url = item.url;
          // If url is still an object, keep extracting
          while (typeof url === 'object' && url?.url) {
            url = url.url;
          }
          console.log(`Extracted URL from nested object:`, url);
          return { url: url || "", label: item.label || "" };
        }
        
        // Handle string URLs (legacy format)
        if (typeof item === 'string') {
          console.log(`Using string URL:`, item);
          return { url: item, label: "" };
        }
        
        // Fallback for invalid data
        console.warn(`Invalid gallery item, skipping:`, item);
        return null;
      }).filter(photo => photo && photo.url); // Remove invalid entries
      
      console.log("GalleryEditor: Normalized photo objects:", photoObjects);
      setPhotos(photoObjects);
    }
  }, [profile]);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setPhotos((items) => {
        const activeIndex = items.findIndex((_, index) => `photo-${index}` === active.id);
        const overIndex = items.findIndex((_, index) => `photo-${index}` === over.id);

        const newOrder = arrayMove(items, activeIndex, overIndex);
        console.log("Drag ended, new order:", newOrder);
        
        // Auto-save the new order immediately to database
        setTimeout(() => {
          handleSave();
        }, 100);
        
        return newOrder;
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

  const handleUpdateCaption = (index: number, caption: string) => {
    const updatedPhotos = [...photos];
    updatedPhotos[index] = { ...updatedPhotos[index], label: caption };
    setPhotos(updatedPhotos);
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      console.log("GalleryEditor saving photos:", photos);

      // Store as objects with both url and label to preserve order and captions
      const photoData = photos.map(photo => ({
        url: photo.url,
        label: photo.label || ""
      }));

      console.log("GalleryEditor saving photo data:", photoData);

      const { error } = await supabase
        .from('artist_profiles')
        .update({ gallery_photos: photoData as any })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Gallery updated successfully.",
      });

      // Update parent component with new data
      onSave({ gallery_photos: photoData });
    } catch (error: any) {
      console.error("Gallery save error:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      throw error; // Re-throw for handleAutoSaveAndClose error handling
    } finally {
      setLoading(false);
    }
  };

  // Auto-save and close handler
  const handleAutoSaveAndClose = useCallback(async () => {
    console.log("🔍 GalleryEditor: Click-outside detected, handleAutoSaveAndClose called");
    if (isSaving || loading) return;
    
    console.log("🔍 GalleryEditor: Current photos data before save:", photos);
    
    try {
      setIsSaving(true);
      console.log("🔍 GalleryEditor: Calling handleSave()");
      await handleSave();
      console.log("🔍 GalleryEditor: handleSave() completed, closing editor");
      onCancel();
    } catch (error) {
      console.error("🔍 GalleryEditor: handleSave() failed:", error);
      // Error already handled in handleSave
    } finally {
      setIsSaving(false);
    }
  }, [isSaving, loading, onCancel, photos]);
  
  // Click outside detection
  const editorRef = useClickOutside<HTMLDivElement>(handleAutoSaveAndClose);

  const progressPercentage = (photos.length / MAX_PHOTOS) * 100;

  return (
    <Card ref={editorRef} className="border-primary/20 bg-primary/5">
      <CardContent className="pt-6 space-y-6">
        {isSaving && (
          <div className="flex items-center justify-center gap-2 p-2 bg-muted/30 rounded-lg">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Saving gallery...</span>
          </div>
        )}
        
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
              
              <input
                id="gallery-upload"
                type="file"
                accept={ALLOWED_TYPES.join(',')}
                onChange={handleFileSelect}
                className="hidden"
                disabled={uploading}
              />
              
              <Button 
                className="mt-2" 
                disabled={uploading}
                onClick={() => document.getElementById('gallery-upload')?.click()}
              >
                {uploading ? "Uploading..." : "Choose Files"}
              </Button>
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
                    onUpdateCaption={handleUpdateCaption}
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
      </CardContent>
    </Card>
  );
}