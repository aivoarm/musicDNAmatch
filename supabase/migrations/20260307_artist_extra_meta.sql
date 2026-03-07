-- Migration: Add genres and other metadata columns to artists table
ALTER TABLE artists ADD COLUMN IF NOT EXISTS genres JSONB DEFAULT '[]'::jsonb;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS origin_city TEXT;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS origin_country TEXT;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS formed_year INTEGER;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS spotify_id TEXT;
