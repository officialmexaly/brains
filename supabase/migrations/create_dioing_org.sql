-- Create Dioing Organization and Add User
-- Run this in Supabase SQL Editor

-- Create the Dioing organization
INSERT INTO organizations (name, slug, description)
VALUES (
  'Dioing',
  'dioing',
  'Dioing organization workspace'
)
ON CONFLICT (slug) DO NOTHING
RETURNING id;

-- Add user to the organization as owner
-- Note: Replace the organization_id below with the actual ID returned from the INSERT above
-- Or use this combined approach:

DO $$
DECLARE
  v_org_id UUID;
BEGIN
  -- Create or get the organization
  INSERT INTO organizations (name, slug, description)
  VALUES ('Dioing', 'dioing', 'Dioing organization workspace')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO v_org_id;

  -- Add user as owner
  INSERT INTO organization_members (organization_id, user_id, role)
  VALUES (v_org_id, 'fe12e390-171a-4b86-8536-ee75f088358d', 'owner')
  ON CONFLICT (organization_id, user_id) DO UPDATE SET role = 'owner';

  -- Update user profile with organization
  UPDATE user_profiles
  SET organization_id = v_org_id
  WHERE user_id = 'fe12e390-171a-4b86-8536-ee75f088358d';

  -- Update user settings with organization
  UPDATE user_settings
  SET organization_id = v_org_id
  WHERE user_id = 'fe12e390-171a-4b86-8536-ee75f088358d';

  RAISE NOTICE 'Organization created with ID: %', v_org_id;
END $$;

-- Verify the organization was created
SELECT 
  o.id,
  o.name,
  o.slug,
  om.user_id,
  om.role,
  om.joined_at
FROM organizations o
JOIN organization_members om ON o.id = om.organization_id
WHERE o.slug = 'dioing';
