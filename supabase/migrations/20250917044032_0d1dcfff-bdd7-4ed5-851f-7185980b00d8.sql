-- Rename spotify_track_url column to featured_track_url to support multiple streaming services
ALTER TABLE public.artist_profiles 
RENAME COLUMN spotify_track_url TO featured_track_url;