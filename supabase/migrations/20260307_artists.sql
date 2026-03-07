-- Migration: Create Artists Table
-- Purpose: Allow fans to also be artists, creating a distinct ecosystem for creator tools.

CREATE TABLE IF NOT EXISTS artists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT UNIQUE NOT NULL REFERENCES dna_profiles(user_id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    style TEXT,
    bio TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    spotify_url TEXT,
    youtube_url TEXT,
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Note: In production you should enable RLS. For this prototype, we disable it.
ALTER TABLE artists DISABLE ROW LEVEL SECURITY;
