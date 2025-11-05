-- Fix Critical Security Issues: Payment Settings and Licenses RLS

-- 1. Fix payment_settings public exposure
-- Drop the insecure "Anyone can view payment settings" policy
DROP POLICY IF EXISTS "Anyone can view payment settings" ON public.payment_settings;

-- Add secure policy: only admins can view payment settings
CREATE POLICY "Only admins can view payment settings" 
  ON public.payment_settings 
  FOR SELECT 
  USING (has_role(auth.uid(), 'admin'));

-- 2. Fix licenses table - enable RLS and add proper policies
-- Enable Row-Level Security on licenses table
ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;

-- Users can only view their own licenses
CREATE POLICY "Users can view own licenses" 
  ON public.licenses 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Admins can view all licenses
CREATE POLICY "Admins can view all licenses" 
  ON public.licenses 
  FOR SELECT 
  USING (has_role(auth.uid(), 'admin'));

-- Only admins can create licenses
CREATE POLICY "Admins can create licenses" 
  ON public.licenses 
  FOR INSERT 
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- Only admins can update licenses
CREATE POLICY "Admins can update licenses" 
  ON public.licenses 
  FOR UPDATE 
  USING (has_role(auth.uid(), 'admin'));

-- Only admins can delete licenses
CREATE POLICY "Admins can delete licenses" 
  ON public.licenses 
  FOR DELETE 
  USING (has_role(auth.uid(), 'admin'));