-- Update gallery_photos column to support captions as JSONB objects
-- This allows storing both url and label for each photo
ALTER TABLE artist_profiles 
ALTER COLUMN gallery_photos TYPE jsonb[] 
USING array(
  SELECT json_build_object('url', photo_url, 'label', '')::jsonb 
  FROM unnest(gallery_photos) AS photo_url
  WHERE photo_url IS NOT NULL AND photo_url != ''
);

-- Update the default value to empty JSONB array
ALTER TABLE artist_profiles 
ALTER COLUMN gallery_photos SET DEFAULT '{}';

-- Clean up any existing data and ensure proper structure
UPDATE artist_profiles 
SET gallery_photos = (
  SELECT COALESCE(array_agg(
    CASE 
      WHEN photo_item::text ~ '^[a-f0-9-]{36}/' THEN 
        json_build_object('url', photo_item::text, 'label', '')::jsonb
      ELSE photo_item::jsonb
    END
  ), '{}')
  FROM unnest(gallery_photos) AS photo_item
  WHERE photo_item IS NOT NULL
)
WHERE gallery_photos IS NOT NULL;