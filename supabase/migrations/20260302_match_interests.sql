-- Create a table to store match connection interests
CREATE TABLE IF NOT EXISTS match_interests (
  id           UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      TEXT    NOT NULL,  -- Current user's Spotify ID
  target_id    TEXT    NOT NULL,  -- Match's Spotify ID
  email        TEXT    NOT NULL,  -- The community email they provided
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, target_id)
);

-- Note: We disable RLS for prototype simplicity. In production, 
-- policies should be added for secure access.
ALTER TABLE match_interests DISABLE ROW LEVEL SECURITY;
