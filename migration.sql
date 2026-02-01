-- Add missing columns to contacts table
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS job_title text;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS status text DEFAULT 'new';
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS tags jsonb DEFAULT '[]';

-- Update existing rows to have default status if null
UPDATE contacts SET status = 'new' WHERE status IS NULL;
