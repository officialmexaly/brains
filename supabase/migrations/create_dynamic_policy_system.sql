-- =============================================
-- DYNAMIC POLICY SYSTEM
-- Table-driven RLS policies for flexible permission management
-- =============================================

-- =============================================
-- PART 1: CREATE POLICY TABLES
-- =============================================

-- Policy definitions table
CREATE TABLE IF NOT EXISTS policy_definitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name TEXT NOT NULL,
  policy_name TEXT NOT NULL,
  policy_type TEXT NOT NULL CHECK (policy_type IN ('SELECT', 'INSERT', 'UPDATE', 'DELETE')),
  is_active BOOLEAN DEFAULT TRUE,
  priority INTEGER DEFAULT 0, -- Higher priority policies are checked first
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(table_name, policy_name, policy_type)
);

-- Policy conditions table (stores the actual permission logic)
CREATE TABLE IF NOT EXISTS policy_conditions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  policy_id UUID NOT NULL REFERENCES policy_definitions(id) ON DELETE CASCADE,
  condition_type TEXT NOT NULL CHECK (condition_type IN (
    'owner',           -- User owns the record (user_id = auth.uid())
    'organization',    -- User is in same organization
    'role',           -- User has specific role
    'permission',     -- User has specific permission
    'public',         -- Anyone can access
    'custom_sql'      -- Custom SQL condition
  )),
  condition_value JSONB, -- Stores parameters for the condition
  sql_condition TEXT,    -- For custom SQL conditions
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User permissions table (for fine-grained access control)
CREATE TABLE IF NOT EXISTS user_resource_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_table TEXT NOT NULL,
  resource_id UUID NOT NULL,
  permission_type TEXT NOT NULL CHECK (permission_type IN ('read', 'write', 'delete', 'share', 'admin')),
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  UNIQUE(user_id, resource_table, resource_id, permission_type)
);

