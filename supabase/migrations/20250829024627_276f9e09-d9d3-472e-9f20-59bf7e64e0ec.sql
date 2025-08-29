-- Add publishing status and URL slug to artist profiles
ALTER TABLE public.artist_profiles 
ADD COLUMN is_published boolean DEFAULT false,
ADD COLUMN url_slug text;

-- Create unique index for url_slug to prevent duplicates
CREATE UNIQUE INDEX idx_artist_profiles_url_slug ON public.artist_profiles(url_slug) WHERE url_slug IS NOT NULL;

-- Create function to generate URL slug from artist name
CREATE OR REPLACE FUNCTION public.generate_url_slug(artist_name text)
RETURNS text AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 0;
BEGIN
  -- Convert to lowercase, replace spaces with hyphens, remove special characters
  base_slug := lower(regexp_replace(trim(artist_name), '[^a-zA-Z0-9\s]', '', 'g'));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := trim(base_slug, '-');
  
  -- Ensure slug is not empty
  IF base_slug = '' THEN
    base_slug := 'artist';
  END IF;
  
  final_slug := base_slug;
  
  -- Check for uniqueness and append number if needed
  WHILE EXISTS (SELECT 1 FROM public.artist_profiles WHERE url_slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update existing profiles to have URL slugs
UPDATE public.artist_profiles 
SET url_slug = public.generate_url_slug(artist_name) 
WHERE url_slug IS NULL;

-- Update the public function to support both ID and slug lookups
CREATE OR REPLACE FUNCTION public.get_public_artist_profile(profile_identifier text)
RETURNS TABLE(id uuid, artist_name text, bio text, genre text, social_links jsonb, profile_photo_url text, press_photos text[], hero_photo_url text, show_videos text[], gallery_photos text[], press_quotes jsonb, press_mentions jsonb, streaming_links jsonb, playlists text[], past_shows jsonb, upcoming_shows jsonb, created_at timestamp with time zone, updated_at timestamp with time zone, is_published boolean, url_slug text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
    p.updated_at,
    p.is_published,
    p.url_slug
  FROM public.artist_profiles p
  WHERE (p.id::text = profile_identifier OR p.url_slug = profile_identifier)
    AND p.is_published = true;
$function$;