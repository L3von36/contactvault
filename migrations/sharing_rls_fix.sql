-- Migration to support NanoID for shared links and enable public RLS access

-- 1. Change shared_links.id from UUID to TEXT
-- Note: We drop and recreate because changing primary key type is complex in Supabase UI/Dashboard sometimes
-- but here we'll do it cleanly.

-- Drop existing foreign keys if any (none currently reference shared_links.id)
ALTER TABLE shared_links DROP CONSTRAINT shared_links_pkey;
ALTER TABLE shared_links ALTER COLUMN id SET DATA TYPE text;
ALTER TABLE shared_links ADD PRIMARY KEY (id);

-- 2. Update RLS for shared_links
-- Allow anyone to read a shared link if they have the ID (token)
DROP POLICY IF EXISTS "Users can access own shared links" ON shared_links;
CREATE POLICY "Users can manage own shared links" ON shared_links FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Public can view shared links by ID" ON shared_links FOR SELECT USING (true);

-- 3. Update RLS for contacts
-- Allow public select if a valid shared link exists for this contact
DROP POLICY IF EXISTS "Users can access own contacts" ON contacts;
CREATE POLICY "Users can manage own contacts" ON contacts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Public can view shared contacts" ON contacts FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM shared_links
    WHERE shared_links.resource_id = contacts.id
    AND shared_links.resource_type = 'contact'
    AND (shared_links.expires_at IS NULL OR shared_links.expires_at > now())
  )
);
