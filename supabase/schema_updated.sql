-- Brain App Database Schema (UPDATED)
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Notes Table
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks Table (UPDATED with new fields)
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in-progress', 'completed')),
  due_date TIMESTAMPTZ,
  -- NEW FIELDS
  tags TEXT[] DEFAULT '{}',
  subtasks JSONB DEFAULT '[]',
  start_date TIMESTAMPTZ,
  time_estimate_value INTEGER,
  time_estimate_unit TEXT CHECK (time_estimate_unit IN ('minutes', 'hours', 'days')),
  reminder TEXT,
  notes TEXT,
  -- END NEW FIELDS
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Knowledge Articles Table
CREATE TABLE IF NOT EXISTS knowledge_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  image_url TEXT,
  read_time INTEGER NOT NULL,
  author TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Journal Entries Table
CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  mood TEXT CHECK (mood IN ('great', 'good', 'okay', 'bad', 'terrible')),
  tags TEXT[] DEFAULT '{}',
  date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Attachments Table
CREATE TABLE IF NOT EXISTS attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  size BIGINT NOT NULL,
  type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_notes_category ON notes(category);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_is_pinned ON notes(is_pinned);

CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
-- NEW INDEXES
CREATE INDEX IF NOT EXISTS idx_tasks_tags ON tasks USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_tasks_start_date ON tasks(start_date);

CREATE INDEX IF NOT EXISTS idx_articles_category ON knowledge_articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON knowledge_articles(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_entries_date ON journal_entries(date DESC);
CREATE INDEX IF NOT EXISTS idx_entries_mood ON journal_entries(mood);

CREATE INDEX IF NOT EXISTS idx_attachments_note_id ON attachments(note_id);

-- Enable Row Level Security (RLS)
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;

-- Create policies (for now, allowing all operations - you can customize this later)
-- For production, you should implement proper authentication and user-specific policies

-- Notes Policies
CREATE POLICY "Allow all operations on notes" ON notes
  FOR ALL USING (true) WITH CHECK (true);

-- Tasks Policies
CREATE POLICY "Allow all operations on tasks" ON tasks
  FOR ALL USING (true) WITH CHECK (true);

-- Knowledge Articles Policies
CREATE POLICY "Allow all operations on knowledge_articles" ON knowledge_articles
  FOR ALL USING (true) WITH CHECK (true);

-- Journal Entries Policies
CREATE POLICY "Allow all operations on journal_entries" ON journal_entries
  FOR ALL USING (true) WITH CHECK (true);

-- Attachments Policies
CREATE POLICY "Allow all operations on attachments" ON attachments
  FOR ALL USING (true) WITH CHECK (true);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updating updated_at
CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON knowledge_articles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_entries_updated_at
  BEFORE UPDATE ON journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments to document the new fields
COMMENT ON COLUMN tasks.tags IS 'Array of tag values (urgent, important, meeting, research, review, planning, bug, feature)';
COMMENT ON COLUMN tasks.subtasks IS 'JSON array of subtask objects with id, text, and completed fields';
COMMENT ON COLUMN tasks.start_date IS 'When to begin working on the task';
COMMENT ON COLUMN tasks.time_estimate_value IS 'Numeric value for time estimate';
COMMENT ON COLUMN tasks.time_estimate_unit IS 'Unit for time estimate (minutes, hours, or days)';
COMMENT ON COLUMN tasks.reminder IS 'Reminder setting (15min, 30min, 1hour, 1day, 1week)';
COMMENT ON COLUMN tasks.notes IS 'Additional notes or context for the task';
