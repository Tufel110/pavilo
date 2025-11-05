-- Grant admin role to the first user (you)
-- This will allow access to the payment verification page

-- First, get the first user's ID and assign admin role
DO $$
DECLARE
  first_user_id uuid;
BEGIN
  -- Get the first user from auth.users
  SELECT id INTO first_user_id
  FROM auth.users
  ORDER BY created_at
  LIMIT 1;

  -- Insert admin role if user exists and doesn't already have it
  IF first_user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (first_user_id, 'admin'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END $$;