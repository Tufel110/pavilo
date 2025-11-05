-- Add preferred_language field to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'english';

-- Add comment
COMMENT ON COLUMN profiles.preferred_language IS 'User preferred language: english, hindi, gujarati, marathi';