-- Add language field to invoice_templates table
ALTER TABLE invoice_templates ADD COLUMN IF NOT EXISTS invoice_language TEXT DEFAULT 'english';

-- Add comment
COMMENT ON COLUMN invoice_templates.invoice_language IS 'Language for invoice: english, hindi, gujarati, marathi';