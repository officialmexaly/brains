# Troubleshooting Guide

## Notes Not Loading from Supabase

If you see "No notes yet" even though you have notes in your Supabase database, follow these steps:

### 1. Verify RLS Policies

1. Go to your Supabase Dashboard → Table Editor → `notes` table
2. Click on the table → "..." menu → "Edit RLS Policies"
3. You should see a policy named "Allow all operations on notes"
4. If it's not there or disabled, run this SQL:

```sql
-- Enable RLS
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if any
DROP POLICY IF EXISTS "Allow all operations on notes" ON notes;

-- Create new policy
CREATE POLICY "Allow all operations on notes" ON notes
  FOR ALL USING (true) WITH CHECK (true);
```

### 2. Check Browser Console

1. Open your deployed app (brains.dioing.com)
2. Press F12 to open Developer Tools
3. Go to Console tab
4. Look for:
   - "Loaded notes from Supabase: X" - This shows how many notes were loaded
   - Any error messages related to Supabase

### 3. Verify Environment Variables in Vercel

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Verify these variables exist and have correct values:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. If you changed them, redeploy your app

### 4. Test Supabase Connection

Run this SQL in Supabase SQL Editor to check if data exists:

```sql
SELECT count(*) FROM notes;
SELECT * FROM notes LIMIT 5;
```

### 5. Force Refresh

1. Clear your browser cache
2. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
3. Try in incognito/private mode

## Common Issues

### Issue: "Missing Supabase environment variables"

**Solution**: Add environment variables in Vercel as shown in the README

### Issue: Tags overlapping on note detail page

**Solution**: Already fixed in latest version - tags now wrap properly with `flex-wrap`

### Issue: Alerts instead of nice notifications

**Solution**: Already fixed - using Sonner toast notifications now

## Getting Help

If issues persist:

1. Check browser console for errors
2. Check Supabase logs in Dashboard → Logs
3. Verify RLS policies are enabled and correct
4. Try creating a new note to see if it saves
