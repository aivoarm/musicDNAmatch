-- Fix match_sonic_soulmates_v2 RPC to return created_at
CREATE OR REPLACE FUNCTION match_sonic_soulmates_v2 (
  query_embedding VECTOR(12),
  match_threshold FLOAT,
  match_count     INT,
  caller_id       TEXT
)
RETURNS TABLE (
  id           UUID,
  user_id      TEXT,
  metadata     JSONB,
  email        TEXT,
  city         TEXT,
  created_at   TIMESTAMP WITH TIME ZONE,
  similarity   FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    dna_profiles.id,
    dna_profiles.user_id,
    dna_profiles.metadata,
    dna_profiles.email,
    dna_profiles.city,
    dna_profiles.created_at,
    1 - (dna_profiles.sonic_embedding <=> query_embedding) AS similarity
  FROM dna_profiles
  WHERE dna_profiles.user_id != caller_id
    AND 1 - (dna_profiles.sonic_embedding <=> query_embedding) > match_threshold
  ORDER BY dna_profiles.sonic_embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
