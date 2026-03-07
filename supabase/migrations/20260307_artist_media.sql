-- Migration: Add image_url and preview_url to artists table
ALTER TABLE artists ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS preview_url TEXT;
