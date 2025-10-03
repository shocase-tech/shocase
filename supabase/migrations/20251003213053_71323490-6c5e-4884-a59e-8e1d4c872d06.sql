-- Create outreach_components table
CREATE TABLE outreach_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  expected_draw TEXT,
  social_proof TEXT,
  notable_achievements TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on outreach_components
ALTER TABLE outreach_components ENABLE ROW LEVEL SECURITY;

-- RLS Policies for outreach_components
CREATE POLICY "Users can view own outreach components" 
ON outreach_components
FOR SELECT 
USING (auth.uid() = user_id);
  
CREATE POLICY "Users can insert own outreach components" 
ON outreach_components
FOR INSERT 
WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY "Users can update own outreach components" 
ON outreach_components
FOR UPDATE 
USING (auth.uid() = user_id);

-- Add missing columns to venue_applications
ALTER TABLE venue_applications ADD COLUMN IF NOT EXISTS proposed_dates TEXT;
ALTER TABLE venue_applications ADD COLUMN IF NOT EXISTS proposed_bill TEXT;
ALTER TABLE venue_applications ADD COLUMN IF NOT EXISTS additional_context TEXT;
ALTER TABLE venue_applications ADD COLUMN IF NOT EXISTS gmail_draft_id TEXT;
ALTER TABLE venue_applications ADD COLUMN IF NOT EXISTS gmail_message_id TEXT;

-- Create index on gmail_draft_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_applications_gmail_draft ON venue_applications(gmail_draft_id);

-- Add trigger for updated_at on outreach_components
CREATE TRIGGER update_outreach_components_updated_at
BEFORE UPDATE ON outreach_components
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();