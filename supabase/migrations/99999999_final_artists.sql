-- Final Consolidated Migration for Artists Table
-- Purpose: Ensure all columns are present for benchmark data and community artists.

CREATE TABLE IF NOT EXISTS artists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT UNIQUE DEFAULT NULL, -- Allows NULL for benchmark data
    name TEXT NOT NULL,
    slug TEXT,
    style TEXT,
    bio TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    genres JSONB DEFAULT '[]'::jsonb,
    origin_city TEXT,
    origin_country TEXT,
    formed_year INTEGER,
    active BOOLEAN DEFAULT true,
    verified BOOLEAN DEFAULT false,
    spotify_id TEXT,
    spotify_url TEXT,
    youtube_url TEXT,
    image_url TEXT,
    preview_url TEXT,
    verification_email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure user_id can be null (for benchmark artists)
ALTER TABLE artists ALTER COLUMN user_id DROP NOT NULL;

-- Disable RLS for prototype simplicity
ALTER TABLE artists DISABLE ROW LEVEL SECURITY;
