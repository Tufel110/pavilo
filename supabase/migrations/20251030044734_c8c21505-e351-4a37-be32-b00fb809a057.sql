-- Add product_number column to products table
ALTER TABLE public.products 
ADD COLUMN product_number text;

-- Add index for faster lookups
CREATE INDEX idx_products_product_number ON public.products(product_number);