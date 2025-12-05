# Database Migration Guide

## Overview
This guide explains how to update your Supabase database to support the new enhanced task fields.

## Option 1: Migration Script (Recommended for Existing Database)

If you already have a tasks table with data, run this migration:

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Run the migration script: [add_task_fields.sql](file:///home/xi6th/Documents/Project/Dioing/brains/supabase/migrations/add_task_fields.sql)

This will add the new columns without affecting existing data.

## Option 2: Fresh Schema (For New Database)

If you're setting up a new database or want to recreate everything:

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Run the complete schema: [schema_updated.sql](file:///home/xi6th/Documents/Project/Dioing/brains/supabase/schema_updated.sql)

## New Fields Added

The following fields have been added to the `tasks` table:

| Field | Type | Description |
|-------|------|-------------|
| `tags` | TEXT[] | Array of tag values (urgent, important, meeting, etc.) |
| `subtasks` | JSONB | JSON array of subtask objects with id, text, and completed |
| `start_date` | TIMESTAMPTZ | When to begin working on the task |
| `time_estimate_value` | INTEGER | Numeric value for time estimate |
| `time_estimate_unit` | TEXT | Unit for time estimate (minutes, hours, days) |
| `reminder` | TEXT | Reminder setting (15min, 30min, 1hour, 1day, 1week) |
| `notes` | TEXT | Additional notes or context |

## Verification

After running the migration, verify the changes:

```sql
-- Check the table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'tasks'
ORDER BY ordinal_position;
```

## Next Steps

1. ✅ Run the SQL migration in Supabase
2. ✅ TypeScript types have been updated
3. ✅ useTasks hook has been updated
4. ✅ Task form has been updated
5. Test creating a new task with all fields
6. Update the task edit page with the same fields (if needed)

## Rollback (If Needed)

If you need to rollback the changes:

```sql
ALTER TABLE tasks
  DROP COLUMN IF EXISTS tags,
  DROP COLUMN IF EXISTS subtasks,
  DROP COLUMN IF EXISTS start_date,
  DROP COLUMN IF EXISTS time_estimate_value,
  DROP COLUMN IF EXISTS time_estimate_unit,
  DROP COLUMN IF EXISTS reminder,
  DROP COLUMN IF EXISTS notes;
```
