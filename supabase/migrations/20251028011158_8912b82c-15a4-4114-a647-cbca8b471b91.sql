-- Add weekly events columns to venues table
ALTER TABLE public.venues 
ADD COLUMN IF NOT EXISTS weekly_events JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS events_last_updated TIMESTAMP WITH TIME ZONE;

-- Enable pg_cron extension for scheduling
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Grant necessary permissions for cron jobs
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;

-- Create a function to call the update-all-venue-events edge function
CREATE OR REPLACE FUNCTION public.trigger_venue_events_update()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- This function will be called by pg_cron to trigger the edge function
  PERFORM net.http_post(
    url := 'https://kaetsegwzfvkermjokmh.supabase.co/functions/v1/update-all-venue-events',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthZXRzZWd3emZ2a2VybWpva21oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxMzY2NDEsImV4cCI6MjA3MTcxMjY0MX0.8Ddj1LUceOBqNuH8cRuupsGBpVLYd1S78OoY7Ubgi-I'
    ),
    body := '{}'::jsonb
  );
END;
$$;

-- Schedule the cron job to run every Sunday at 11:00 PM UTC
SELECT cron.schedule(
  'update-venue-events-weekly',
  '0 23 * * 0',
  $$SELECT public.trigger_venue_events_update();$$
);