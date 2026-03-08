-- Add auth_user_id column to dna_profiles table
ALTER TABLE dna_profiles ADD COLUMN IF NOT EXISTS auth_user_id TEXT;

-- Create index for faster lookups by auth_user_id
CREATE INDEX IF NOT EXISTS idx_dna_profiles_auth_user_id ON dna_profiles(auth_user_id);

-- Optional: Add a comment to the column
COMMENT ON COLUMN dna_profiles.auth_user_id IS 'Associated WorkOS user ID after verification';
