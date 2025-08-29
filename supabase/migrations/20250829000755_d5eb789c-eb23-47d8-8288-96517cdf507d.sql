-- Fix search path security issues for existing functions
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$;

-- Fix search path for the public artist profile function
CREATE OR REPLACE FUNCTION public.get_public_artist_profile(profile_id uuid)
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
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
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
    p.created_at,
    p.updated_at
  FROM public.artist_profiles p
  WHERE p.id = profile_id;
$$;