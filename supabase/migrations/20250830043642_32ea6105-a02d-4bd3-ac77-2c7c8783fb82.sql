-- Update gallery_photos column to support objects with url and label
-- Drop the existing column and recreate it with JSONB type
ALTER TABLE public.artist_profiles 
ALTER COLUMN gallery_photos TYPE JSONB USING gallery_photos::JSONB;

-- Update the existing data to the new format (convert strings to objects)
UPDATE public.artist_profiles 
SET gallery_photos = (
  SELECT jsonb_agg(
    jsonb_build_object('url', photo_url, 'label', '')
  )
  FROM (
    SELECT jsonb_array_elements_text(gallery_photos) as photo_url
  ) urls
)
WHERE gallery_photos IS NOT NULL;