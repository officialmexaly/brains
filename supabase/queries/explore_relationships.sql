-- Database Relationships Explorer
-- Run these queries in Supabase SQL Editor to see what's connected to what

-- =============================================
-- 1. VIEW ALL FOREIGN KEY RELATIONSHIPS
-- =============================================
-- This shows every table connection in your database

SELECT 
    tc.table_name AS "From Table",
    kcu.column_name AS "From Column",
    ccu.table_name AS "To Table",
    ccu.column_name AS "To Column",
    tc.constraint_name AS "Constraint Name"
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- =============================================
-- 2. ORGANIZATION-CENTRIC VIEW
-- =============================================
-- See what's connected to organizations

SELECT 
    'organizations' as "Main Table",
    om.organization_id,
    o.name as "Organization Name",
    COUNT(DISTINCT om.user_id) as "Members",
    COUNT(DISTINCT n.id) as "Notes",
    COUNT(DISTINCT t.id) as "Tasks",
    COUNT(DISTINCT ka.id) as "Articles",
    COUNT(DISTINCT je.id) as "Journal Entries"
FROM organizations o
LEFT JOIN organization_members om ON o.id = om.organization_id
LEFT JOIN notes n ON o.id = n.organization_id
LEFT JOIN tasks t ON o.id = t.organization_id
LEFT JOIN knowledge_articles ka ON o.id = ka.organization_id
LEFT JOIN journal_entries je ON o.id = je.organization_id
GROUP BY om.organization_id, o.id, o.name;

-- =============================================
-- 3. USER-CENTRIC VIEW
-- =============================================
-- See what's connected to a specific user

SELECT 
    u.id as "User ID",
    u.email as "Email",
    up.display_name as "Display Name",
    om.role as "Role in Org",
    o.name as "Organization",
    COUNT(DISTINCT n.id) as "Notes Created",
    COUNT(DISTINCT t.id) as "Tasks Created",
    COUNT(DISTINCT ka.id) as "Articles Created",
    COUNT(DISTINCT je.id) as "Journal Entries"
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.user_id
LEFT JOIN organization_members om ON u.id = om.user_id
LEFT JOIN organizations o ON om.organization_id = o.id
LEFT JOIN notes n ON u.id = n.user_id
LEFT JOIN tasks t ON u.id = t.user_id
LEFT JOIN knowledge_articles ka ON u.id = ka.user_id
LEFT JOIN journal_entries je ON u.id = je.user_id
GROUP BY u.id, u.email, up.display_name, om.role, o.name;

-- =============================================
-- 4. PERMISSIONS VIEW
-- =============================================
-- See all permission relationships

SELECT 
    u.email as "User",
    up.permission_type as "Permission",
    up.resource_type as "Resource Type",
    up.resource_id as "Resource ID",
    granted_by_user.email as "Granted By",
    up.granted_at as "Granted At",
    up.expires_at as "Expires At"
FROM user_permissions up
JOIN auth.users u ON up.user_id = u.id
LEFT JOIN auth.users granted_by_user ON up.granted_by = granted_by_user.id
ORDER BY u.email, up.resource_type;

-- =============================================
-- 5. ROLE PERMISSIONS VIEW
-- =============================================
-- See what each role can do

SELECT 
    rp.role as "Role",
    rp.resource_type as "Resource Type",
    STRING_AGG(rp.permission_type, ', ') as "Permissions"
FROM role_permissions rp
GROUP BY rp.role, rp.resource_type
ORDER BY rp.role, rp.resource_type;

-- =============================================
-- 6. COMPLETE RESOURCE TRACKING
-- =============================================
-- See all resources and their owners

SELECT 
    r.resource_type as "Type",
    r.resource_id as "ID",
    o.name as "Organization",
    u.email as "Owner",
    r.created_at as "Created"
FROM resources r
LEFT JOIN organizations o ON r.organization_id = o.id
LEFT JOIN auth.users u ON r.owner_id = u.id
ORDER BY r.resource_type, r.created_at DESC;

-- =============================================
-- 7. TABLE SIZES & ROW COUNTS
-- =============================================
-- See how much data is in each table

SELECT 
    schemaname as "Schema",
    tablename as "Table",
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as "Total Size",
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as "Table Size",
    (SELECT COUNT(*) FROM information_schema.columns 
     WHERE table_schema = schemaname AND table_name = tablename) as "Columns"
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- =============================================
-- 8. VISUAL RELATIONSHIP MAP (Text-based)
-- =============================================
-- Shows the hierarchy of relationships

SELECT '
DATABASE RELATIONSHIP MAP
========================

auth.users (Central User Table)
├── user_profiles (1:1)
│   └── organization_id → organizations
├── user_settings (1:1)
│   └── organization_id → organizations
├── user_avatars (1:1)
├── organization_members (Many:Many with organizations)
│   ├── organization_id → organizations
│   └── role (owner/admin/member/guest)
├── notes (1:Many)
│   ├── organization_id → organizations
│   └── attachments (1:Many)
├── tasks (1:Many)
│   └── organization_id → organizations
├── knowledge_articles (1:Many)
│   └── organization_id → organizations
├── journal_entries (1:Many)
│   └── organization_id → organizations
├── user_permissions (1:Many)
│   ├── resource_type + resource_id → resources
│   └── granted_by → auth.users
└── resources (1:Many)
    ├── organization_id → organizations
    └── owner_id → auth.users

organizations (Tenant Isolation)
├── organization_members (Many:Many with users)
├── notes (1:Many)
├── tasks (1:Many)
├── knowledge_articles (1:Many)
├── journal_entries (1:Many)
└── resources (1:Many)

ABAC System
├── permission_types (Lookup table)
├── user_permissions (User-specific permissions)
├── role_permissions (Role-based permissions)
└── permission_conditions (Attribute conditions)
' as "Relationship Map";

-- =============================================
-- 9. SPECIFIC USER QUERY
-- =============================================
-- Replace USER_ID with actual user ID to see their connections

-- Example for your user:
SELECT 
    'User Details' as "Section",
    u.email,
    up.display_name,
    o.name as organization,
    om.role
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.user_id
LEFT JOIN organization_members om ON u.id = om.user_id
LEFT JOIN organizations o ON om.organization_id = o.id
WHERE u.id = 'fe12e390-171a-4b86-8536-ee75f088358d'

UNION ALL

SELECT 
    'User Resources' as "Section",
    'Notes' as type,
    COUNT(*)::text,
    NULL,
    NULL
FROM notes WHERE user_id = 'fe12e390-171a-4b86-8536-ee75f088358d'

UNION ALL

SELECT 
    'User Resources',
    'Tasks',
    COUNT(*)::text,
    NULL,
    NULL
FROM tasks WHERE user_id = 'fe12e390-171a-4b86-8536-ee75f088358d'

UNION ALL

SELECT 
    'User Resources',
    'Articles',
    COUNT(*)::text,
    NULL,
    NULL
FROM knowledge_articles WHERE user_id = 'fe12e390-171a-4b86-8536-ee75f088358d'

UNION ALL

SELECT 
    'User Resources',
    'Journal Entries',
    COUNT(*)::text,
    NULL,
    NULL
FROM journal_entries WHERE user_id = 'fe12e390-171a-4b86-8536-ee75f088358d';
