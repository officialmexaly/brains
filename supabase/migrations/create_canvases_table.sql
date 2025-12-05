-- Create canvases table for infinite canvas whiteboard
-- This table stores canvas metadata and node/edge data as JSONB

CREATE TABLE IF NOT EXISTS canvases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{"nodes": [], "edges": []}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_canvases_user_id ON canvases(user_id);
CREATE INDEX IF NOT EXISTS idx_canvases_created_at ON canvases(created_at DESC);

-- Enable Row Level Security
ALTER TABLE canvases ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own canvases
CREATE POLICY "Users can view their own canvases" ON canvases
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own canvases
CREATE POLICY "Users can create their own canvases" ON canvases
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own canvases
CREATE POLICY "Users can update their own canvases" ON canvases
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own canvases
CREATE POLICY "Users can delete their own canvases" ON canvases
  FOR DELETE USING (auth.uid() = user_id);

-- Create trigger for updating updated_at timestamp
CREATE TRIGGER update_canvases_updated_at
  BEFORE UPDATE ON canvases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
