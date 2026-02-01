-- 1. Contacts Table
create table contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,

  first_name text,
  last_name text,

  phones jsonb default '[]',
  emails jsonb default '[]',

  company text,
  job_title text,
  address text,
  notes text,
  profile_picture_url text,
  is_favorite boolean default false,
  is_emergency_safe boolean default false,

  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 2. Relationships Table
create table relationships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,

  name text not null,

  created_at timestamp with time zone default now()
);

-- 3. Contact_Relationships (Many-to-Many)
create table contact_relationships (
  contact_id uuid references contacts(id) on delete cascade,
  relationship_id uuid references relationships(id) on delete cascade,

  primary key (contact_id, relationship_id)
);

-- 4. Shared Links
create table shared_links (
  id text primary key, -- NanoID token
  owner_id uuid references auth.users(id) on delete cascade,

  resource_type text check (resource_type in ('contact', 'group')),
  resource_id uuid not null,

  permission text check (permission in ('view', 'edit')) default 'view',
  expires_at timestamp with time zone,

  created_at timestamp with time zone default now()
);

-- 5. Emergency Settings
create table emergency_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  pin_hash text not null,
  enabled boolean default false
);

-- 6. Row Level Security (RLS)

-- Contacts
alter table contacts enable row level security;
create policy "Users can manage own contacts" on contacts for all using (auth.uid() = user_id);
create policy "Public can view shared contacts" on contacts for select using (
  exists (
    select 1 from shared_links
    where shared_links.resource_id = contacts.id
    AND shared_links.resource_type = 'contact'
    AND (shared_links.expires_at IS NULL OR shared_links.expires_at > now())
  )
);

-- Relationships
alter table relationships enable row level security;
create policy "Users can manage own relationships" on relationships for all using (auth.uid() = user_id);

-- Contact Relationships
alter table contact_relationships enable row level security;
create policy "Users can manage own contact relationships" on contact_relationships for all using (
  exists (
    select 1 from contacts c where c.id = contact_relationships.contact_id and c.user_id = auth.uid()
  )
);

-- Shared Links
alter table shared_links enable row level security;
create policy "Users can manage own shared links" on shared_links for all using (auth.uid() = owner_id);
create policy "Public can view shared links by ID" on shared_links for select using (true);

-- Emergency Settings
alter table emergency_settings enable row level security;
create policy "Users can access own emergency settings" on emergency_settings for all using (auth.uid() = user_id);
