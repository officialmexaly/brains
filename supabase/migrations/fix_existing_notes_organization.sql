-- Fix existing notes to work with organization-based RLS
-- This migration assigns existing notes to users' organizations

-- Step 1: Assign organization_id to existing notes based on user's organization
UPDATE notes
SET organization_id = (
  SELECT organization_id 
  FROM organization_members 
  WHERE organization_members.user_id = notes.user_id 
  LIMIT 1
)
WHERE organization_id IS NULL;

-- Step 2: Do the same for tasks
UPDATE tasks
SET organization_id = (
  SELECT organization_id 
  FROM organization_members 
  WHERE organization_members.user_id = tasks.user_id 
  LIMIT 1
)
WHERE organization_id IS NULL;

-- Step 3: Do the same for knowledge_articles
UPDATE knowledge_articles
SET organization_id = (
  SELECT organization_id 
  FROM organization_members 
  WHERE organization_members.user_id = knowledge_articles.user_id 
  LIMIT 1
)
WHERE organization_id IS NULL;

-- Step 4: Do the same for journal_entries
UPDATE journal_entries
SET organization_id = (
  SELECT organization_id 
  FROM organization_members 
  WHERE organization_members.user_id = journal_entries.user_id 
  LIMIT 1
)
WHERE organization_id IS NULL;

-- Step 5: For any notes still without organization (shouldn't happen), create a personal org
DO $$
DECLARE
  note_record RECORD;
  user_org_id UUID;
BEGIN
  FOR note_record IN 
    SELECT DISTINCT user_id FROM notes WHERE organization_id IS NULL
  LOOP
    -- Create personal organization for this user
    user_org_id := create_organization(
      'Personal Workspace',
      'personal-' || note_record.user_id::text,
      note_record.user_id
    );
    
    -- Assign all their notes to this organization
    UPDATE notes 
    SET organization_id = user_org_id 
    WHERE user_id = note_record.user_id AND organization_id IS NULL;
  END LOOP;
END $$;

-- Verify: Check if any notes still have NULL organization_id
SELECT COUNT(*) as notes_without_org FROM notes WHERE organization_id IS NULL;
SELECT COUNT(*) as tasks_without_org FROM tasks WHERE organization_id IS NULL;
SELECT COUNT(*) as articles_without_org FROM knowledge_articles WHERE organization_id IS NULL;
SELECT COUNT(*) as entries_without_org FROM journal_entries WHERE organization_id IS NULL;
