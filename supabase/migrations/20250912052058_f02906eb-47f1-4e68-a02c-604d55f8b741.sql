-- Function to check if profile is published
CREATE OR REPLACE FUNCTION public.is_profile_published_by_user_id(profile_user_id text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.artist_profiles 
    WHERE user_id::text = profile_user_id 
    AND is_published = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Storage policy for anonymous access to published profile images
CREATE POLICY "Anonymous users can view images from published profiles"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'artist-uploads' AND
  public.is_profile_published_by_user_id((storage.foldername(name))[1])
);