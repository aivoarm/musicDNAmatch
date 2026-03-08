-- Migration: Add auth_user_id to dna_profiles for Magic Link auth
-- This links the legacy guest_id system to Supabase Auth users.

-- Step 1: Add auth_user_id column
ALTER TABLE dna_profiles
ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id);

-- Step 2: Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_dna_profiles_auth_user_id
ON dna_profiles(auth_user_id);

-- Step 3: Enable RLS on dna_profiles (if not already enabled)
ALTER TABLE dna_profiles ENABLE ROW LEVEL SECURITY;

-- Step 4: RLS Policies
-- Allow anyone to read broadcasting profiles (for matching)
CREATE POLICY "Public read for broadcasting profiles"
ON dna_profiles FOR SELECT
USING (broadcasting = true);

-- Allow authenticated users to read their own profile
CREATE POLICY "Users can read own profile"
ON dna_profiles FOR SELECT
USING (auth.uid() = auth_user_id);

-- Allow authenticated users to update their own profile
CREATE POLICY "Users can update own profile"
ON dna_profiles FOR UPDATE
USING (auth.uid() = auth_user_id);

-- Allow inserts with service role (handled server-side)
-- Guest users create profiles via API routes using the service role client.

-- NOTE: Existing guest_id flow still works through API routes.
-- The service role client bypasses RLS for legacy operations.
-- Once a user verifies via Magic Link, their profile gets linked
-- via auth_user_id and they get full RLS-protected access.
