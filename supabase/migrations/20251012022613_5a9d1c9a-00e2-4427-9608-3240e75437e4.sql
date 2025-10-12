-- Create profile_views table to track EPK views
CREATE TABLE public.profile_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.artist_profiles(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  viewer_ip TEXT,
  viewer_user_agent TEXT
);

-- Add index for faster queries
CREATE INDEX idx_profile_views_profile_id_viewed_at ON public.profile_views(profile_id, viewed_at DESC);

-- Enable RLS
ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;

-- Artists can view their own profile views
CREATE POLICY "Artists can view their own profile views"
ON public.profile_views
FOR SELECT
USING (
  profile_id IN (
    SELECT id FROM public.artist_profiles WHERE user_id = auth.uid()
  )
);

-- Allow anonymous inserts (for tracking public views)
CREATE POLICY "Anyone can insert profile views"
ON public.profile_views
FOR INSERT
WITH CHECK (true);