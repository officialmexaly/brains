-- Update attachments table to be a general-purpose file storage table
-- This allows storing avatars, note attachments, and other files

-- First, let's make the attachments table more flexible
-- Drop the NOT NULL constraint on note_id and make it optional
ALTER TABLE attachments 
  ALTER COLUMN note_id DROP NOT NULL;

-- Add new columns to support different attachment types
ALTER TABLE attachments
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS attachment_type TEXT NOT NULL DEFAULT 'note_attachment' 
    CHECK (attachment_type IN ('note_attachment', 'avatar', 'profile_image', 'document', 'other')),
  ADD COLUMN IF NOT EXISTS file_data TEXT, -- For storing base64 data URLs
  ADD COLUMN IF NOT EXISTS mime_type TEXT;

-- Add unique constraint to ensure one avatar per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_attachments_user_type_unique 
  ON attachments(user_id, attachment_type) 
  WHERE user_id IS NOT NULL AND attachment_type IS NOT NULL;

-- Create index on user_id and attachment_type for faster queries
CREATE INDEX IF NOT EXISTS idx_attachments_user_id ON attachments(user_id);
CREATE INDEX IF NOT EXISTS idx_attachments_type ON attachments(attachment_type);

-- Update RLS policies to handle both note attachments and user attachments

-- Drop old attachment policies
DROP POLICY IF EXISTS "Users can view own attachments" ON attachments;
DROP POLICY IF EXISTS "Users can create own attachments" ON attachments;
DROP POLICY IF EXISTS "Users can update own attachments" ON attachments;
DROP POLICY IF EXISTS "Users can delete own attachments" ON attachments;

-- New flexible policies
CREATE POLICY "Users can view own attachments"
  ON attachments FOR SELECT
  USING (
    -- User owns the attachment directly
    auth.uid() = user_id
    OR
    -- User owns the note that has this attachment
    (note_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM notes
      WHERE notes.id = attachments.note_id
      AND notes.user_id = auth.uid()
    ))
  );

CREATE POLICY "Users can create own attachments"
  ON attachments FOR INSERT
  WITH CHECK (
    -- User owns the attachment directly
    auth.uid() = user_id
    OR
    -- User owns the note that will have this attachment
    (note_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM notes
      WHERE notes.id = attachments.note_id
      AND notes.user_id = auth.uid()
    ))
  );

CREATE POLICY "Users can update own attachments"
  ON attachments FOR UPDATE
  USING (
    -- User owns the attachment directly
    auth.uid() = user_id
    OR
    -- User owns the note that has this attachment
    (note_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM notes
      WHERE notes.id = attachments.note_id
      AND notes.user_id = auth.uid()
    ))
  );

CREATE POLICY "Users can delete own attachments"
  ON attachments FOR DELETE
  USING (
    -- User owns the attachment directly
    auth.uid() = user_id
    OR
    -- User owns the note that has this attachment
    (note_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM notes
      WHERE notes.id = attachments.note_id
      AND notes.user_id = auth.uid()
    ))
  );

-- Add a comment to document the table's purpose
COMMENT ON TABLE attachments IS 'General-purpose file storage for avatars, note attachments, and other user files';
COMMENT ON COLUMN attachments.attachment_type IS 'Type of attachment: note_attachment, avatar, profile_image, document, or other';
COMMENT ON COLUMN attachments.file_data IS 'Base64 encoded data URL for inline storage (alternative to url)';
COMMENT ON COLUMN attachments.user_id IS 'Owner of the attachment (for user-level attachments like avatars)';
COMMENT ON COLUMN attachments.note_id IS 'Associated note (optional, only for note attachments)';