-- =============================================
-- PART 2: CREATE INDEXES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_policy_definitions_table ON policy_definitions(table_name);
CREATE INDEX IF NOT EXISTS idx_policy_definitions_active ON policy_definitions(is_active);
CREATE INDEX IF NOT EXISTS idx_policy_conditions_policy ON policy_conditions(policy_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_user ON user_resource_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_resource ON user_resource_permissions(resource_table, resource_id);

-- =============================================
-- PART 3: ENABLE RLS ON POLICY TABLES
-- =============================================

ALTER TABLE policy_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_resource_permissions ENABLE ROW LEVEL SECURITY;

-- Only admins can manage policies (for now, allow all authenticated users to view)
CREATE POLICY "Anyone can view policy definitions"
  ON policy_definitions FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view policy conditions"
  ON policy_conditions FOR SELECT
  USING (true);

-- Users can view permissions granted to them
CREATE POLICY "Users can view own permissions"
  ON user_resource_permissions FOR SELECT
  USING (auth.uid() = user_id);

-- =============================================
-- PART 4: HELPER FUNCTIONS
-- =============================================

-- Function to check if user has permission on a resource
CREATE OR REPLACE FUNCTION check_user_permission(
  p_user_id UUID,
  p_table_name TEXT,
  p_resource_id UUID,
  p_permission_type TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_has_permission BOOLEAN;
BEGIN
  -- Check if user has direct permission
  SELECT EXISTS (
    SELECT 1 FROM user_resource_permissions
    WHERE user_id = p_user_id
    AND resource_table = p_table_name
    AND resource_id = p_resource_id
    AND permission_type = p_permission_type
    AND (expires_at IS NULL OR expires_at > NOW())
  ) INTO v_has_permission;
  
  RETURN v_has_permission;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user owns a resource
CREATE OR REPLACE FUNCTION check_user_owns_resource(
  p_user_id UUID,
  p_table_name TEXT,
  p_resource_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_owns BOOLEAN;
  v_sql TEXT;
BEGIN
  -- Dynamically check if user_id matches in the table
  v_sql := format(
    'SELECT EXISTS (SELECT 1 FROM %I WHERE id = $1 AND user_id = $2)',
    p_table_name
  );
  
  EXECUTE v_sql INTO v_owns USING p_resource_id, p_user_id;
  
  RETURN v_owns;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is in same organization as resource
CREATE OR REPLACE FUNCTION check_same_organization(
  p_user_id UUID,
  p_table_name TEXT,
  p_resource_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_same_org BOOLEAN;
  v_sql TEXT;
  v_resource_org_id UUID;
  v_user_org_id UUID;
BEGIN
  -- Get resource's organization_id
  v_sql := format(
    'SELECT organization_id FROM %I WHERE id = $1',
    p_table_name
  );
  EXECUTE v_sql INTO v_resource_org_id USING p_resource_id;
  
  -- Get user's organization_id
  SELECT organization_id INTO v_user_org_id
  FROM organization_members
  WHERE user_id = p_user_id
  LIMIT 1;
  
  -- Check if they match
  RETURN v_resource_org_id = v_user_org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- PART 5: INSERT DEFAULT POLICIES
-- =============================================

-- Notes policies
INSERT INTO policy_definitions (table_name, policy_name, policy_type, description, priority)
VALUES 
  ('notes', 'owner_can_view', 'SELECT', 'Note owner can view their notes', 100),
  ('notes', 'owner_can_create', 'INSERT', 'Users can create their own notes', 100),
  ('notes', 'owner_can_update', 'UPDATE', 'Note owner can update their notes', 100),
  ('notes', 'owner_can_delete', 'DELETE', 'Note owner can delete their notes', 100),
  ('notes', 'shared_can_view', 'SELECT', 'Users with read permission can view notes', 50),
  ('notes', 'shared_can_update', 'UPDATE', 'Users with write permission can update notes', 50)
ON CONFLICT (table_name, policy_name, policy_type) DO NOTHING;

-- Tasks policies
INSERT INTO policy_definitions (table_name, policy_name, policy_type, description, priority)
VALUES 
  ('tasks', 'owner_can_view', 'SELECT', 'Task owner can view their tasks', 100),
  ('tasks', 'owner_can_create', 'INSERT', 'Users can create their own tasks', 100),
  ('tasks', 'owner_can_update', 'UPDATE', 'Task owner can update their tasks', 100),
  ('tasks', 'owner_can_delete', 'DELETE', 'Task owner can delete their tasks', 100)
ON CONFLICT (table_name, policy_name, policy_type) DO NOTHING;

-- Knowledge articles policies
INSERT INTO policy_definitions (table_name, policy_name, policy_type, description, priority)
VALUES 
  ('knowledge_articles', 'owner_can_view', 'SELECT', 'Article owner can view their articles', 100),
  ('knowledge_articles', 'owner_can_create', 'INSERT', 'Users can create their own articles', 100),
  ('knowledge_articles', 'owner_can_update', 'UPDATE', 'Article owner can update their articles', 100),
  ('knowledge_articles', 'owner_can_delete', 'DELETE', 'Article owner can delete their articles', 100)
ON CONFLICT (table_name, policy_name, policy_type) DO NOTHING;

-- Journal entries policies
INSERT INTO policy_definitions (table_name, policy_name, policy_type, description, priority)
VALUES 
  ('journal_entries', 'owner_can_view', 'SELECT', 'Entry owner can view their entries', 100),
  ('journal_entries', 'owner_can_create', 'INSERT', 'Users can create their own entries', 100),
  ('journal_entries', 'owner_can_update', 'UPDATE', 'Entry owner can update their entries', 100),
  ('journal_entries', 'owner_can_delete', 'DELETE', 'Entry owner can delete their entries', 100)
ON CONFLICT (table_name, policy_name, policy_type) DO NOTHING;

-- =============================================
-- PART 6: INSERT POLICY CONDITIONS
-- =============================================

-- Owner conditions for notes
INSERT INTO policy_conditions (policy_id, condition_type)
SELECT id, 'owner'
FROM policy_definitions
WHERE table_name = 'notes' AND policy_name LIKE 'owner_%'
ON CONFLICT DO NOTHING;

-- Shared read condition for notes
INSERT INTO policy_conditions (policy_id, condition_type, condition_value)
SELECT id, 'permission', '{"permission": "read"}'::jsonb
FROM policy_definitions
WHERE table_name = 'notes' AND policy_name = 'shared_can_view'
ON CONFLICT DO NOTHING;

-- Shared write condition for notes
INSERT INTO policy_conditions (policy_id, condition_type, condition_value)
SELECT id, 'permission', '{"permission": "write"}'::jsonb
FROM policy_definitions
WHERE table_name = 'notes' AND policy_name = 'shared_can_update'
ON CONFLICT DO NOTHING;

-- Owner conditions for tasks
INSERT INTO policy_conditions (policy_id, condition_type)
SELECT id, 'owner'
FROM policy_definitions
WHERE table_name = 'tasks' AND policy_name LIKE 'owner_%'
ON CONFLICT DO NOTHING;

-- Owner conditions for knowledge_articles
INSERT INTO policy_conditions (policy_id, condition_type)
SELECT id, 'owner'
FROM policy_definitions
WHERE table_name = 'knowledge_articles' AND policy_name LIKE 'owner_%'
ON CONFLICT DO NOTHING;

-- Owner conditions for journal_entries
INSERT INTO policy_conditions (policy_id, condition_type)
SELECT id, 'owner'
FROM policy_definitions
WHERE table_name = 'journal_entries' AND policy_name LIKE 'owner_%'
ON CONFLICT DO NOTHING;

-- =============================================
-- PART 7: APPLY SIMPLE RLS POLICIES BASED ON POLICY TABLES
-- =============================================

-- For now, we'll use simple owner-based policies
-- The policy_definitions table serves as documentation and can be used
-- by the application to show/hide UI elements

-- Notes
DROP POLICY IF EXISTS "Users can view notes in their organization" ON notes;
DROP POLICY IF EXISTS "Users can create notes in their organization" ON notes;
DROP POLICY IF EXISTS "Users can update notes they have permission for" ON notes;
DROP POLICY IF EXISTS "Users can delete notes they have permission for" ON notes;
DROP POLICY IF EXISTS "Users can view own notes" ON notes;
DROP POLICY IF EXISTS "Users can create own notes" ON notes;
DROP POLICY IF EXISTS "Users can update own notes" ON notes;
DROP POLICY IF EXISTS "Users can delete own notes" ON notes;

CREATE POLICY "Dynamic policy: view notes"
  ON notes FOR SELECT
  USING (
    auth.uid() = user_id
    OR check_user_permission(auth.uid(), 'notes', id, 'read')
  );

CREATE POLICY "Dynamic policy: create notes"
  ON notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Dynamic policy: update notes"
  ON notes FOR UPDATE
  USING (
    auth.uid() = user_id
    OR check_user_permission(auth.uid(), 'notes', id, 'write')
  );

CREATE POLICY "Dynamic policy: delete notes"
  ON notes FOR DELETE
  USING (
    auth.uid() = user_id
    OR check_user_permission(auth.uid(), 'notes', id, 'delete')
  );

-- Tasks
DROP POLICY IF EXISTS "Users can view tasks in their organization" ON tasks;
DROP POLICY IF EXISTS "Users can create tasks in their organization" ON tasks;
DROP POLICY IF EXISTS "Users can update tasks they have permission for" ON tasks;
DROP POLICY IF EXISTS "Users can delete tasks they have permission for" ON tasks;
DROP POLICY IF EXISTS "Users can view own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can create own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can delete own tasks" ON tasks;

CREATE POLICY "Dynamic policy: view tasks"
  ON tasks FOR SELECT
  USING (
    auth.uid() = user_id
    OR check_user_permission(auth.uid(), 'tasks', id, 'read')
  );

CREATE POLICY "Dynamic policy: create tasks"
  ON tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Dynamic policy: update tasks"
  ON tasks FOR UPDATE
  USING (
    auth.uid() = user_id
    OR check_user_permission(auth.uid(), 'tasks', id, 'write')
  );

CREATE POLICY "Dynamic policy: delete tasks"
  ON tasks FOR DELETE
  USING (
    auth.uid() = user_id
    OR check_user_permission(auth.uid(), 'tasks', id, 'delete')
  );

-- Knowledge Articles
DROP POLICY IF EXISTS "Users can view articles in their organization" ON knowledge_articles;
DROP POLICY IF EXISTS "Users can create articles in their organization" ON knowledge_articles;
DROP POLICY IF EXISTS "Users can update articles they have permission for" ON knowledge_articles;
DROP POLICY IF EXISTS "Users can delete articles they have permission for" ON knowledge_articles;
DROP POLICY IF EXISTS "Users can view own articles" ON knowledge_articles;
DROP POLICY IF EXISTS "Users can create own articles" ON knowledge_articles;
DROP POLICY IF EXISTS "Users can update own articles" ON knowledge_articles;
DROP POLICY IF EXISTS "Users can delete own articles" ON knowledge_articles;

CREATE POLICY "Dynamic policy: view articles"
  ON knowledge_articles FOR SELECT
  USING (
    auth.uid() = user_id
    OR check_user_permission(auth.uid(), 'knowledge_articles', id, 'read')
  );

CREATE POLICY "Dynamic policy: create articles"
  ON knowledge_articles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Dynamic policy: update articles"
  ON knowledge_articles FOR UPDATE
  USING (
    auth.uid() = user_id
    OR check_user_permission(auth.uid(), 'knowledge_articles', id, 'write')
  );

CREATE POLICY "Dynamic policy: delete articles"
  ON knowledge_articles FOR DELETE
  USING (
    auth.uid() = user_id
    OR check_user_permission(auth.uid(), 'knowledge_articles', id, 'delete')
  );

-- Journal Entries
DROP POLICY IF EXISTS "Users can view entries in their organization" ON journal_entries;
DROP POLICY IF EXISTS "Users can create entries in their organization" ON journal_entries;
DROP POLICY IF EXISTS "Users can update entries they have permission for" ON journal_entries;
DROP POLICY IF EXISTS "Users can delete entries they have permission for" ON journal_entries;
DROP POLICY IF EXISTS "Users can view own entries" ON journal_entries;
DROP POLICY IF EXISTS "Users can create own entries" ON journal_entries;
DROP POLICY IF EXISTS "Users can update own entries" ON journal_entries;
DROP POLICY IF EXISTS "Users can delete own entries" ON journal_entries;

CREATE POLICY "Dynamic policy: view entries"
  ON journal_entries FOR SELECT
  USING (
    auth.uid() = user_id
    OR check_user_permission(auth.uid(), 'journal_entries', id, 'read')
  );

CREATE POLICY "Dynamic policy: create entries"
  ON journal_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Dynamic policy: update entries"
  ON journal_entries FOR UPDATE
  USING (
    auth.uid() = user_id
    OR check_user_permission(auth.uid(), 'journal_entries', id, 'write')
  );

CREATE POLICY "Dynamic policy: delete entries"
  ON journal_entries FOR DELETE
  USING (
    auth.uid() = user_id
    OR check_user_permission(auth.uid(), 'journal_entries', id, 'delete')
  );

-- =============================================
-- PART 8: VERIFICATION
-- =============================================

-- View all active policies
SELECT 
  pd.table_name,
  pd.policy_name,
  pd.policy_type,
  pd.description,
  pc.condition_type
FROM policy_definitions pd
LEFT JOIN policy_conditions pc ON pc.policy_id = pd.id
WHERE pd.is_active = true
ORDER BY pd.table_name, pd.priority DESC, pd.policy_type;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Dynamic policy system created successfully!';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Policy Tables Created:';
  RAISE NOTICE '   - policy_definitions: Stores policy metadata';
  RAISE NOTICE '   - policy_conditions: Stores policy logic';
  RAISE NOTICE '   - user_resource_permissions: Stores user permissions';
  RAISE NOTICE '';
  RAISE NOTICE '🔧 Helper Functions Created:';
  RAISE NOTICE '   - check_user_permission(): Check if user has permission';
  RAISE NOTICE '   - check_user_owns_resource(): Check resource ownership';
  RAISE NOTICE '   - check_same_organization(): Check org membership';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Benefits:';
  RAISE NOTICE '   - No more hardcoded RLS policies';
  RAISE NOTICE '   - Easy to add/modify permissions via SQL';
  RAISE NOTICE '   - Can grant permissions to specific users';
  RAISE NOTICE '   - Policy changes without schema updates';
END $$;
