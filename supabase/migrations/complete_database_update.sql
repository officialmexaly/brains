-- =============================================
-- COMPLETE DATABASE UPDATE SCRIPT
-- This script fixes all issues and updates the database
-- Run this in Supabase SQL Editor
-- =============================================

-- =============================================
-- PART 1: FIX RLS POLICIES (Make notes visible)
-- =============================================

-- Drop complex organization-based policies for notes
DROP POLICY IF EXISTS "Users can view notes in their organization" ON notes;
DROP POLICY IF EXISTS "Users can create notes in their organization" ON notes;
DROP POLICY IF EXISTS "Users can update notes they have permission for" ON notes;
DROP POLICY IF EXISTS "Users can delete notes they have permission for" ON notes;

-- Create simple user-based policies for notes
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

-- Drop complex organization-based policies for tasks
DROP POLICY IF EXISTS "Users can view tasks in their organization" ON tasks;
DROP POLICY IF EXISTS "Users can create tasks in their organization" ON tasks;
DROP POLICY IF EXISTS "Users can update tasks they have permission for" ON tasks;
DROP POLICY IF EXISTS "Users can delete tasks they have permission for" ON tasks;

-- Create simple user-based policies for tasks
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

-- Drop complex organization-based policies for knowledge_articles
DROP POLICY IF EXISTS "Users can view articles in their organization" ON knowledge_articles;
DROP POLICY IF EXISTS "Users can create articles in their organization" ON knowledge_articles;
DROP POLICY IF EXISTS "Users can update articles they have permission for" ON knowledge_articles;
DROP POLICY IF EXISTS "Users can delete articles they have permission for" ON knowledge_articles;

-- Create simple user-based policies for knowledge_articles
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

-- Drop complex organization-based policies for journal_entries
DROP POLICY IF EXISTS "Users can view entries in their organization" ON journal_entries;
DROP POLICY IF EXISTS "Users can create entries in their organization" ON journal_entries;
DROP POLICY IF EXISTS "Users can update entries they have permission for" ON journal_entries;
DROP POLICY IF EXISTS "Users can delete entries they have permission for" ON journal_entries;

-- Create simple user-based policies for journal_entries
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

-- =============================================
-- PART 2: UPDATE ATTACHMENTS TABLE FOR AVATARS
-- =============================================

-- Make note_id optional for attachments
ALTER TABLE attachments 
  ALTER COLUMN note_id DROP NOT NULL;

-- Add new columns to support different attachment types
ALTER TABLE attachments
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS attachment_type TEXT DEFAULT 'note_attachment' 
    CHECK (attachment_type IN ('note_attachment', 'avatar', 'profile_image', 'document', 'other')),
  ADD COLUMN IF NOT EXISTS file_data TEXT,
  ADD COLUMN IF NOT EXISTS mime_type TEXT;

-- Add unique constraint to ensure one avatar per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_attachments_user_type_unique 
  ON attachments(user_id, attachment_type) 
  WHERE user_id IS NOT NULL AND attachment_type IS NOT NULL;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_attachments_user_id ON attachments(user_id);
CREATE INDEX IF NOT EXISTS idx_attachments_type ON attachments(attachment_type);

-- Update RLS policies for attachments
DROP POLICY IF EXISTS "Users can view own attachments" ON attachments;
DROP POLICY IF EXISTS "Users can create own attachments" ON attachments;
DROP POLICY IF EXISTS "Users can update own attachments" ON attachments;
DROP POLICY IF EXISTS "Users can delete own attachments" ON attachments;

-- New flexible attachment policies
CREATE POLICY "Users can view own attachments"
  ON attachments FOR SELECT
  USING (
    auth.uid() = user_id
    OR
    (note_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM notes
      WHERE notes.id = attachments.note_id
      AND notes.user_id = auth.uid()
    ))
  );

CREATE POLICY "Users can create own attachments"
  ON attachments FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    OR
    (note_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM notes
      WHERE notes.id = attachments.note_id
      AND notes.user_id = auth.uid()
    ))
  );

CREATE POLICY "Users can update own attachments"
  ON attachments FOR UPDATE
  USING (
    auth.uid() = user_id
    OR
    (note_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM notes
      WHERE notes.id = attachments.note_id
      AND notes.user_id = auth.uid()
    ))
  );

CREATE POLICY "Users can delete own attachments"
  ON attachments FOR DELETE
  USING (
    auth.uid() = user_id
    OR
    (note_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM notes
      WHERE notes.id = attachments.note_id
      AND notes.user_id = auth.uid()
    ))
  );

-- =============================================
-- PART 3: ENSURE USER PROFILES EXIST
-- =============================================

-- Make sure all users have profiles
INSERT INTO user_profiles (user_id, display_name)
SELECT id, COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1))
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_profiles)
ON CONFLICT (user_id) DO NOTHING;

-- Make sure all users have settings
INSERT INTO user_settings (user_id)
SELECT id FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_settings)
ON CONFLICT (user_id) DO NOTHING;

-- =============================================
-- PART 4: ASSIGN ORGANIZATIONS TO EXISTING DATA
-- =============================================

-- Assign organization_id to existing notes
UPDATE notes
SET organization_id = (
  SELECT organization_id 
  FROM organization_members 
  WHERE organization_members.user_id = notes.user_id 
  LIMIT 1
)
WHERE organization_id IS NULL;

-- Assign organization_id to existing tasks
UPDATE tasks
SET organization_id = (
  SELECT organization_id 
  FROM organization_members 
  WHERE organization_members.user_id = tasks.user_id 
  LIMIT 1
)
WHERE organization_id IS NULL;

-- Assign organization_id to existing knowledge_articles
UPDATE knowledge_articles
SET organization_id = (
  SELECT organization_id 
  FROM organization_members 
  WHERE organization_members.user_id = knowledge_articles.user_id 
  LIMIT 1
)
WHERE organization_id IS NULL;

-- Assign organization_id to existing journal_entries
UPDATE journal_entries
SET organization_id = (
  SELECT organization_id 
  FROM organization_members 
  WHERE organization_members.user_id = journal_entries.user_id 
  LIMIT 1
)
WHERE organization_id IS NULL;

-- =============================================
-- PART 5: VERIFICATION QUERIES
-- =============================================

-- Check counts
SELECT 
  (SELECT COUNT(*) FROM notes WHERE user_id = auth.uid()) as my_notes,
  (SELECT COUNT(*) FROM tasks WHERE user_id = auth.uid()) as my_tasks,
  (SELECT COUNT(*) FROM knowledge_articles WHERE user_id = auth.uid()) as my_articles,
  (SELECT COUNT(*) FROM journal_entries WHERE user_id = auth.uid()) as my_entries,
  (SELECT COUNT(*) FROM user_profiles WHERE user_id = auth.uid()) as my_profile,
  (SELECT COUNT(*) FROM user_settings WHERE user_id = auth.uid()) as my_settings;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Database update completed successfully!';
  RAISE NOTICE '✅ RLS policies updated to simple user-based access';
  RAISE NOTICE '✅ Attachments table updated for avatar support';
  RAISE NOTICE '✅ User profiles and settings verified';
  RAISE NOTICE '✅ Organizations assigned to existing data';
  RAISE NOTICE '';
  RAISE NOTICE '🎉 You can now:';
  RAISE NOTICE '   - View your notes, tasks, articles, and journal entries';
  RAISE NOTICE '   - Upload avatars (stored in attachments table)';
  RAISE NOTICE '   - Create new content without organization errors';
END $$;
