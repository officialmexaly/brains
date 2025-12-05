-- ABAC (Attribute-Based Access Control) Implementation
-- This adds role-based and attribute-based access control to the system

-- Step 1: Create roles and permissions tables
-- =============================================

-- User roles table
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'editor', 'viewer', 'owner')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Permissions table
CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  resource_type TEXT NOT NULL, -- 'notes', 'tasks', 'knowledge_articles', 'journal_entries'
  action TEXT NOT NULL CHECK (action IN ('create', 'read', 'update', 'delete', 'share')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Role permissions mapping
CREATE TABLE IF NOT EXISTS role_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role TEXT NOT NULL CHECK (role IN ('admin', 'editor', 'viewer', 'owner')),
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(role, permission_id)
);

-- Resource sharing table (for collaborative features)
CREATE TABLE IF NOT EXISTS resource_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resource_type TEXT NOT NULL, -- 'note', 'task', 'article', 'entry'
  resource_id UUID NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_with_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permission_level TEXT NOT NULL CHECK (permission_level IN ('view', 'edit', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  UNIQUE(resource_type, resource_id, shared_with_id)
);

-- Resource attributes table (for custom attributes)
CREATE TABLE IF NOT EXISTS resource_attributes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resource_type TEXT NOT NULL,
  resource_id UUID NOT NULL,
  attribute_key TEXT NOT NULL,
  attribute_value TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(resource_type, resource_id, attribute_key)
);

