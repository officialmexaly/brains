# Quick Setup Guide for Settings Page

## The Problem
The settings page shows errors because the database tables don't exist yet. You need to run the migration file to create them.

## Solution: Run the Migration

### Option 1: Using Supabase Dashboard (Recommended)

1. **Open Supabase Dashboard**
   - Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Select your project

2. **Open SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy and Paste the Migration**
   - Open the file: `supabase/migrations/create_user_settings.sql`
   - Copy ALL the contents
   - Paste into the SQL Editor

4. **Run the Migration**
   - Click "Run" or press `Ctrl+Enter`
   - Wait for success message

5. **Refresh Your App**
   - Go back to your settings page
   - Refresh the browser
   - Everything should work now!

### Option 2: Using Supabase CLI

```bash
# If you have Supabase CLI installed
cd /home/xi6th/Documents/Project/Dioing/brains
supabase db push
```

## What the Migration Creates

The migration will create 4 tables:
- ✅ `user_profiles` - For display name, bio, avatar
- ✅ `user_settings` - For all your preferences
- ✅ `user_sessions` - For session tracking
- ✅ `connected_accounts` - For OAuth providers

## After Running the Migration

Once the migration is complete:

1. **Refresh the settings page** - All errors should be gone
2. **Try changing settings** - They will save to the database
3. **Upload an avatar** - (Optional: requires storage bucket setup)

## Optional: Avatar Upload Setup

If you want avatar uploads to work:

```sql
-- Run this in Supabase SQL Editor
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Allow users to upload their own avatars
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Make avatars publicly accessible
CREATE POLICY "Avatars are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');
```

## Troubleshooting

### Still seeing errors?
1. Check browser console for specific error messages
2. Make sure you're logged in
3. Verify the migration ran successfully in Supabase

### Can't save settings?
- The migration probably didn't run
- Check Supabase dashboard for error messages

### Avatar upload not working?
- You need to create the storage bucket (see above)
- Check if storage is enabled in your Supabase project

## Quick Test

After running the migration, try:
1. Change your display name → Click "Save Profile"
2. Toggle a notification setting → Should save automatically
3. Change theme → Should save automatically
4. Export data → Should download a JSON file

All of these should work without errors!
