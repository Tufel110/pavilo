-- Fix payment_settings policy to use consistent role checking
DROP POLICY IF EXISTS "Only admins can manage payment settings" ON public.payment_settings;

CREATE POLICY "Only admins can manage payment settings"
  ON public.payment_settings
  FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Remove the unused admins table that was blocking access
DROP TABLE IF EXISTS public.admins CASCADE;