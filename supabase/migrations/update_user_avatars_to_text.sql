-- Update user_avatars table to store base64/data URL instead of binary
-- This migration changes BYTEA to TEXT for easier handling

-- Drop the old table and recreate with TEXT storage
DROP TABLE IF EXISTS user_avatars CASCADE;

CREATE TABLE user_avatars (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_data TEXT NOT NULL, -- Base64 encoded or data URL
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_user_avatars_user_id ON user_avatars(user_id);

-- Enable RLS
ALTER TABLE user_avatars ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own avatar"
  ON user_avatars FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own avatar"
  ON user_avatars FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own avatar"
  ON user_avatars FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own avatar"
  ON user_avatars FOR DELETE
  USING (auth.uid() = user_id);
