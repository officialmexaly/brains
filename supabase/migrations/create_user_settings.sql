-- User Settings and Preferences Schema
-- This creates tables to store user preferences and settings

-- User profiles table (extended user information)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User settings table (all user preferences)
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Appearance settings
  theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  accent_color TEXT DEFAULT 'blue' CHECK (accent_color IN ('blue', 'purple', 'pink', 'green', 'orange', 'red')),
  font_size TEXT DEFAULT 'medium' CHECK (font_size IN ('small', 'medium', 'large', 'extra-large')),
  compact_mode BOOLEAN DEFAULT FALSE,
  
  -- Notification settings
  email_notifications BOOLEAN DEFAULT TRUE,
  push_notifications BOOLEAN DEFAULT FALSE,
  task_reminders BOOLEAN DEFAULT TRUE,
  weekly_digest BOOLEAN DEFAULT TRUE,
  
  -- Privacy settings
  profile_visibility TEXT DEFAULT 'private' CHECK (profile_visibility IN ('public', 'private', 'friends')),
  show_activity BOOLEAN DEFAULT FALSE,
  allow_sharing BOOLEAN DEFAULT TRUE,
  
  -- Editor settings
  default_view TEXT DEFAULT 'rich' CHECK (default_view IN ('rich', 'markdown', 'plain')),
  auto_save BOOLEAN DEFAULT TRUE,
  spell_check BOOLEAN DEFAULT TRUE,
  markdown_preview BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User sessions table (for tracking active sessions)
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_name TEXT,
  device_type TEXT,
  ip_address TEXT,
  user_agent TEXT,
  last_active TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Connected accounts table (OAuth providers)
CREATE TABLE IF NOT EXISTS connected_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('google', 'github', 'facebook', 'twitter')),
  provider_user_id TEXT NOT NULL,
  email TEXT,
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_connected_accounts_user_id ON connected_accounts(user_id);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE connected_accounts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_settings
CREATE POLICY "Users can view own settings"
  ON user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON user_settings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_sessions
CREATE POLICY "Users can view own sessions"
  ON user_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions"
  ON user_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for connected_accounts
CREATE POLICY "Users can view own connected accounts"
  ON connected_accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own connected accounts"
  ON connected_accounts FOR DELETE
  USING (auth.uid() = user_id);

-- Function to create default settings for new users
CREATE OR REPLACE FUNCTION create_default_user_settings()
RETURNS TRIGGER AS $$
BEGIN
  -- Create default profile
  INSERT INTO user_profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)))
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Create default settings
  INSERT INTO user_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create default settings for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_user_settings();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updating updated_at
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_settings_updated_at();

DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_settings_updated_at();

-- Create default settings for existing users
INSERT INTO user_profiles (user_id, display_name)
SELECT id, COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1))
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO user_settings (user_id)
SELECT id FROM auth.users
ON CONFLICT (user_id) DO NOTHING;
