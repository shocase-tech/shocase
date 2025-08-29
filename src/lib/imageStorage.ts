import { supabase } from "@/integrations/supabase/client";

export interface ImageUrlOptions {
  isPublic?: boolean;
  expiresIn?: number;
}

export class ImageStorageService {
  private static readonly BUCKET_NAME = 'artist-uploads';
  
  /**
   * Uploads a file to Supabase Storage and returns the storage path
   */
  static async uploadFile(file: File, type: string, userId: string): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${type}/${Date.now()}.${fileExt}`;

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
}