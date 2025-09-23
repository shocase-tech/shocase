-- Create helper function to extract user ID from folder paths (both old UUID and new artist-based formats)
CREATE OR REPLACE FUNCTION public.extract_user_id_from_folder_path(folder_path text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  folder_name text;
  uuid_pattern text := '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
BEGIN
  -- Get the first part of the path (folder name)
  folder_name := (string_to_array(folder_path, '/'))[1];
  
  -- If it matches UUID pattern (legacy format), return as-is
  IF folder_name ~ uuid_pattern THEN
    RETURN folder_name;
  END IF;
  
  -- If it contains underscore (new format), extract the last part after underscore
  IF position('_' in folder_name) > 0 THEN
    -- Find the user ID from artist_profiles using the short ID
    DECLARE
      short_id text;
      full_user_id text;
    BEGIN
      -- Extract the part after the last underscore (should be 8-char short ID)
      short_id := substring(folder_name from '.*_(.{8})$');
      
      -- Look up the full user ID from artist_profiles
      SELECT user_id::text INTO full_user_id 
      FROM public.artist_profiles 
      WHERE user_id::text LIKE short_id || '%'
      LIMIT 1;
      
      IF full_user_id IS NOT NULL THEN
        RETURN full_user_id;
      END IF;
    END;
  END IF;
  
  -- If nothing matches, return the folder name as-is (shouldn't happen)
  RETURN folder_name;
END;
$$;

-- Drop existing storage policies
DROP POLICY IF EXISTS "Users can upload their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own uploads" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;
DROP POLICY IF EXISTS "Anonymous users can view images from published profiles" ON storage.objects;

-- Create updated storage policies that work with both old and new folder structures
CREATE POLICY "Users can upload their own files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'artist-uploads' 
  AND auth.uid()::text = public.extract_user_id_from_folder_path(name)
);

CREATE POLICY "Users can view their own uploads" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'artist-uploads' 
  AND auth.uid()::text = public.extract_user_id_from_folder_path(name)
);

CREATE POLICY "Users can update their own files" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'artist-uploads' 
  AND auth.uid()::text = public.extract_user_id_from_folder_path(name)
);

CREATE POLICY "Users can delete their own files" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'artist-uploads' 
  AND auth.uid()::text = public.extract_user_id_from_folder_path(name)
);

CREATE POLICY "Anonymous users can view images from published profiles" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'artist-uploads' 
  AND public.is_profile_published_by_user_id(public.extract_user_id_from_folder_path(name))
);