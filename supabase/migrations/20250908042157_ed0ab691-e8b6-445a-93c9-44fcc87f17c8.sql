-- Add new fields to artist_profiles table
ALTER TABLE artist_profiles 
ADD COLUMN IF NOT EXISTS blurb TEXT,
ADD COLUMN IF NOT EXISTS performance_type TEXT CHECK (performance_type IN ('Solo', 'Duo', 'Full Band')),
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS spotify_track_url TEXT;

-- Add comments for documentation
COMMENT ON COLUMN artist_profiles.blurb IS 'Short 20-word summary of artist bio';
COMMENT ON COLUMN artist_profiles.performance_type IS 'Type of performance: Solo, Duo, or Full Band';
COMMENT ON COLUMN artist_profiles.location IS 'Artist location/city';
COMMENT ON COLUMN artist_profiles.spotify_track_url IS 'Single Spotify track URL for embedding';