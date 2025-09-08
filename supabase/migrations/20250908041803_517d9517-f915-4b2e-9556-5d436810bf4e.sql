-- Step 1: Add a temporary column for the new structure
ALTER TABLE artist_profiles 
ADD COLUMN gallery_photos_new jsonb[] DEFAULT '{}';

-- Step 2: Migrate existing data to new structure  
UPDATE artist_profiles 
SET gallery_photos_new = array(
  SELECT json_build_object('url', photo_url, 'label', '')::jsonb
  FROM unnest(gallery_photos) AS photo_url
  WHERE photo_url IS NOT NULL AND photo_url != ''
)
WHERE gallery_photos IS NOT NULL AND array_length(gallery_photos, 1) > 0;

-- Step 3: Drop the old column and rename the new one
ALTER TABLE artist_profiles DROP COLUMN gallery_photos;
ALTER TABLE artist_profiles RENAME COLUMN gallery_photos_new TO gallery_photos;