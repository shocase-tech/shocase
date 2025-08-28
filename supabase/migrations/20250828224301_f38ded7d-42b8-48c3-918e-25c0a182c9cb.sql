-- Extend artist_profiles table with press kit fields
ALTER TABLE public.artist_profiles ADD COLUMN hero_photo_url TEXT;
ALTER TABLE public.artist_profiles ADD COLUMN show_videos TEXT[] DEFAULT '{}';
ALTER TABLE public.artist_profiles ADD COLUMN gallery_photos TEXT[] DEFAULT '{}';
ALTER TABLE public.artist_profiles ADD COLUMN press_quotes JSONB DEFAULT '[]';
ALTER TABLE public.artist_profiles ADD COLUMN press_mentions JSONB DEFAULT '[]';
ALTER TABLE public.artist_profiles ADD COLUMN streaming_links JSONB DEFAULT '{}';
ALTER TABLE public.artist_profiles ADD COLUMN playlists TEXT[] DEFAULT '{}';
ALTER TABLE public.artist_profiles ADD COLUMN past_shows JSONB DEFAULT '[]';
ALTER TABLE public.artist_profiles ADD COLUMN upcoming_shows JSONB DEFAULT '[]';
ALTER TABLE public.artist_profiles ADD COLUMN contact_info JSONB DEFAULT '{}';