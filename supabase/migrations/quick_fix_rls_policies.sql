-- QUICK FIX: Temporarily use simpler RLS policies to see your notes
-- Run this in Supabase SQL Editor to make your notes visible immediately

-- Drop the complex organization-based policies
DROP POLICY IF EXISTS "Users can view notes in their organization" ON notes;
DROP POLICY IF EXISTS "Users can create notes in their organization" ON notes;
DROP POLICY IF EXISTS "Users can update notes they have permission for" ON notes;
DROP POLICY IF EXISTS "Users can delete notes they have permission for" ON notes;

-- Create simple user-based policies (like before)
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

-- Do the same for tasks
DROP POLICY IF EXISTS "Users can view tasks in their organization" ON tasks;
DROP POLICY IF EXISTS "Users can create tasks in their organization" ON tasks;
DROP POLICY IF EXISTS "Users can update tasks they have permission for" ON tasks;
DROP POLICY IF EXISTS "Users can delete tasks they have permission for" ON tasks;

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

-- Verify you can see your notes now
SELECT COUNT(*) as my_notes_count FROM notes WHERE user_id = auth.uid();
SELECT COUNT(*) as my_tasks_count FROM tasks WHERE user_id = auth.uid();
