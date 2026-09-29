-- backend/db/seed.sql
-- Inserts a dummy class and question for testing the evaluation flow.
-- Run AFTER migration.sql and AFTER registering your first admin user.
--
-- Usage:
--   psql -U postgres -d aes_db -f backend/db/seed.sql
--
-- Or inside Docker:
--   docker exec -it aes-db psql -U postgres -d aes_db -f /seed.sql

-- ── Step 1: Get the first admin user's ID ─────────────────────────────────────
-- We use a DO block so we can reference the admin's user_id dynamically.

DO $$
DECLARE
  v_admin_id    UUID;
  v_class_id    UUID;
  v_question_id UUID;
BEGIN

  -- Get the first admin user
  SELECT user_id INTO v_admin_id
  FROM users
  WHERE role = 'admin'
  ORDER BY created_at ASC
  LIMIT 1;

  IF v_admin_id IS NULL THEN
    RAISE EXCEPTION 'No admin user found. Please register an admin first.';
  END IF;

  -- ── Create a dummy class ───────────────────────────────────────────────────
  INSERT INTO classes (owner_id, name, description, is_active)
  VALUES (
    v_admin_id,
    'Introduction to Biology',
    'A foundational class covering basic biology concepts including cells, genetics, and ecosystems.',
    TRUE
  )
  RETURNING class_id INTO v_class_id;

  -- Add admin as a member of the class
  INSERT INTO class_members (class_id, user_id, student_code, role)
  VALUES (v_class_id, v_admin_id, 'ADMIN001', 'admin');

  -- ── Create dummy questions ─────────────────────────────────────────────────
  INSERT INTO questions (class_id, created_by, question, key_answer, is_published)
  VALUES
    (
      v_class_id,
      v_admin_id,
      'What is photosynthesis? Explain the process briefly.',
      'Photosynthesis is the process by which green plants and algae convert sunlight, carbon dioxide, and water into glucose and oxygen using chlorophyll in chloroplasts.',
      TRUE
    ),
    (
      v_class_id,
      v_admin_id,
      'Describe the structure and function of a cell membrane.',
      'The cell membrane is a phospholipid bilayer that surrounds the cell, controls what enters and exits the cell, maintains cell shape, and enables communication with other cells through membrane proteins.',
      TRUE
    ),
    (
      v_class_id,
      v_admin_id,
      'What is DNA and what role does it play in inheritance?',
      'DNA (deoxyribonucleic acid) is a double-helix molecule that carries genetic information. It encodes instructions for building proteins and is passed from parents to offspring during reproduction, determining inherited traits.',
      FALSE  -- unpublished — students cannot see this yet
    );

  RAISE NOTICE 'Seed data inserted successfully!';
  RAISE NOTICE 'Class ID: %', v_class_id;
  RAISE NOTICE 'Share this Class ID with students so they can join.';

END $$;
