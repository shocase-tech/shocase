import { useState, useEffect } from "react";
import { ImageStorageService } from "@/lib/imageStorage";

interface PublicImageProps {
  storagePath: string;
  alt: string;
  className?: string;
  fallback?: string;
}

export default function PublicImage({ storagePath, alt, className, fallback }: PublicImageProps) {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadImage = async () => {
      if (!storagePath) {
        setLoading(false);
        setError(true);
        return;
      }

      // If it's already a URL (for backwards compatibility), use it directly
      if (!ImageStorageService.isStoragePath(storagePath)) {
        setImageUrl(storagePath);
        setLoading(false);
        return;
      }

      try {
        // For published press kits, use long-lived "public" URLs (24-hour signed URLs)
        const publicUrl = await ImageStorageService.getPublicUrl(storagePath);
        setImageUrl(publicUrl);
        setError(!publicUrl);
      } catch (err) {
        console.error("Error loading public image:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadImage();
  }, [storagePath]);

  if (loading) {
    return (
      <div className={`bg-gray-200 animate-pulse ${className}`}>
        <div className="w-full h-full bg-gray-300 rounded"></div>
      </div>
    );
  }

  if (error || !imageUrl) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center ${className}`}>
        {fallback || (
          <span className="text-gray-400 text-sm">Image unavailable</span>
        )}
      </div>
    );
  }

  return (
    <img 
      src={imageUrl} 
      alt={alt} 
      className={className}
      onError={() => setError(true)}
    />
  );
}