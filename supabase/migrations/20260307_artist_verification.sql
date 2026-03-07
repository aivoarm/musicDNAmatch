-- Migration: Add verification_email to artists table
ALTER TABLE artists ADD COLUMN IF NOT EXISTS verification_email TEXT;
