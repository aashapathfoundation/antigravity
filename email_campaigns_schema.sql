-- Email Campaigns Table for tracking scheduled and sent emails
CREATE TABLE public.email_campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  recipient_type TEXT NOT NULL CHECK (recipient_type IN ('subscribers', 'donors', 'csv', 'filtered')),
  
  -- Filters for 'filtered' type
  filter_min_amount INTEGER,
  filter_campaign_id UUID REFERENCES campaigns(id),
  filter_date_from TIMESTAMP WITH TIME ZONE,
  filter_date_to TIMESTAMP WITH TIME ZONE,
  
  -- Scheduling
  scheduled_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed')),
  
  -- Metrics
  recipient_count INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_email_campaigns_status ON public.email_campaigns(status);
CREATE INDEX idx_email_campaigns_scheduled_at ON public.email_campaigns(scheduled_at);
CREATE INDEX idx_email_campaigns_created_at ON public.email_campaigns(created_at DESC);

-- RLS Policies
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;

-- Only service role can manage campaigns
CREATE POLICY "Enable all for service role" ON public.email_campaigns
  FOR ALL USING (auth.role() = 'service_role');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_email_campaign_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_email_campaign_updated_at
  BEFORE UPDATE ON public.email_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_email_campaign_updated_at();
