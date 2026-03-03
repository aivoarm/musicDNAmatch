-- =====================================================
-- MUSIC DNA MATCH — COMPLETE DATABASE SETUP
-- Paste this entire script into Supabase SQL Editor
-- and click "Run". Run this only ONCE.
-- =====================================================

-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- =====================================================
-- 2. DNA Profiles Table
-- DNA Profiles
-- NOTE: user_id is TEXT (not UUID) because Google 'sub' is a long string
-- This table stores the calculated 12D sonic vector for each broadcaster.
-- =====================================================
CREATE TABLE IF NOT EXISTS dna_profiles (
  id           UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      TEXT    UNIQUE NOT NULL,  -- Google sub ID
  sonic_embedding VECTOR(12),            -- 12-dimensional psychoacoustic signature
  broadcasting BOOLEAN DEFAULT true,     -- Whether user is discoverable by others
  metadata     JSONB   DEFAULT '{}'::jsonb, -- User info (display_name, images, etc)
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vector similarity index (HNSW is fastest for search)
CREATE INDEX IF NOT EXISTS dna_profiles_embedding_idx
  ON dna_profiles USING hnsw (sonic_embedding vector_l2_ops);

-- Realtime: Disable RLS for prototype (ENABLE in production!)
ALTER TABLE dna_profiles DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- 3. Bridges Table (Collaborative Green Rooms)
-- Bridges (Ephemeral Collaboration Spaces)
-- This table links two users who have a high-fidelity match.
-- Bridges expire after 48 hours.
-- =====================================================
CREATE TABLE IF NOT EXISTS bridges (
  id                  UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a              TEXT    NOT NULL,  -- Google sub ID
  user_b              TEXT    NOT NULL,  -- Google sub ID
  common_ground_data  JSONB   DEFAULT '{}'::jsonb, -- Common genres/theses
  expires_at          TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + interval '48 hours'),
  created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE bridges DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- 4. Bridge Messages Table (Real-time chat)
-- Bridge Messages (Real-time Communication)
-- Stores messages for the ephemeral chat bridge.
-- =====================================================
CREATE TABLE IF NOT EXISTS bridge_messages (
  id         UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  bridge_id  UUID    REFERENCES bridges(id) ON DELETE CASCADE,
  sender_id  TEXT    NOT NULL,  -- Google sub ID
  content    TEXT    NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE bridge_messages DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- 5. Sonic Soulmate Matching Function
-- RPC: discovery function using pgvector
-- Finds users whose sonic_embedding is closest to the query_embedding.
-- =====================================================
CREATE OR REPLACE FUNCTION match_sonic_soulmates (
  query_embedding VECTOR(12),
  match_threshold FLOAT,
  match_count     INT,
  caller_id       TEXT  -- Google sub ID
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
-- =====================================================
-- 6. Match Interests Table (Interest Registration)
-- This table stores user interest in connecting with another user.
-- It is used to facilitate the mutual consent reveal of emails.
-- =====================================================
CREATE TABLE IF NOT EXISTS match_interests (
  id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     TEXT    NOT NULL,  -- The user expressing interest (Google sub)
  target_id   TEXT    NOT NULL,  -- The user they want to connect with (Google sub)
  email       TEXT    NOT NULL,  -- The email the user wants to reveal upon mutual match
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, target_id)
);

-- Disable RLS for prototype phase
ALTER TABLE match_interests DISABLE ROW LEVEL SECURITY;
