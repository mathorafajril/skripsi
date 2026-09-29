-- backend/db/add_join_code.sql
-- Run this once to add the join_code column to the existing classes table.
-- Safe to run on an existing database — uses IF NOT EXISTS checks.
--
-- Run via Docker:
--   docker cp ./backend/db/add_join_code.sql aes-db:/add_join_code.sql
--   docker exec -it aes-db psql -U postgres -d aes_db -f /add_join_code.sql

-- Add join_code column (6 character uppercase alphanumeric, e.g. BIO202)
ALTER TABLE classes
  ADD COLUMN IF NOT EXISTS join_code VARCHAR(10) UNIQUE;

-- Backfill join_code for any existing classes that don't have one yet
UPDATE classes
SET join_code = UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6))
WHERE join_code IS NULL;

-- Make it NOT NULL after backfilling
ALTER TABLE classes
  ALTER COLUMN join_code SET NOT NULL;

-- Index for fast lookup when student enters join code
CREATE INDEX IF NOT EXISTS idx_classes_join_code ON classes (join_code);

SELECT 'join_code column added successfully.' AS result;
