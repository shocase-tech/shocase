-- Clean up gallery_photos with nested object format for text array
-- First, let's see what we're dealing with and fix the data
UPDATE artist_profiles 
SET gallery_photos = (
  SELECT array_agg(
    CASE 
      -- If the text looks like JSON with nested url property, extract it
      WHEN photo::text LIKE '{"url":%' THEN 
        COALESCE(
          -- Try to parse as JSON and extract url
          (photo::json->>'url')::text,
          photo::text
        )
      ELSE photo::text
    END
  )
  FROM unnest(gallery_photos) AS photo
  WHERE photo IS NOT NULL
)
WHERE gallery_photos IS NOT NULL 
AND array_length(gallery_photos, 1) > 0
AND EXISTS (
  SELECT 1 FROM unnest(gallery_photos) AS photo 
  WHERE photo::text LIKE '{"url":%'
);