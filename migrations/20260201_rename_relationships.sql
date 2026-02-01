-- 1. Rename 'groups' table to 'relationships'
ALTER TABLE groups RENAME TO relationships;

-- 2. Rename 'contact_groups' table to 'contact_relationships'
ALTER TABLE contact_groups RENAME TO contact_relationships;

-- 3. Rename columns in 'contact_relationships' to match new terminology
ALTER TABLE contact_relationships RENAME COLUMN group_id TO relationship_id;

-- 4. Update Emergency Settings: Make pin_hash nullable. 
-- This allows toggling the enabled state before a PIN is set (app logic will enforce the PIN).
ALTER TABLE emergency_settings ALTER COLUMN pin_hash DROP NOT NULL;

-- 5. Update RLS policies (Supabase might handle this on rename, but let's be safe)
-- If the project uses explicit policy names, they might need recreation if they were hardcoded to 'groups'.
-- However, most 'ALTER TABLE ... RENAME' in Postgres handles policies.

-- 6. Update shared_links check constraint if necessary
ALTER TABLE shared_links DROP CONSTRAINT IF EXISTS shared_links_resource_type_check;
ALTER TABLE shared_links ADD CONSTRAINT shared_links_resource_type_check CHECK (resource_type IN ('contact', 'relationship'));
