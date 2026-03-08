-- Migration: Change auth_user_id from UUID to TEXT for WorkOS support
-- This ensures that WorkOS user IDs (e.g., 'user_01...') can be stored.

ALTER TABLE dna_profiles 
ALTER COLUMN auth_user_id TYPE TEXT USING auth_user_id::text;

ALTER TABLE dna_profiles 
DROP CONSTRAINT IF EXISTS dna_profiles_auth_user_id_fkey;
