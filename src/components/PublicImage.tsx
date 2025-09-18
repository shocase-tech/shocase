import { useState, useEffect } from "react";
import { ImageStorageService } from "@/lib/imageStorage";

// URL cache with 30-minute expiration
interface CachedUrl {
  url: string;
  timestamp: number;
}

const publicUrlCache = new Map<string, CachedUrl>();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

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
        // Check cache first
        const cached = publicUrlCache.get(storagePath);
        const now = Date.now();
        
        if (cached && (now - cached.timestamp) < CACHE_DURATION) {
          console.log("Using cached public URL for:", storagePath);
          setImageUrl(cached.url);
          setError(!cached.url);
        } else {
          console.log("Generating new public URL for:", storagePath);
          // For published press kits, use long-lived "public" URLs (24-hour signed URLs)
          const publicUrl = await ImageStorageService.getPublicUrl(storagePath);
          
          // Cache the new URL
          if (publicUrl) {
            publicUrlCache.set(storagePath, {
              url: publicUrl,
              timestamp: now
            });
          }
          
          setImageUrl(publicUrl);
          setError(!publicUrl);
        }
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