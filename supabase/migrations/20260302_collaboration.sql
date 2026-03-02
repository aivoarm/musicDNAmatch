-- Collaborative Bridge Tables
CREATE TABLE IF NOT EXISTS bridges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a UUID NOT NULL REFERENCES dna_profiles(user_id),
  user_b UUID NOT NULL REFERENCES dna_profiles(user_id),
  common_ground_data JSONB DEFAULT '{}'::jsonb,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + interval '48 hours'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bridge_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bridge_id UUID REFERENCES bridges(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for Bridges
ALTER TABLE bridges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bridges"
  ON bridges FOR SELECT
  USING (auth.uid() = user_a OR auth.uid() = user_b);

-- RLS for Messages
ALTER TABLE bridge_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Bridge members can view messages"
  ON bridge_messages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM bridges 
    WHERE id = bridge_id AND (user_a = auth.uid() OR user_b = auth.uid())
  ));

CREATE POLICY "Bridge members can insert messages"
  ON bridge_messages FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM bridges 
    WHERE id = bridge_id AND (user_a = auth.uid() OR user_b = auth.uid())
  ));
