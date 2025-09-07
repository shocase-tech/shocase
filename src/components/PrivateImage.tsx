import { useState, useEffect } from "react";
import { ImageStorageService } from "@/lib/imageStorage";

interface PrivateImageProps {
  storagePath: string | any; // Allow objects for nested path format
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

      // Extract actual storage path from nested objects
      let actualPath = storagePath;
      
      // If storagePath is an object, extract the URL
      if (typeof storagePath === 'object' && storagePath !== null) {
        if (typeof (storagePath as any).url === 'string') {
          actualPath = (storagePath as any).url;
        } else if (typeof (storagePath as any).url === 'object' && (storagePath as any).url.url) {
          actualPath = (storagePath as any).url.url; // Handle double nesting
        } else {
          console.error("Invalid storagePath object:", storagePath);
          setError(true);
          setLoading(false);
          return;
        }
      }

      // If it's already a URL (for backwards compatibility), use it directly
      if (!ImageStorageService.isStoragePath(actualPath)) {
        console.log("Using direct URL:", actualPath);
        setImageUrl(actualPath);
        setLoading(false);
        return;
      }

      try {
        console.log("Getting signed URL for storage path:", actualPath);
        const signedUrl = await ImageStorageService.getSignedUrl(actualPath);
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