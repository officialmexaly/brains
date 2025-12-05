-- Migration to add user_id to existing tables
-- Run this in your Supabase SQL Editor

-- Add user_id column to existing tables (if they don't have it)
-- We'll make it nullable first, then update it, then make it NOT NULL

-- Add user_id to notes
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notes' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE notes ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add user_id to tasks
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tasks' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE tasks ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add user_id to knowledge_articles
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'knowledge_articles' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE knowledge_articles ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add user_id to journal_entries
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'journal_entries' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE journal_entries ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create indexes for user_id
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_articles_user_id ON knowledge_articles(user_id);
CREATE INDEX IF NOT EXISTS idx_entries_user_id ON journal_entries(user_id);

-- Drop old policies if they exist
DROP POLICY IF EXISTS "Allow all operations on notes" ON notes;
DROP POLICY IF EXISTS "Allow all operations on tasks" ON tasks;
DROP POLICY IF EXISTS "Allow all operations on knowledge_articles" ON knowledge_articles;
DROP POLICY IF EXISTS "Allow all operations on journal_entries" ON journal_entries;
DROP POLICY IF EXISTS "Allow all operations on attachments" ON attachments;

-- Notes Policies (User-specific)
CREATE POLICY "Users can view own notes"
  ON notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own notes"
  ON notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes"
  ON notes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes"
  ON notes FOR DELETE
  USING (auth.uid() = user_id);

-- Tasks Policies (User-specific)
CREATE POLICY "Users can view own tasks"
  ON tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own tasks"
  ON tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks"
  ON tasks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks"
  ON tasks FOR DELETE
  USING (auth.uid() = user_id);

-- Knowledge Articles Policies (User-specific)
CREATE POLICY "Users can view own articles"
  ON knowledge_articles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own articles"
  ON knowledge_articles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own articles"
  ON knowledge_articles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own articles"
  ON knowledge_articles FOR DELETE
  USING (auth.uid() = user_id);

-- Journal Entries Policies (User-specific)
CREATE POLICY "Users can view own entries"
  ON journal_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own entries"
  ON journal_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own entries"
  ON journal_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own entries"
  ON journal_entries FOR DELETE
  USING (auth.uid() = user_id);

-- Attachments Policies (User-specific through notes)
CREATE POLICY "Users can view own attachments"
  ON attachments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM notes
    WHERE notes.id = attachments.note_id
    AND notes.user_id = auth.uid()
  ));

CREATE POLICY "Users can create own attachments"
  ON attachments FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM notes
    WHERE notes.id = attachments.note_id
    AND notes.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own attachments"
  ON attachments FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM notes
    WHERE notes.id = attachments.note_id
    AND notes.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own attachments"
  ON attachments FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM notes
    WHERE notes.id = attachments.note_id
    AND notes.user_id = auth.uid()
  ));
