-- Multi-Tenant Organization System with ABAC
-- This creates a complete multi-tenant architecture with organizations and fine-grained permissions

-- =============================================
-- PART 1: ORGANIZATIONS & USERS
-- =============================================

-- Organizations table (multi-tenancy)
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organization members (users belong to organizations)
CREATE TABLE IF NOT EXISTS organization_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member', 'guest')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

-- User avatars table (instead of storage bucket)
CREATE TABLE IF NOT EXISTS user_avatars (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_data BYTEA NOT NULL, -- Binary data
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- PART 2: ABAC PERMISSIONS SYSTEM
-- =============================================

-- Resources that can have permissions
CREATE TABLE IF NOT EXISTS resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resource_type TEXT NOT NULL, -- 'note', 'task', 'article', 'entry', 'organization', etc.
  resource_id UUID NOT NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(resource_type, resource_id)
);

-- Permission types
CREATE TABLE IF NOT EXISTS permission_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User permissions (fine-grained access control)
CREATE TABLE IF NOT EXISTS user_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_type TEXT NOT NULL,
  resource_id UUID NOT NULL,
  permission_type TEXT NOT NULL, -- 'read', 'write', 'delete', 'share', 'admin'
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  UNIQUE(user_id, resource_type, resource_id, permission_type)
);

-- Role-based permissions (permissions assigned to roles)
CREATE TABLE IF NOT EXISTS role_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  permission_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(role, resource_type, permission_type)
);

