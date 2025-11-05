-- Create invoice_templates table for storing user's invoice customization preferences
CREATE TABLE IF NOT EXISTS public.invoice_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  template_name TEXT NOT NULL DEFAULT 'Default Template',
  show_company_logo BOOLEAN DEFAULT true,
  show_customer_address BOOLEAN DEFAULT true,
  show_customer_email BOOLEAN DEFAULT true,
  show_customer_phone BOOLEAN DEFAULT true,
  show_gst_number BOOLEAN DEFAULT false,
  show_invoice_notes BOOLEAN DEFAULT true,
  show_item_description BOOLEAN DEFAULT true,
  show_tax_column BOOLEAN DEFAULT true,
  show_discount_column BOOLEAN DEFAULT true,
  header_text TEXT DEFAULT 'INVOICE',
  footer_text TEXT DEFAULT 'Thank you for your business!',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.invoice_templates ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own templates" 
  ON public.invoice_templates 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own templates" 
  ON public.invoice_templates 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own templates" 
  ON public.invoice_templates 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own templates" 
  ON public.invoice_templates 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_invoice_templates_updated_at
  BEFORE UPDATE ON public.invoice_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();