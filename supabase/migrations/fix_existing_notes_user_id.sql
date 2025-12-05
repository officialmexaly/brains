-- This migration updates existing notes to have the correct user_id
-- Run this to assign all existing notes to your current user

-- First, let's check if there are notes without user_id or with incorrect user_id
-- You can run this query to see what user_id your notes currently have:
-- SELECT id, title, user_id FROM notes;

-- Option 1: Update all notes to belong to a specific user
-- Replace 'YOUR_USER_EMAIL' with your actual email
-- UPDATE notes 
-- SET user_id = (SELECT id FROM auth.users WHERE email = 'YOUR_USER_EMAIL' LIMIT 1)
-- WHERE user_id IS NULL OR user_id != (SELECT id FROM auth.users WHERE email = 'YOUR_USER_EMAIL' LIMIT 1);

-- Option 2: Update all notes to belong to the first user in the system
-- Uncomment the line below to use this option:
-- UPDATE notes 
-- SET user_id = (SELECT id FROM auth.users ORDER BY created_at ASC LIMIT 1)
-- WHERE user_id IS NULL;

-- Option 3: Temporarily disable RLS to see all notes (NOT RECOMMENDED for production)
-- This is just for debugging - you can enable it temporarily to see all notes
-- ALTER TABLE notes DISABLE ROW LEVEL SECURITY;

-- To re-enable RLS after debugging:
-- ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