-- Permission conditions (attribute-based conditions)
CREATE TABLE IF NOT EXISTS permission_conditions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  permission_id UUID REFERENCES user_permissions(id) ON DELETE CASCADE,
  attribute_key TEXT NOT NULL,
  attribute_value TEXT NOT NULL,
  operator TEXT NOT NULL CHECK (operator IN ('equals', 'not_equals', 'contains', 'greater_than', 'less_than')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- PART 3: UPDATE EXISTING TABLES FOR MULTI-TENANCY
-- =============================================

-- Add organization_id to user_profiles
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL;

-- Add organization_id to user_settings
ALTER TABLE user_settings 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL;

-- Add organization_id to notes
ALTER TABLE notes 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Add organization_id to tasks
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Add organization_id to knowledge_articles
ALTER TABLE knowledge_articles 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Add organization_id to journal_entries
ALTER TABLE journal_entries 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- =============================================
-- PART 4: INDEXES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_org_members_org_id ON organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user_id ON organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_user_avatars_user_id ON user_avatars(user_id);
CREATE INDEX IF NOT EXISTS idx_resources_type_id ON resources(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_resources_org_id ON resources(organization_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_resource ON user_permissions(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON role_permissions(role);

-- =============================================
-- PART 5: RLS POLICIES
-- =============================================

-- Enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_avatars ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE permission_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE permission_conditions ENABLE ROW LEVEL SECURITY;

-- Organizations policies
CREATE POLICY "Users can view organizations they belong to"
  ON organizations FOR SELECT
  USING (
    id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Organization owners can update"
  ON organizations FOR UPDATE
  USING (
    id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Organization members policies
CREATE POLICY "Users can view members of their organizations"
  ON organization_members FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage members"
  ON organization_members FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- User avatars policies
CREATE POLICY "Users can view own avatar"
  ON user_avatars FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own avatar"
  ON user_avatars FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own avatar"
  ON user_avatars FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own avatar"
  ON user_avatars FOR DELETE
  USING (auth.uid() = user_id);

-- Permission types policies (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view permission types"
  ON permission_types FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- User permissions policies
CREATE POLICY "Users can view permissions granted to them"
  ON user_permissions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Resource owners can grant permissions"
  ON user_permissions FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT owner_id FROM resources 
      WHERE resource_type = user_permissions.resource_type 
      AND resource_id = user_permissions.resource_id
    )
  );

CREATE POLICY "Resource owners can revoke permissions"
  ON user_permissions FOR DELETE
  USING (
    auth.uid() IN (
      SELECT owner_id FROM resources 
      WHERE resource_type = user_permissions.resource_type 
      AND resource_id = user_permissions.resource_id
    )
  );

-- =============================================
-- PART 6: HELPER FUNCTIONS
-- =============================================

-- Function to check if user has permission
CREATE OR REPLACE FUNCTION has_permission(
  p_user_id UUID,
  p_resource_type TEXT,
  p_resource_id UUID,
  p_permission_type TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_has_permission BOOLEAN;
  v_user_role TEXT;
BEGIN
  -- Check if user is the owner
  IF EXISTS (
    SELECT 1 FROM resources 
    WHERE resource_type = p_resource_type 
    AND resource_id = p_resource_id 
    AND owner_id = p_user_id
  ) THEN
    RETURN TRUE;
  END IF;

  -- Check direct user permission
  IF EXISTS (
    SELECT 1 FROM user_permissions 
    WHERE user_id = p_user_id 
    AND resource_type = p_resource_type 
    AND resource_id = p_resource_id 
    AND permission_type = p_permission_type
    AND (expires_at IS NULL OR expires_at > NOW())
  ) THEN
    RETURN TRUE;
  END IF;

  -- Check role-based permission
  SELECT role INTO v_user_role
  FROM organization_members om
  JOIN resources r ON r.organization_id = om.organization_id
  WHERE om.user_id = p_user_id
  AND r.resource_type = p_resource_type
  AND r.resource_id = p_resource_id
  LIMIT 1;

  IF v_user_role IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM role_permissions 
      WHERE role = v_user_role 
      AND resource_type = p_resource_type 
      AND permission_type = p_permission_type
    ) THEN
      RETURN TRUE;
    END IF;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's organization
CREATE OR REPLACE FUNCTION get_user_organization(p_user_id UUID)
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT organization_id 
    FROM organization_members 
    WHERE user_id = p_user_id 
    ORDER BY joined_at ASC 
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create organization with owner
CREATE OR REPLACE FUNCTION create_organization(
  p_name TEXT,
  p_slug TEXT,
  p_user_id UUID
)
RETURNS UUID AS $$
DECLARE
  v_org_id UUID;
BEGIN
  -- Create organization
  INSERT INTO organizations (name, slug)
  VALUES (p_name, p_slug)
  RETURNING id INTO v_org_id;

  -- Add user as owner
  INSERT INTO organization_members (organization_id, user_id, role)
  VALUES (v_org_id, p_user_id, 'owner');

  RETURN v_org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- PART 7: INSERT DEFAULT PERMISSION TYPES
-- =============================================

INSERT INTO permission_types (name, description) VALUES
  ('read', 'Can view/read the resource'),
  ('write', 'Can edit/update the resource'),
  ('delete', 'Can delete the resource'),
  ('share', 'Can share the resource with others'),
  ('admin', 'Full administrative access to the resource'),
  ('comment', 'Can add comments to the resource'),
  ('export', 'Can export the resource data')
ON CONFLICT (name) DO NOTHING;

-- =============================================
-- PART 8: INSERT DEFAULT ROLE PERMISSIONS
-- =============================================

-- Owner role has all permissions
INSERT INTO role_permissions (role, resource_type, permission_type)
SELECT 'owner', rt.resource_type, pt.name
FROM (VALUES ('note'), ('task'), ('article'), ('entry')) AS rt(resource_type)
CROSS JOIN permission_types pt
ON CONFLICT (role, resource_type, permission_type) DO NOTHING;

-- Admin role has most permissions (except some admin-only actions)
INSERT INTO role_permissions (role, resource_type, permission_type)
SELECT 'admin', rt.resource_type, pt.name
FROM (VALUES ('note'), ('task'), ('article'), ('entry')) AS rt(resource_type)
CROSS JOIN permission_types pt
WHERE pt.name IN ('read', 'write', 'delete', 'share', 'comment', 'export')
ON CONFLICT (role, resource_type, permission_type) DO NOTHING;

-- Member role has basic permissions
INSERT INTO role_permissions (role, resource_type, permission_type)
SELECT 'member', rt.resource_type, pt.name
FROM (VALUES ('note'), ('task'), ('article'), ('entry')) AS rt(resource_type)
CROSS JOIN permission_types pt
WHERE pt.name IN ('read', 'write', 'comment')
ON CONFLICT (role, resource_type, permission_type) DO NOTHING;

-- Guest role has read-only access
INSERT INTO role_permissions (role, resource_type, permission_type)
SELECT 'guest', rt.resource_type, 'read'
FROM (VALUES ('note'), ('task'), ('article'), ('entry')) AS rt(resource_type)
ON CONFLICT (role, resource_type, permission_type) DO NOTHING;

-- =============================================
-- PART 9: UPDATE EXISTING RLS POLICIES FOR MULTI-TENANCY
-- =============================================

-- Drop old policies for notes
DROP POLICY IF EXISTS "Users can view own or shared notes" ON notes;
DROP POLICY IF EXISTS "Users can create notes if they have permission" ON notes;
DROP POLICY IF EXISTS "Users can update own or shared notes" ON notes;
DROP POLICY IF EXISTS "Users can delete own notes" ON notes;

-- New multi-tenant policies for notes
CREATE POLICY "Users can view notes in their organization"
  ON notes FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
    AND (
      user_id = auth.uid()
      OR has_permission(auth.uid(), 'note', id, 'read')
    )
  );

CREATE POLICY "Users can create notes in their organization"
  ON notes FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND organization_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update notes they have permission for"
  ON notes FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
    AND (
      user_id = auth.uid()
      OR has_permission(auth.uid(), 'note', id, 'write')
    )
  );

CREATE POLICY "Users can delete notes they have permission for"
  ON notes FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
    AND (
      user_id = auth.uid()
      OR has_permission(auth.uid(), 'note', id, 'delete')
    )
  );

-- Similar policies for tasks
DROP POLICY IF EXISTS "Users can view own or shared tasks" ON tasks;
DROP POLICY IF EXISTS "Users can create tasks if they have permission" ON tasks;
DROP POLICY IF EXISTS "Users can update own or shared tasks" ON tasks;
DROP POLICY IF EXISTS "Users can delete own tasks" ON tasks;

CREATE POLICY "Users can view tasks in their organization"
  ON tasks FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
    AND (
      user_id = auth.uid()
      OR has_permission(auth.uid(), 'task', id, 'read')
    )
  );

CREATE POLICY "Users can create tasks in their organization"
  ON tasks FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND organization_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update tasks they have permission for"
  ON tasks FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
    AND (
      user_id = auth.uid()
      OR has_permission(auth.uid(), 'task', id, 'write')
    )
  );

