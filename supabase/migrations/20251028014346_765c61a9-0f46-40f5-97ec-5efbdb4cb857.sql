-- Add event_calendar_url column to venues table
ALTER TABLE public.venues 
ADD COLUMN event_calendar_url TEXT;