-- Migration to add multi-tenancy support to existing database
-- This adds user_id columns and proper RLS policies

-- Step 1: Add user_id columns to all tables
-- =============================================

-- Add user_id to notes table
ALTER TABLE notes 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id to tasks table
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id to knowledge_articles table
ALTER TABLE knowledge_articles 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id to journal_entries table
ALTER TABLE journal_entries 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 2: Update existing data with user_id
-- =============================================
-- This assigns all existing records to the first user in the system
-- If you have multiple users, you'll need to manually assign records

DO $$
DECLARE
  first_user_id UUID;
BEGIN
  -- Get the first user's ID
  SELECT id INTO first_user_id FROM auth.users ORDER BY created_at ASC LIMIT 1;
  
  -- Only update if we found a user
  IF first_user_id IS NOT NULL THEN
    -- Update all tables
    UPDATE notes SET user_id = first_user_id WHERE user_id IS NULL;
    UPDATE tasks SET user_id = first_user_id WHERE user_id IS NULL;
    UPDATE knowledge_articles SET user_id = first_user_id WHERE user_id IS NULL;
    UPDATE journal_entries SET user_id = first_user_id WHERE user_id IS NULL;
  END IF;
END $$;

-- Step 3: Make user_id NOT NULL after populating data
-- =============================================

ALTER TABLE notes ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE tasks ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE knowledge_articles ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE journal_entries ALTER COLUMN user_id SET NOT NULL;

-- Step 4: Create indexes for user_id columns
-- =============================================

CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_articles_user_id ON knowledge_articles(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON journal_entries(user_id);

-- Step 5: Drop old permissive policies
-- =============================================

DROP POLICY IF EXISTS "Allow all operations on notes" ON notes;
DROP POLICY IF EXISTS "Allow all operations on tasks" ON tasks;
DROP POLICY IF EXISTS "Allow all operations on knowledge_articles" ON knowledge_articles;
DROP POLICY IF EXISTS "Allow all operations on journal_entries" ON journal_entries;
DROP POLICY IF EXISTS "Allow all operations on attachments" ON attachments;

-- Step 6: Create user-specific RLS policies
-- =============================================

-- NOTES POLICIES
-- Users can only view their own notes
CREATE POLICY "Users can view own notes"
  ON notes FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only create notes for themselves
CREATE POLICY "Users can create own notes"
  ON notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own notes
CREATE POLICY "Users can update own notes"
  ON notes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own notes
CREATE POLICY "Users can delete own notes"
  ON notes FOR DELETE
  USING (auth.uid() = user_id);

-- TASKS POLICIES
-- Users can only view their own tasks
CREATE POLICY "Users can view own tasks"
  ON tasks FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only create tasks for themselves
CREATE POLICY "Users can create own tasks"
  ON tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own tasks
CREATE POLICY "Users can update own tasks"
  ON tasks FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own tasks
CREATE POLICY "Users can delete own tasks"
  ON tasks FOR DELETE
  USING (auth.uid() = user_id);

-- KNOWLEDGE ARTICLES POLICIES
-- Users can only view their own articles
CREATE POLICY "Users can view own articles"
  ON knowledge_articles FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only create articles for themselves
CREATE POLICY "Users can create own articles"
  ON knowledge_articles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own articles
CREATE POLICY "Users can update own articles"
  ON knowledge_articles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own articles
CREATE POLICY "Users can delete own articles"
  ON knowledge_articles FOR DELETE
  USING (auth.uid() = user_id);

-- JOURNAL ENTRIES POLICIES
-- Users can only view their own journal entries
CREATE POLICY "Users can view own entries"
  ON journal_entries FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only create journal entries for themselves
CREATE POLICY "Users can create own entries"
  ON journal_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own journal entries
CREATE POLICY "Users can update own entries"
  ON journal_entries FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own journal entries
CREATE POLICY "Users can delete own entries"
  ON journal_entries FOR DELETE
  USING (auth.uid() = user_id);

-- ATTACHMENTS POLICIES
-- Users can only view attachments for their own notes
CREATE POLICY "Users can view own attachments"
  ON attachments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM notes
      WHERE notes.id = attachments.note_id
      AND notes.user_id = auth.uid()
    )
  );

-- Users can only create attachments for their own notes
CREATE POLICY "Users can create own attachments"
  ON attachments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM notes
      WHERE notes.id = attachments.note_id
      AND notes.user_id = auth.uid()
    )
  );

-- Users can only update attachments for their own notes
CREATE POLICY "Users can update own attachments"
  ON attachments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM notes
      WHERE notes.id = attachments.note_id
      AND notes.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM notes
      WHERE notes.id = attachments.note_id
      AND notes.user_id = auth.uid()
    )
  );

-- Users can only delete attachments for their own notes
CREATE POLICY "Users can delete own attachments"
  ON attachments FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM notes
      WHERE notes.id = attachments.note_id
      AND notes.user_id = auth.uid()
    )
  );

-- Step 7: Verify RLS is enabled
-- =============================================

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
