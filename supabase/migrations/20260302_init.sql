-- Enable the pgvector extension to work with embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Create the DNA Profiles table
CREATE TABLE IF NOT EXISTS dna_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL,
  sonic_embedding VECTOR(12), -- 12-dimensional DNA vector
  broadcasting BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index for vector similarity search
-- Adjusting the index type to ivfflat or hnsw based on scale; hnsw is generally better for search speed at scale.
CREATE INDEX ON dna_profiles USING hnsw (sonic_embedding vector_cosine_ops);

-- RLS (Row Level Security)
ALTER TABLE dna_profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to see their own profile
CREATE POLICY "Users can view own profile" 
  ON dna_profiles FOR SELECT 
  USING (auth.uid() = user_id);

-- Allow everyone to see broadcasting profiles (for matching)
CREATE POLICY "Public can view broadcasting profiles" 
  ON dna_profiles FOR SELECT 
  USING (broadcasting = true);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" 
  ON dna_profiles FOR UPDATE 
  USING (auth.uid() = user_id);

-- Search function for finding sonic soulmates
CREATE OR REPLACE FUNCTION match_sonic_soulmates (
  query_embedding VECTOR(12),
  match_threshold FLOAT,
  match_count INT,
  caller_id UUID
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  metadata JSONB,
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
  WHERE dna_profiles.user_id != caller_id -- Don't match with self
    AND 1 - (dna_profiles.sonic_embedding <-> query_embedding) > match_threshold
  ORDER BY dna_profiles.sonic_embedding <-> query_embedding
  LIMIT match_count;
END;
$$;
