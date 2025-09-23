import { supabase } from "@/integrations/supabase/client";

export interface ImageUrlOptions {
  isPublic?: boolean;
  expiresIn?: number;
}

export class ImageStorageService {
  private static readonly BUCKET_NAME = 'artist-uploads';
  
  /**
   * Sanitize artist name for filesystem use
   */
  private static sanitizeArtistName(artistName: string): string {
    return artistName
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '') // Remove special characters
      .replace(/\s+/g, '_') // Replace spaces with underscores
      .trim();
  }

  /**
   * Get artist folder name for storage path
   */
  private static async getArtistFolderName(userId: string): Promise<string> {
    const shortUserId = userId.substring(0, 8);
    
    try {
      const { data: profile } = await supabase
        .from('artist_profiles')
        .select('artist_name')
        .eq('user_id', userId)
        .single();

      if (profile?.artist_name) {
        const sanitizedName = this.sanitizeArtistName(profile.artist_name);
        return `${sanitizedName}_${shortUserId}`;
      }
    } catch (error) {
      console.warn('Could not fetch artist name:', error);
    }

    return `unnamed_artist_${shortUserId}`;
  }
  
  /**
   * Uploads a file to Supabase Storage and returns the storage path
   */
  static async uploadFile(file: File, type: string, userId: string): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const artistFolder = await this.getArtistFolderName(userId);
    const fileName = `${artistFolder}/${type}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from(this.BUCKET_NAME)
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    // Return the storage path, not a URL
    return fileName;
  }

  /**
   * Generate a signed URL for private viewing (dashboard)
   */
  static async getSignedUrl(storagePath: string, expiresIn: number = 3600): Promise<string> {
    if (!storagePath) return '';
    
    const { data, error } = await supabase.storage
      .from(this.BUCKET_NAME)
      .createSignedUrl(storagePath, expiresIn);

    if (error) {
      console.error('Error creating signed URL:', error);
      return '';
    }

    return data?.signedUrl || '';
  }

  /**
   * Generate multiple signed URLs at once
   */
  static async getSignedUrls(storagePaths: string[], expiresIn: number = 3600): Promise<string[]> {
    if (!storagePaths || storagePaths.length === 0) return [];
    
    const urls = await Promise.all(
      storagePaths.map(path => this.getSignedUrl(path, expiresIn))
    );
    
    return urls.filter(url => url !== '');
  }

  /**
   * Generate public URL for published content
   * For published press kits, we'll create long-lived signed URLs (24 hours)
   */
  static async getPublicUrl(storagePath: string): Promise<string> {
    if (!storagePath) return '';
    
    // For "public" access on published press kits, we'll use 24-hour signed URLs
    // This gives us control while appearing public to end users
    return this.getSignedUrl(storagePath, 86400); // 24 hours
  }

  /**
   * Generate multiple public URLs at once
   */
  static async getPublicUrls(storagePaths: string[]): Promise<string[]> {
    if (!storagePaths || storagePaths.length === 0) return [];
    
    const urls = await Promise.all(
      storagePaths.map(path => this.getPublicUrl(path))
    );
    
    return urls.filter(url => url !== '');
  }

  /**
   * Delete a file from storage
   */
  static async deleteFile(storagePath: string): Promise<void> {
    if (!storagePath) return;
    
    const { error } = await supabase.storage
      .from(this.BUCKET_NAME)
      .remove([storagePath]);

    if (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  /**
   * Check if a path is a storage path or already a URL
   */
  static isStoragePath(pathOrUrl: string): boolean {
    return !pathOrUrl.startsWith('http') && !pathOrUrl.startsWith('blob:');
  }

  /**
   * Extract storage path from a signed URL (if needed)
   */
  static extractStoragePath(url: string): string {
    if (this.isStoragePath(url)) return url;
    
    // If it's a signed URL, we can't easily extract the path
    // This method is mainly for migration purposes
    return url;
  }

  /**
   * Display folder name for UI - handles both new artist-based and legacy UUID folders
   */
  static async displayFolderName(folderPath: string): Promise<string> {
    if (!folderPath) return '';

    // Extract the first part of the path (folder name)
    const pathParts = folderPath.split('/');
    const folderName = pathParts[0];

    // Check if it's already in the new format (contains underscore and shorter ID)
    if (folderName.includes('_') && folderName.split('_').pop()?.length === 8) {
      const parts = folderName.split('_');
      const shortUserId = parts.pop();
      const artistName = parts.join(' ').replace(/_/g, ' ');
      
      if (artistName === 'unnamed artist') {
        return `Unnamed Artist (${shortUserId})`;
      }
      
      // Capitalize first letter of each word
      const displayName = artistName
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      return `${displayName} (${shortUserId})`;
    }

    // Check if it's a UUID pattern (legacy format)
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidPattern.test(folderName)) {
      const shortUserId = folderName.substring(0, 8);
      
      try {
        // Try to find artist by user_id
        const { data: profile } = await supabase
          .from('artist_profiles')
          .select('artist_name')
          .eq('user_id', folderName)
          .single();

        if (profile?.artist_name) {
          return `${profile.artist_name} (${shortUserId})`;
        }
      } catch (error) {
        console.warn('Could not fetch artist for legacy folder:', error);
      }
      
      // If no artist found, it might be a deleted account
      return `[DELETED] (${shortUserId})`;
    }

    // If it doesn't match any pattern, return as-is
    return folderName;
  }
}