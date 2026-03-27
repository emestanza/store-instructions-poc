-- Add published_at column to instructions table
ALTER TABLE instructions ADD COLUMN published_at DATETIME DEFAULT NULL;

-- Update existing published instructions to set published_at to created_at
UPDATE instructions SET published_at = created_at WHERE active = 1;