CREATE POLICY "Users can delete tasks they have permission for"
  ON tasks FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
    AND (
      user_id = auth.uid()
      OR has_permission(auth.uid(), 'task', id, 'delete')
    )
  );

-- =============================================
-- PART 10: TRIGGERS
-- =============================================

-- Trigger to auto-assign organization to new users
CREATE OR REPLACE FUNCTION assign_user_to_organization()
RETURNS TRIGGER AS $$
DECLARE
  v_org_id UUID;
BEGIN
  -- Check if user already has an organization
  SELECT organization_id INTO v_org_id
  FROM organization_members
  WHERE user_id = NEW.id
  LIMIT 1;

  -- If no organization, create a personal one
  IF v_org_id IS NULL THEN
    v_org_id := create_organization(
      'Personal Workspace',
      'personal-' || NEW.id::text,
      NEW.id
    );
  END IF;

  -- Update user profile with organization
  UPDATE user_profiles
  SET organization_id = v_org_id
  WHERE user_id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS assign_org_on_user_created ON auth.users;
CREATE TRIGGER assign_org_on_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION assign_user_to_organization();

-- Trigger to create resource entry when note/task/etc is created
CREATE OR REPLACE FUNCTION create_resource_entry()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO resources (resource_type, resource_id, organization_id, owner_id)
  VALUES (TG_ARGV[0], NEW.id, NEW.organization_id, NEW.user_id)
  ON CONFLICT (resource_type, resource_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS create_note_resource ON notes;
CREATE TRIGGER create_note_resource
  AFTER INSERT ON notes
  FOR EACH ROW
  EXECUTE FUNCTION create_resource_entry('note');

DROP TRIGGER IF EXISTS create_task_resource ON tasks;
CREATE TRIGGER create_task_resource
  AFTER INSERT ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION create_resource_entry('task');
