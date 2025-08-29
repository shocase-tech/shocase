-- Add RLS policy to allow public viewing of artist profiles
CREATE POLICY "Artist profiles are publicly viewable" 
ON public.artist_profiles 
FOR SELECT 
USING (true);