# Attachment Feature Setup Guide

## Prerequisites
- Supabase project with the notes table already created
- Database access through Supabase SQL Editor

## Step 1: Create Attachments Table

Run this SQL in your Supabase SQL Editor:

```sql
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

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_attachments_note_id ON attachments(note_id);

-- Enable RLS
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Allow all operations on attachments" ON attachments
  FOR ALL USING (true) WITH CHECK (true);
```

## Step 2: Create Supabase Storage Bucket

1. Go to your Supabase Dashboard
2. Click on **Storage** in the left sidebar
3. Click **New Bucket**
4. Bucket name: `brain-attachments`
5. Set as **Public bucket** (checkbox)
6. Click **Create Bucket**

## Step 3: Configure Storage Policies

After creating the bucket, add these policies:

1. In Storage, click on your `brain-attachments` bucket
2. Go to **Policies** tab
3. Add the following policies:

### Policy 1: Allow uploads
- Policy name: `Allow authenticated uploads`
- Allowed operation: INSERT
- Policy definition:
```sql
true
```

### Policy 2: Allow public access
- Policy name: `Allow public downloads`
- Allowed operation: SELECT
- Policy definition:
```sql
true
```

### Policy 3: Allow deletions
- Policy name: `Allow authenticated deletions`
- Allowed operation: DELETE
- Policy definition:
```sql
true
```

## Step 4: Test the Feature

1. Go to your app's notes page
2. Create a new note or edit an existing one
3. You should see an "Attachments" section in the form
4. Click to upload files (max 5 files, 10MB each)
5. Supported formats: images, PDFs, documents, videos, audio, archives
6. After saving, attachments will appear on the note detail page

## Features

✅ Drag and drop file upload
✅ Multiple file support (up to 5 files)
✅ File size limit (10MB per file)
✅ File type icons
✅ File size display
✅ Download/preview attachments
✅ Delete attachments
✅ Automatic cleanup on note deletion (CASCADE)

## File Size Limits

You can adjust the limits in the FileUpload component:
- `maxFiles`: Maximum number of files per note (default: 5)
- `maxFileSize`: Maximum size per file in MB (default: 10)

## Supported File Types

- **Images**: PNG, JPG, GIF, SVG
- **Documents**: PDF, DOC, DOCX
- **Spreadsheets**: XLS, XLSX
- **Presentations**: PPT, PPTX
- **Archives**: ZIP, RAR, 7Z
- **Media**: MP3, MP4, AVI, etc.

## Troubleshooting

### Upload fails with "Failed to upload files"
- Check if the storage bucket `brain-attachments` exists
- Verify bucket is set to **Public**
- Check storage policies are configured correctly

### Attachments not showing
- Verify the attachments table exists
- Check RLS policies are enabled
- Look for errors in browser console

### Files too large
- Increase `maxFileSize` in FileUpload component
- Note: Supabase free tier has storage limits

## Cost Considerations

- **Supabase Free Tier**: 1GB storage
- **Pro Tier**: 8GB storage (upgradeable)
- Monitor your storage usage in Supabase Dashboard > Settings > Usage
