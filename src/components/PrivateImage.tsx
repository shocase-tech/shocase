import { useState, useEffect } from "react";
import { ImageStorageService } from "@/lib/imageStorage";

// URL cache with 30-minute expiration
interface CachedUrl {
  url: string;
  timestamp: number;
}

const urlCache = new Map<string, CachedUrl>();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

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
      
      if (typeof storagePath === 'object' && storagePath !== null) {
        if (typeof storagePath.url === 'string') {
          actualPath = storagePath.url;
        } else if (typeof storagePath.url === 'object' && storagePath.url?.url) {
          actualPath = storagePath.url.url; // Handle double nesting
        } else {
          console.error("Invalid storagePath object:", storagePath);
          setError(true);
          setLoading(false);
          return;
        }
      }

      // Continue with normal image loading logic...
      if (!ImageStorageService.isStoragePath(actualPath)) {
        console.log("Using direct URL:", actualPath);
        setImageUrl(actualPath);
        setLoading(false);
        return;
      }

      try {
        // Check cache first
        const cached = urlCache.get(actualPath);
        const now = Date.now();
        
        if (cached && (now - cached.timestamp) < CACHE_DURATION) {
          console.log("Using cached URL for:", actualPath);
          setImageUrl(cached.url);
          setError(!cached.url);
        } else {
          console.log("Generating new URL for:", actualPath);
          const signedUrl = await ImageStorageService.getSignedUrl(actualPath);
          console.log("Received signed URL:", signedUrl);
          
          // Cache the new URL
          if (signedUrl) {
            urlCache.set(actualPath, {
              url: signedUrl,
              timestamp: now
            });
          }
          
          setImageUrl(signedUrl);
          setError(!signedUrl);
        }
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