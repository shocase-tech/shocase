import { supabase } from "@/integrations/supabase/client";

export interface ImageUrlOptions {
  isPublic?: boolean;
  expiresIn?: number;
}

export class ImageStorageService {
  private static readonly BUCKET_NAME = 'artist-uploads';
  private static readonly SUPABASE_URL = "https://kaetsegwzfvkermjokmh.supabase.co";
  
  /**
   * Uploads a file using simple UUID folder structure
   */
  static async uploadFile(file: File, type: string, userId: string): Promise<string> {
    if (!file || !type || !userId) {
      throw new Error('Missing required parameters for file upload');
    }

    const fileExt = file.name.split('.').pop();
    if (!fileExt) {
      throw new Error('File must have an extension');
    }

    // Simple: userId/type/timestamp.ext
    const fileName = `${userId}/${type}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from(this.BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // Return storage path
    return fileName;
  }

  /**
   * Generate signed URL for viewing
   */
  static async getSignedUrl(storagePath: string, expiresIn: number = 3600): Promise<string> {
    if (!storagePath) {
      console.log('No storage path provided');
      return '';
    }
    
    if (storagePath.startsWith('http')) {
      console.log('Storage path is already a URL:', storagePath);
      return storagePath;
    }

    console.log('Creating signed URL for storage path:', storagePath);

    try {
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .createSignedUrl(storagePath, expiresIn);

      if (error) {
        console.error('Error creating signed URL:', error);
        return '';
      }

      let signedUrl = data?.signedUrl || '';
      
      if (!signedUrl) {
        console.error('No signed URL returned from Supabase');
        return '';
      }
      
      if (signedUrl.startsWith('/')) {
        signedUrl = `${this.SUPABASE_URL}/storage/v1${signedUrl}`;
      }

      console.log('Generated signed URL:', signedUrl);
      return signedUrl;
    } catch (err) {
      console.error('Exception creating signed URL:', err);
      return '';
    }
  }

  /**
   * Generate multiple signed URLs
   */
  static async getSignedUrls(storagePaths: string[], expiresIn: number = 3600): Promise<string[]> {
    if (!storagePaths || storagePaths.length === 0) return [];
    
    const results = await Promise.allSettled(
      storagePaths.map(path => this.getSignedUrl(path, expiresIn))
    );
    
    return results
      .map(result => result.status === 'fulfilled' ? result.value : '')
      .filter(url => url !== '');
  }

  /**
   * Generate public URL for published content (uses long-lived signed URLs)
   */
  static async getPublicUrl(storagePath: string): Promise<string> {
    if (!storagePath) return '';
    
    // For "public" access, we'll use 24-hour signed URLs
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
   * Check if a path is a storage path (not a URL)
   */
  static isStoragePath(pathOrUrl: string): boolean {
    return !pathOrUrl.startsWith('http') && !pathOrUrl.startsWith('blob:');
  }

  /**
   * Extract storage path from URL if needed
   */
  static extractStoragePath(urlOrPath: string): string {
    if (!urlOrPath) return '';
    
    if (!urlOrPath.startsWith('http')) {
      return urlOrPath;
    }

    try {
      const url = new URL(urlOrPath);
      const pathParts = url.pathname.split('/');
      
      const signIndex = pathParts.indexOf('sign');
      if (signIndex > -1 && pathParts[signIndex + 1]) {
        return decodeURIComponent(pathParts[signIndex + 1]);
      }
    } catch (error) {
      console.warn('Could not extract storage path from URL:', urlOrPath);
    }

    return urlOrPath;
  }
}