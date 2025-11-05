-- Create missing tables for payment and licensing system

-- Create plans table
CREATE TABLE public.plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  duration_days integer NOT NULL DEFAULT 365,
  price numeric NOT NULL,
  features jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

-- Everyone can view active plans (needed for payment selection)
CREATE POLICY "Anyone can view active plans"
  ON public.plans FOR SELECT
  USING (is_active = true);

-- Only admins can manage plans
CREATE POLICY "Admins can manage plans"
  ON public.plans FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Create license_logs table for audit trail
CREATE TABLE public.license_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  license_id uuid REFERENCES public.licenses(id) ON DELETE CASCADE,
  action text NOT NULL,
  performed_by uuid REFERENCES auth.users(id),
  details jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.license_logs ENABLE ROW LEVEL SECURITY;

-- Users can view logs for their own licenses
CREATE POLICY "Users can view own license logs"
  ON public.license_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM licenses 
      WHERE licenses.id = license_logs.license_id 
      AND licenses.user_id = auth.uid()
    )
  );

-- Admins can view all logs
CREATE POLICY "Admins can view all license logs"
  ON public.license_logs FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- Service role can create logs (for edge functions)
CREATE POLICY "Service role can create logs"
  ON public.license_logs FOR INSERT
  WITH CHECK (true);

-- Add missing columns to payments table
ALTER TABLE public.payments 
  ADD COLUMN IF NOT EXISTS plan_id uuid REFERENCES public.plans(id),
  ADD COLUMN IF NOT EXISTS method text,
  ADD COLUMN IF NOT EXISTS screenshot_url text,
  ADD COLUMN IF NOT EXISTS transaction_note text,
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  ADD COLUMN IF NOT EXISTS verified_by uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS verified_at timestamptz;

-- Add missing columns to licenses table
ALTER TABLE public.licenses 
  ADD COLUMN IF NOT EXISTS plan_id uuid REFERENCES public.plans(id),
  ADD COLUMN IF NOT EXISTS payment_id uuid,
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked')),
  ADD COLUMN IF NOT EXISTS revoked_reason text,
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id);

-- Insert default plan
INSERT INTO public.plans (name, description, duration_days, price, is_active)
VALUES 
  ('Pavilo Annual License', 'Full access to Pavilo for 1 year', 365, 999.00, true)
ON CONFLICT DO NOTHING;