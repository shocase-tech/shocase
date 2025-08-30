import { useState, useEffect } from "react";
import { ImageStorageService } from "@/lib/imageStorage";

interface PrivateImageProps {
  storagePath: string;
  alt: string;
  className?: string;
  fallback?: string;
}

export default function PrivateImage({ storagePath, alt, className, fallback }: PrivateImageProps) {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
  const loadImage = async () => {
      console.log("PrivateImage loading image with storagePath:", storagePath);
      
      if (!storagePath) {
        console.log("No storagePath provided");
        setLoading(false);
        setError(true);
        return;
      }

      // If it's already a URL (for backwards compatibility), use it directly
      if (!ImageStorageService.isStoragePath(storagePath)) {
        console.log("Using direct URL:", storagePath);
        setImageUrl(storagePath);
        setLoading(false);
        return;
      }

      try {
        console.log("Getting signed URL for storage path:", storagePath);
        const signedUrl = await ImageStorageService.getSignedUrl(storagePath);
        console.log("Received signed URL:", signedUrl);
        setImageUrl(signedUrl);
        setError(!signedUrl);
      } catch (err) {
        console.error("Error loading image:", err);
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
          <span className="text-gray-400 text-sm">No image</span>
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