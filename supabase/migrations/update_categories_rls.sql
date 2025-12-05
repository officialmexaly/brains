-- Update RLS policies to allow public read access for categories
-- This allows unauthenticated users to view categories

-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated users to read categories" ON categories;
DROP POLICY IF EXISTS "Allow authenticated users to insert categories" ON categories;
DROP POLICY IF EXISTS "Allow authenticated users to update categories" ON categories;
DROP POLICY IF EXISTS "Allow authenticated users to delete categories" ON categories;

-- Allow anyone to read categories (public access)
CREATE POLICY "Allow public read access to categories"
  ON categories FOR SELECT
  USING (true);

-- Allow anyone to insert categories (you can restrict this later if needed)
CREATE POLICY "Allow public insert access to categories"
  ON categories FOR INSERT
  WITH CHECK (true);

-- Allow anyone to update categories (you can restrict this later if needed)
CREATE POLICY "Allow public update access to categories"
  ON categories FOR UPDATE
  USING (true);

-- Allow anyone to delete categories (you can restrict this later if needed)
CREATE POLICY "Allow public delete access to categories"
  ON categories FOR DELETE
  USING (true);
