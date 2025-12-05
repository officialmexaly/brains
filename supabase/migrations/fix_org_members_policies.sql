-- Fix for Infinite Recursion in organization_members RLS Policies
-- Run this in Supabase SQL Editor to fix the error

-- Drop the problematic policies
DROP POLICY IF EXISTS "Users can view members of their organizations" ON organization_members;
DROP POLICY IF EXISTS "Admins can manage members" ON organization_members;

-- Create corrected policies (using EXISTS to avoid recursion)
CREATE POLICY "Users can view members of their organizations"
  ON organization_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om_check
      WHERE om_check.organization_id = organization_members.organization_id 
      AND om_check.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage members"
  ON organization_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om_check
      WHERE om_check.organization_id = organization_members.organization_id 
      AND om_check.user_id = auth.uid() 
      AND om_check.role IN ('owner', 'admin')
    )
  );
