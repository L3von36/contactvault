-- Add is_emergency_safe column to contacts table
ALTER TABLE contacts 
ADD COLUMN IF NOT EXISTS is_emergency_safe boolean DEFAULT false;

-- Add status column if it doesn't exist (for contact filtering)
ALTER TABLE contacts 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'new' 
CHECK (status IN ('new', 'qualified', 'contacted'));

-- Update existing contacts to have default values
UPDATE contacts 
SET is_emergency_safe = false 
WHERE is_emergency_safe IS NULL;

UPDATE contacts 
SET status = 'new' 
WHERE status IS NULL;
