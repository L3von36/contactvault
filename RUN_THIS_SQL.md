# 🗄️ Database Migration SQL

Copy and paste this into Supabase SQL Editor **AFTER** deploying to Render.

```sql
-- Add missing columns to contacts table
ALTER TABLE contacts 
ADD COLUMN IF NOT EXISTS is_emergency_safe BOOLEAN DEFAULT false;

ALTER TABLE contacts 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'new';

-- Add check constraint for status
ALTER TABLE contacts 
ADD CONSTRAINT contacts_status_check 
CHECK (status IN ('new', 'qualified', 'contacted'));
```

## How to Run This:

1. Go to: https://supabase.com/dashboard/project/dmtexkccpomzcviforny
2. Click **SQL Editor** in the left sidebar
3. Click **"New query"**
4. Copy the SQL above
5. Paste it into the editor
6. Click **"Run"** (or press Ctrl+Enter)
7. You should see: **"Success. No rows returned"**

✅ Done! Your database is ready.
