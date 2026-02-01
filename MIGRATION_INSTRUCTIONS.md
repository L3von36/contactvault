# Database Migration Instructions

## How to Apply the Migration

You need to add the `is_emergency_safe` and `status` columns to your Supabase database.

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the contents of `migrations/add_emergency_safe_column.sql`
5. Click **Run** to execute the migration

### Option 2: Using Supabase CLI

```bash
# If you have Supabase CLI installed
supabase db push
```

### What This Migration Does

- Adds `is_emergency_safe` column (boolean, default false) to contacts table
- Adds `status` column (text, default 'new') to contacts table  
- Updates existing contacts to have default values

### Verify Migration

After running the migration, verify it worked by running this query in SQL Editor:

```sql
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'contacts' 
AND column_name IN ('is_emergency_safe', 'status');
```

You should see both columns listed.
