-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  icon VARCHAR(10) NOT NULL,
  color VARCHAR(50) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read categories
CREATE POLICY "Allow authenticated users to read categories"
  ON categories FOR SELECT
  TO authenticated
  USING (true);

-- Allow all authenticated users to insert categories
CREATE POLICY "Allow authenticated users to insert categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow all authenticated users to update categories
CREATE POLICY "Allow authenticated users to update categories"
  ON categories FOR UPDATE
  TO authenticated
  USING (true);

-- Allow all authenticated users to delete categories
CREATE POLICY "Allow authenticated users to delete categories"
  ON categories FOR DELETE
  TO authenticated
  USING (true);

-- Insert default categories
INSERT INTO categories (name, icon, color, description) VALUES
  ('Development', '💻', 'from-blue-500 to-blue-600', 'Programming, coding, and software development'),
  ('Productivity', '⚡', 'from-green-500 to-green-600', 'Tools and techniques to boost productivity'),
  ('Learning', '🎓', 'from-purple-500 to-purple-600', 'Educational content and learning resources'),
  ('Health', '❤️', 'from-red-500 to-red-600', 'Health, fitness, and wellness'),
  ('Finance', '💰', 'from-yellow-500 to-yellow-600', 'Personal finance and money management'),
  ('Design', '🎨', 'from-pink-500 to-pink-600', 'Design principles and creative work'),
  ('Business', '💼', 'from-indigo-500 to-indigo-600', 'Business strategies and entrepreneurship'),
  ('Technology', '🔧', 'from-cyan-500 to-cyan-600', 'Technology trends and innovations')
ON CONFLICT (name) DO NOTHING;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
