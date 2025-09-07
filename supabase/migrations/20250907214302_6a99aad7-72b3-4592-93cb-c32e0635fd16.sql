-- Clean up gallery_photos with nested object format
UPDATE artist_profiles 
SET gallery_photos = (
  SELECT jsonb_agg(
    CASE 
      WHEN jsonb_typeof(photo) = 'object' AND photo ? 'url' THEN 
        CASE 
          WHEN jsonb_typeof(photo->'url') = 'string' THEN photo->'url'
          WHEN jsonb_typeof(photo->'url') = 'object' AND photo->'url' ? 'url' THEN photo->'url'->'url'
          ELSE photo
        END
      ELSE photo
    END
  )
  FROM jsonb_array_elements(gallery_photos) AS photo
)
WHERE gallery_photos IS NOT NULL 
AND jsonb_typeof(gallery_photos) = 'array'
AND EXISTS (
  SELECT 1 FROM jsonb_array_elements(gallery_photos) AS photo 
  WHERE jsonb_typeof(photo) = 'object' AND photo ? 'url'
);