-- Migration: Add Enhanced Task Fields
-- This adds the new fields for tags, subtasks, start_date, time_estimate, reminder, and notes

-- Add new columns to tasks table
ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS subtasks JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS time_estimate_value INTEGER,
  ADD COLUMN IF NOT EXISTS time_estimate_unit TEXT CHECK (time_estimate_unit IN ('minutes', 'hours', 'days')),
  ADD COLUMN IF NOT EXISTS reminder TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add indexes for the new fields
CREATE INDEX IF NOT EXISTS idx_tasks_tags ON tasks USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_tasks_start_date ON tasks(start_date);

-- Add comment to document the schema
COMMENT ON COLUMN tasks.tags IS 'Array of tag values (urgent, important, meeting, research, review, planning, bug, feature)';
COMMENT ON COLUMN tasks.subtasks IS 'JSON array of subtask objects with id, text, and completed fields';
COMMENT ON COLUMN tasks.start_date IS 'When to begin working on the task';
COMMENT ON COLUMN tasks.time_estimate_value IS 'Numeric value for time estimate';
COMMENT ON COLUMN tasks.time_estimate_unit IS 'Unit for time estimate (minutes, hours, or days)';
COMMENT ON COLUMN tasks.reminder IS 'Reminder setting (15min, 30min, 1hour, 1day, 1week)';
COMMENT ON COLUMN tasks.notes IS 'Additional notes or context for the task';