-- Step 2: Create indexes
-- =============================================

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);
CREATE INDEX IF NOT EXISTS idx_permissions_resource_type ON permissions(resource_type);
CREATE INDEX IF NOT EXISTS idx_permissions_action ON permissions(action);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON role_permissions(role);
CREATE INDEX IF NOT EXISTS idx_resource_shares_owner ON resource_shares(owner_id);
CREATE INDEX IF NOT EXISTS idx_resource_shares_shared_with ON resource_shares(shared_with_id);
CREATE INDEX IF NOT EXISTS idx_resource_shares_resource ON resource_shares(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_resource_attributes_resource ON resource_attributes(resource_type, resource_id);

-- Step 3: Insert default permissions
-- =============================================

INSERT INTO permissions (name, description, resource_type, action) VALUES
  -- Notes permissions
  ('notes.create', 'Create new notes', 'notes', 'create'),
  ('notes.read', 'Read notes', 'notes', 'read'),
  ('notes.update', 'Update notes', 'notes', 'update'),
  ('notes.delete', 'Delete notes', 'notes', 'delete'),
  ('notes.share', 'Share notes with others', 'notes', 'share'),
  
  -- Tasks permissions
  ('tasks.create', 'Create new tasks', 'tasks', 'create'),
  ('tasks.read', 'Read tasks', 'tasks', 'read'),
  ('tasks.update', 'Update tasks', 'tasks', 'update'),
  ('tasks.delete', 'Delete tasks', 'tasks', 'delete'),
  ('tasks.share', 'Share tasks with others', 'tasks', 'share'),
  
  -- Knowledge articles permissions
  ('articles.create', 'Create new articles', 'knowledge_articles', 'create'),
  ('articles.read', 'Read articles', 'knowledge_articles', 'read'),
  ('articles.update', 'Update articles', 'knowledge_articles', 'update'),
  ('articles.delete', 'Delete articles', 'knowledge_articles', 'delete'),
  ('articles.share', 'Share articles with others', 'knowledge_articles', 'share'),
  
  -- Journal entries permissions
  ('entries.create', 'Create new journal entries', 'journal_entries', 'create'),
  ('entries.read', 'Read journal entries', 'journal_entries', 'read'),
  ('entries.update', 'Update journal entries', 'journal_entries', 'update'),
  ('entries.delete', 'Delete journal entries', 'journal_entries', 'delete'),
  ('entries.share', 'Share journal entries with others', 'journal_entries', 'share')
ON CONFLICT (name) DO NOTHING;

-- Step 4: Assign permissions to roles
-- =============================================

-- Owner role (full access to own resources)
INSERT INTO role_permissions (role, permission_id)
SELECT 'owner', id FROM permissions
ON CONFLICT (role, permission_id) DO NOTHING;

-- Admin role (full access)
INSERT INTO role_permissions (role, permission_id)
SELECT 'admin', id FROM permissions
ON CONFLICT (role, permission_id) DO NOTHING;

-- Editor role (can create, read, and update)
INSERT INTO role_permissions (role, permission_id)
SELECT 'editor', id FROM permissions 
WHERE action IN ('create', 'read', 'update')
ON CONFLICT (role, permission_id) DO NOTHING;

-- Viewer role (read-only)
INSERT INTO role_permissions (role, permission_id)
SELECT 'viewer', id FROM permissions 
WHERE action = 'read'
ON CONFLICT (role, permission_id) DO NOTHING;

-- Step 5: Assign default owner role to all existing users
-- =============================================

INSERT INTO user_roles (user_id, role)
SELECT id, 'owner' FROM auth.users
ON CONFLICT (user_id, role) DO NOTHING;

-- Step 6: Create helper functions
-- =============================================

-- Function to check if user has permission
CREATE OR REPLACE FUNCTION user_has_permission(
  p_user_id UUID,
  p_resource_type TEXT,
  p_action TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN role_permissions rp ON ur.role = rp.role
    JOIN permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = p_user_id
      AND p.resource_type = p_resource_type
      AND p.action = p_action
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can access shared resource
CREATE OR REPLACE FUNCTION user_can_access_shared_resource(
  p_user_id UUID,
  p_resource_type TEXT,
  p_resource_id UUID,
  p_action TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM resource_shares rs
    WHERE rs.resource_type = p_resource_type
      AND rs.resource_id = p_resource_id
      AND rs.shared_with_id = p_user_id
      AND (rs.expires_at IS NULL OR rs.expires_at > NOW())
      AND (
        (p_action = 'read' AND rs.permission_level IN ('view', 'edit', 'admin'))
        OR (p_action = 'update' AND rs.permission_level IN ('edit', 'admin'))
        OR (p_action = 'delete' AND rs.permission_level = 'admin')
      )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user owns resource
CREATE OR REPLACE FUNCTION user_owns_resource(
  p_user_id UUID,
  p_resource_type TEXT,
  p_resource_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  CASE p_resource_type
    WHEN 'note' THEN
      RETURN EXISTS (SELECT 1 FROM notes WHERE id = p_resource_id AND user_id = p_user_id);
    WHEN 'task' THEN
      RETURN EXISTS (SELECT 1 FROM tasks WHERE id = p_resource_id AND user_id = p_user_id);
    WHEN 'article' THEN
      RETURN EXISTS (SELECT 1 FROM knowledge_articles WHERE id = p_resource_id AND user_id = p_user_id);
    WHEN 'entry' THEN
      RETURN EXISTS (SELECT 1 FROM journal_entries WHERE id = p_resource_id AND user_id = p_user_id);
    ELSE
      RETURN FALSE;
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 7: Enable RLS on new tables
-- =============================================

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_attributes ENABLE ROW LEVEL SECURITY;

-- Step 8: Create RLS policies for ABAC tables
-- =============================================

-- User roles policies
CREATE POLICY "Users can view own roles"
  ON user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON user_roles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Permissions policies (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view permissions"
  ON permissions FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Role permissions policies (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view role permissions"
  ON role_permissions FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Resource shares policies
CREATE POLICY "Users can view shares they own or are shared with"
  ON resource_shares FOR SELECT
  USING (
    auth.uid() = owner_id 
    OR auth.uid() = shared_with_id
  );

CREATE POLICY "Owners can create shares"
  ON resource_shares FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their shares"
  ON resource_shares FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can delete their shares"
  ON resource_shares FOR DELETE
  USING (auth.uid() = owner_id);

-- Resource attributes policies
CREATE POLICY "Users can view attributes for resources they can access"
  ON resource_attributes FOR SELECT
  USING (
    user_owns_resource(auth.uid(), resource_type, resource_id)
    OR user_can_access_shared_resource(auth.uid(), resource_type, resource_id, 'read')
  );

CREATE POLICY "Users can create attributes for their resources"
  ON resource_attributes FOR INSERT
  WITH CHECK (user_owns_resource(auth.uid(), resource_type, resource_id));

CREATE POLICY "Users can update attributes for their resources"
  ON resource_attributes FOR UPDATE
  USING (user_owns_resource(auth.uid(), resource_type, resource_id))
  WITH CHECK (user_owns_resource(auth.uid(), resource_type, resource_id));

CREATE POLICY "Users can delete attributes for their resources"
  ON resource_attributes FOR DELETE
  USING (user_owns_resource(auth.uid(), resource_type, resource_id));

-- Step 9: Update existing RLS policies to support sharing
-- =============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own notes" ON notes;
DROP POLICY IF EXISTS "Users can create own notes" ON notes;
DROP POLICY IF EXISTS "Users can update own notes" ON notes;
DROP POLICY IF EXISTS "Users can delete own notes" ON notes;

-- Create new ABAC-enabled policies for notes
CREATE POLICY "Users can view own or shared notes"
  ON notes FOR SELECT
  USING (
    auth.uid() = user_id
    OR user_can_access_shared_resource(auth.uid(), 'note', id, 'read')
  );

CREATE POLICY "Users can create notes if they have permission"
  ON notes FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND user_has_permission(auth.uid(), 'notes', 'create')
  );

CREATE POLICY "Users can update own or shared notes"
  ON notes FOR UPDATE
  USING (
    auth.uid() = user_id
    OR user_can_access_shared_resource(auth.uid(), 'note', id, 'update')
  )
  WITH CHECK (
    auth.uid() = user_id
    OR user_can_access_shared_resource(auth.uid(), 'note', id, 'update')
  );

CREATE POLICY "Users can delete own notes"
  ON notes FOR DELETE
  USING (
    auth.uid() = user_id
    AND user_has_permission(auth.uid(), 'notes', 'delete')
  );

-- Similar policies for tasks
DROP POLICY IF EXISTS "Users can view own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can create own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can delete own tasks" ON tasks;

CREATE POLICY "Users can view own or shared tasks"
  ON tasks FOR SELECT
  USING (
    auth.uid() = user_id
    OR user_can_access_shared_resource(auth.uid(), 'task', id, 'read')
  );

CREATE POLICY "Users can create tasks if they have permission"
  ON tasks FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND user_has_permission(auth.uid(), 'tasks', 'create')
  );

CREATE POLICY "Users can update own or shared tasks"
  ON tasks FOR UPDATE
  USING (
    auth.uid() = user_id
    OR user_can_access_shared_resource(auth.uid(), 'task', id, 'update')
  )
  WITH CHECK (
    auth.uid() = user_id
    OR user_can_access_shared_resource(auth.uid(), 'task', id, 'update')
  );

CREATE POLICY "Users can delete own tasks"
  ON tasks FOR DELETE
  USING (
    auth.uid() = user_id
    AND user_has_permission(auth.uid(), 'tasks', 'delete')
  );

-- Similar policies for knowledge articles
DROP POLICY IF EXISTS "Users can view own articles" ON knowledge_articles;
DROP POLICY IF EXISTS "Users can create own articles" ON knowledge_articles;
DROP POLICY IF EXISTS "Users can update own articles" ON knowledge_articles;
DROP POLICY IF EXISTS "Users can delete own articles" ON knowledge_articles;

CREATE POLICY "Users can view own or shared articles"
  ON knowledge_articles FOR SELECT
  USING (
    auth.uid() = user_id
    OR user_can_access_shared_resource(auth.uid(), 'article', id, 'read')
  );

CREATE POLICY "Users can create articles if they have permission"
  ON knowledge_articles FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND user_has_permission(auth.uid(), 'knowledge_articles', 'create')
  );

CREATE POLICY "Users can update own or shared articles"
  ON knowledge_articles FOR UPDATE
  USING (
    auth.uid() = user_id
    OR user_can_access_shared_resource(auth.uid(), 'article', id, 'update')
  )
  WITH CHECK (
    auth.uid() = user_id
    OR user_can_access_shared_resource(auth.uid(), 'article', id, 'update')
  );

CREATE POLICY "Users can delete own articles"
  ON knowledge_articles FOR DELETE
  USING (
    auth.uid() = user_id
    AND user_has_permission(auth.uid(), 'knowledge_articles', 'delete')
  );

-- Similar policies for journal entries
DROP POLICY IF EXISTS "Users can view own entries" ON journal_entries;
DROP POLICY IF EXISTS "Users can create own entries" ON journal_entries;
DROP POLICY IF EXISTS "Users can update own entries" ON journal_entries;
DROP POLICY IF EXISTS "Users can delete own entries" ON journal_entries;

CREATE POLICY "Users can view own or shared entries"
  ON journal_entries FOR SELECT
  USING (
    auth.uid() = user_id
    OR user_can_access_shared_resource(auth.uid(), 'entry', id, 'read')
  );

CREATE POLICY "Users can create entries if they have permission"
  ON journal_entries FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND user_has_permission(auth.uid(), 'journal_entries', 'create')
  );

CREATE POLICY "Users can update own or shared entries"
  ON journal_entries FOR UPDATE
  USING (
    auth.uid() = user_id
    OR user_can_access_shared_resource(auth.uid(), 'entry', id, 'update')
  )
  WITH CHECK (
    auth.uid() = user_id
    OR user_can_access_shared_resource(auth.uid(), 'entry', id, 'update')
  );

CREATE POLICY "Users can delete own entries"
  ON journal_entries FOR DELETE
  USING (
    auth.uid() = user_id
    AND user_has_permission(auth.uid(), 'journal_entries', 'delete')
  );
