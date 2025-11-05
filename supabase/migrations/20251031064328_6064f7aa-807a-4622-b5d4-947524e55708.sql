-- Add business_type to profiles table
CREATE TYPE public.business_type AS ENUM (
  'general_store',
  'apmc_vendor',
  'shoe_clothes_retail'
);

ALTER TABLE public.profiles 
ADD COLUMN business_type public.business_type;

-- Update RLS policies to ensure users can only access their own data
-- (policies already exist, just documenting the security model)