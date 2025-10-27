-- Create venue_likes table
CREATE TABLE public.venue_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, venue_id)
);

-- Enable RLS
ALTER TABLE public.venue_likes ENABLE ROW LEVEL SECURITY;

-- Users can view their own likes
CREATE POLICY "Users can view their own likes"
ON public.venue_likes
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own likes
CREATE POLICY "Users can create their own likes"
ON public.venue_likes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own likes
CREATE POLICY "Users can delete their own likes"
ON public.venue_likes
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX idx_venue_likes_user_id ON public.venue_likes(user_id);
CREATE INDEX idx_venue_likes_venue_id ON public.venue_likes(venue_id);