-- Make invoice_id nullable for subscription payments
ALTER TABLE public.payments 
ALTER COLUMN invoice_id DROP NOT NULL;

-- Add comment to clarify usage
COMMENT ON COLUMN public.payments.invoice_id IS 'Invoice ID for invoice payments, NULL for subscription payments';