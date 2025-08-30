-- First, let's see the current structure
SELECT column_name, data_type, udt_name FROM information_schema.columns 
WHERE table_name = 'artist_profiles' AND column_name = 'gallery_photos';