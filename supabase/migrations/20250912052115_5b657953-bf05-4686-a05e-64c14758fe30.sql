-- Fix function security by setting search_path
CREATE OR REPLACE FUNCTION public.is_profile_published_by_user_id(profile_user_id text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.artist_profiles 
    WHERE user_id::text = profile_user_id 
    AND is_published = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;