-- Migration: Add Position Field for Kanban Board
-- This adds position tracking for task ordering within columns

-- Add position field for ordering tasks within columns
ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS position INTEGER DEFAULT 0;

-- Create composite index for efficient ordering queries
CREATE INDEX IF NOT EXISTS idx_tasks_status_position 
  ON tasks(status, position);

-- Initialize positions for existing tasks
-- Tasks are ordered by creation date within each status
WITH ranked_tasks AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY status ORDER BY created_at) - 1 AS pos
  FROM tasks
)
UPDATE tasks
SET position = ranked_tasks.pos
FROM ranked_tasks
WHERE tasks.id = ranked_tasks.id;

-- Add comment to document the field
COMMENT ON COLUMN tasks.position IS 'Position/order of task within its status column (0-indexed)';
