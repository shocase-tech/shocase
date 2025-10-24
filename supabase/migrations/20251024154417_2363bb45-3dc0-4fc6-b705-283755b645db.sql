-- Create riders table for storing technical and hospitality riders
CREATE TABLE public.riders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Untitled Rider',
  type TEXT NOT NULL CHECK (type IN ('technical', 'hospitality')),
  sections JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_template BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.riders ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own riders"
ON public.riders
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own riders"
ON public.riders
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own riders"
ON public.riders
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own riders"
ON public.riders
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX idx_riders_user_id ON public.riders(user_id);
CREATE INDEX idx_riders_type ON public.riders(type);

-- Create trigger for updated_at
CREATE TRIGGER update_riders_updated_at
BEFORE UPDATE ON public.riders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();