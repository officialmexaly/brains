-- Clean migration to add user_id to existing tables
-- This version drops all existing policies first to avoid conflicts

-- Add user_id column to existing tables (if they don't have it)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notes' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE notes ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tasks' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE tasks ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'knowledge_articles' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE knowledge_articles ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

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

-- Drop ALL existing policies for these tables
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies for notes
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'notes') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON notes';
    END LOOP;
    
    -- Drop all policies for tasks
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'tasks') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON tasks';
    END LOOP;
    
    -- Drop all policies for knowledge_articles
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'knowledge_articles') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON knowledge_articles';
    END LOOP;
    
    -- Drop all policies for journal_entries
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'journal_entries') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON journal_entries';
    END LOOP;
    
    -- Drop all policies for attachments
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'attachments') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON attachments';
    END LOOP;
END $$;

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
