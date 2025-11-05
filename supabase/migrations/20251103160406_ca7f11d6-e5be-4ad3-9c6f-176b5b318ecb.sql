-- Create table to store encrypted Google Drive tokens
CREATE TABLE IF NOT EXISTS public.user_drive_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_expiry TIMESTAMP WITH TIME ZONE NOT NULL,
  is_connected BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_drive_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own drive tokens"
  ON public.user_drive_tokens
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own drive tokens"
  ON public.user_drive_tokens
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own drive tokens"
  ON public.user_drive_tokens
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own drive tokens"
  ON public.user_drive_tokens
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create monthly analytics table
CREATE TABLE IF NOT EXISTS public.monthly_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month TEXT NOT NULL,
  year INTEGER NOT NULL,
  total_sales NUMERIC DEFAULT 0,
  total_profit NUMERIC DEFAULT 0,
  total_invoices INTEGER DEFAULT 0,
  top_products JSONB DEFAULT '[]'::jsonb,
  worst_products JSONB DEFAULT '[]'::jsonb,
  top_customers JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, month, year)
);

-- Enable RLS
ALTER TABLE public.monthly_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own analytics"
  ON public.monthly_analytics
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage analytics"
  ON public.monthly_analytics
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Add drive_uploaded flag to invoices table
ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS drive_uploaded BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS drive_file_id TEXT,
ADD COLUMN IF NOT EXISTS drive_uploaded_at TIMESTAMP WITH TIME ZONE;

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_drive_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_drive_tokens_updated_at
  BEFORE UPDATE ON public.user_drive_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_drive_tokens_updated_at();

CREATE TRIGGER update_monthly_analytics_updated_at
  BEFORE UPDATE ON public.monthly_analytics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();