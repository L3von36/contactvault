-- Rename groups to relationships and contact_groups to contact_relationships
-- This aligns the database schema with the refactored codebase.

-- 1. Rename the primary tables
ALTER TABLE groups RENAME TO relationships;
ALTER TABLE contact_groups RENAME TO contact_relationships;

-- 2. Update Column Names (if necessary)
-- In contact_relationships, we might want to rename group_id to relationship_id
ALTER TABLE contact_relationships RENAME COLUMN group_id TO relationship_id;

-- 3. Update RLS Policies
-- supabase usually renames the table in policies automatically, but let's be safe and re-apply them if needed.
-- Looking at schema.sql, the policies were:
-- create policy "Users can access own groups" on groups ...
-- create policy "Users can access own contact groups" on contact_groups ...

-- Drop old policies (Postgres might have renamed them, but let's ensure we have the correct ones)
DROP POLICY IF EXISTS "Users can access own groups" ON relationships;
DROP POLICY IF EXISTS "Users can access own contact groups" ON contact_relationships;

CREATE POLICY "Users can manage own relationships" ON relationships FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own contact relationships" ON contact_relationships FOR ALL USING (
  EXISTS (
    SELECT 1 FROM contacts c WHERE c.id = contact_relationships.contact_id AND c.user_id = auth.uid()
  )
);
