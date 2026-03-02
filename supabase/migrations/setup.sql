-- =====================================================
-- MUSIC DNA MATCH — COMPLETE DATABASE SETUP
-- Paste this entire script into Supabase SQL Editor
-- and click "Run". Run this only ONCE.
-- =====================================================

-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- =====================================================
-- 2. DNA Profiles Table
-- NOTE: user_id is TEXT (not UUID) because Spotify
-- user IDs are strings like "armanayva123"
-- =====================================================
CREATE TABLE IF NOT EXISTS dna_profiles (
  id           UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      TEXT    UNIQUE NOT NULL,  -- Spotify user ID
  sonic_embedding VECTOR(12),            -- 12-dimensional DNA vector
  broadcasting BOOLEAN DEFAULT true,
  metadata     JSONB   DEFAULT '{}'::jsonb,
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vector similarity index (HNSW is fastest for search)
CREATE INDEX IF NOT EXISTS dna_profiles_embedding_idx
  ON dna_profiles USING hnsw (sonic_embedding vector_l2_ops);

-- Disable RLS for prototype (enable + add policies for production)
ALTER TABLE dna_profiles DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- 3. Bridges Table (Collaborative Green Rooms)
-- =====================================================
CREATE TABLE IF NOT EXISTS bridges (
  id                  UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a              TEXT    NOT NULL,  -- Spotify user ID
  user_b              TEXT    NOT NULL,  -- Spotify user ID
  common_ground_data  JSONB   DEFAULT '{}'::jsonb,
  expires_at          TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + interval '48 hours'),
  created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE bridges DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- 4. Bridge Messages Table (Real-time chat)
-- =====================================================
CREATE TABLE IF NOT EXISTS bridge_messages (
  id         UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  bridge_id  UUID    REFERENCES bridges(id) ON DELETE CASCADE,
  sender_id  TEXT    NOT NULL,  -- Spotify user ID
  content    TEXT    NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE bridge_messages DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- 5. Sonic Soulmate Matching Function
-- Uses pgvector Euclidean distance (<->) for similarity
-- =====================================================
CREATE OR REPLACE FUNCTION match_sonic_soulmates (
  query_embedding VECTOR(12),
  match_threshold FLOAT,
  match_count     INT,
  caller_id       TEXT  -- Spotify user ID (TEXT, not UUID)
)
RETURNS TABLE (
  id         UUID,
  user_id    TEXT,
  metadata   JSONB,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    dna_profiles.id,
    dna_profiles.user_id,
    dna_profiles.metadata,
    1 - (dna_profiles.sonic_embedding <-> query_embedding) AS similarity
  FROM dna_profiles
  WHERE dna_profiles.user_id != caller_id
    AND 1 - (dna_profiles.sonic_embedding <-> query_embedding) > match_threshold
  ORDER BY dna_profiles.sonic_embedding <-> query_embedding
  LIMIT match_count;
END;
$$;
