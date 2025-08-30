-- Add RLS policy to allow anonymous users to view published artist profiles

-- Create a policy that allows anonymous users to SELECT published profiles
CREATE POLICY "Anonymous users can view published profiles" 
ON public.artist_profiles 
FOR SELECT 
USING (is_published = true);

-- Make sure the existing get_public_artist_profile function is accessible to anon users
GRANT EXECUTE ON FUNCTION public.get_public_artist_profile(text) TO anon;