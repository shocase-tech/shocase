-- Update the public function to ensure it has proper permissions for anonymous access
CREATE OR REPLACE FUNCTION public.get_public_artist_profile(profile_identifier text)
RETURNS TABLE (
  id uuid,
  artist_name text,
  bio text,
  genre text,
  social_links jsonb,
  profile_photo_url text,
  press_photos text[],
  hero_photo_url text,
  show_videos text[],
  gallery_photos text[],
  press_quotes jsonb,
  press_mentions jsonb,
  streaming_links jsonb,
  playlists text[],
  past_shows jsonb,
  upcoming_shows jsonb,
  contact_info jsonb,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  is_published boolean,
  url_slug text
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT 
    p.id,
    p.artist_name,
    p.bio,
    p.genre,
    p.social_links,
    p.profile_photo_url,
    p.press_photos,
    p.hero_photo_url,
    p.show_videos,
    p.gallery_photos,
    p.press_quotes,
    p.press_mentions,
    p.streaming_links,
    p.playlists,
    p.past_shows,
    p.upcoming_shows,
    p.contact_info,
    p.created_at,
    p.updated_at,
    p.is_published,
    p.url_slug
  FROM public.artist_profiles p
  WHERE (p.id::text = profile_identifier OR p.url_slug = profile_identifier)
    AND p.is_published = true;
$$;

-- Grant execute permission to anonymous users
GRANT EXECUTE ON FUNCTION public.get_public_artist_profile(text) TO anon;