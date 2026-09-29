-- ================================================================
-- Migration : answers — score_ai rescaled, score_human dropped
-- Up  : score_ai SMALLINT (0–100)   → NUMERIC(3,2) (1.00–5.00)
--       score_human column dropped
-- Down: see rollback section at the bottom
-- ================================================================

BEGIN;

-- 1. Drop views that depend on the answers table (especially score_ai)
DROP VIEW IF EXISTS teacher_answer_view;
DROP VIEW IF EXISTS student_score_view;
-- Add any other view names that might depend on answers.score_ai

-- 2. Drop old check constraint
ALTER TABLE answers
    DROP CONSTRAINT IF EXISTS answers_score_ai_check;

-- 3. Change column type (rescale 0–100 → 1.00–5.00)
ALTER TABLE answers
    ALTER COLUMN score_ai TYPE NUMERIC(3,2)
    USING CASE
        WHEN score_ai IS NULL THEN NULL
        ELSE ROUND((score_ai / 100.0 * 4 + 1)::NUMERIC, 2)
    END;

-- 4. Add new check constraint for 1–5 scale
ALTER TABLE answers
    ADD CONSTRAINT answers_score_ai_check
    CHECK (score_ai BETWEEN 1.00 AND 5.00);

-- 5. Drop score_human column (unused)
ALTER TABLE answers
    DROP COLUMN IF EXISTS score_human;

-- 6. Recreate the dropped views with the new column type.
--    ⚠️ Replace the definitions below with your actual view definitions.
--    The ones shown are based on the project context.
CREATE VIEW teacher_answer_view AS
SELECT
    a.answer_id,
    cm.student_code,
    q.question,
    a.answer,
    a.score_ai,          -- now NUMERIC(3,2)
    a.feedback,
    a.score_released,
    a.submitted_at,
    a.reviewed_at
FROM answers a
JOIN questions q ON a.question_id = q.question_id
JOIN class_members cm ON a.user_id = cm.user_id AND cm.class_id = q.class_id;

CREATE VIEW student_score_view AS
SELECT
    a.answer_id,
    q.question,
    a.answer,
    a.score_ai,
    a.feedback,
    a.submitted_at
FROM answers a
JOIN questions q ON a.question_id = q.question_id
WHERE a.user_id = current_setting('app.current_user_id')::UUID
  AND a.score_released = TRUE;

COMMIT;

-- ================================================================
-- ROLLBACK (run manually only if needed)
-- ================================================================
-- BEGIN;
--
-- DROP VIEW IF EXISTS teacher_answer_view;
-- DROP VIEW IF EXISTS student_score_view;
--
-- ALTER TABLE answers
--     DROP CONSTRAINT IF EXISTS answers_score_ai_check;
--
-- ALTER TABLE answers
--     ALTER COLUMN score_ai TYPE SMALLINT
--     USING CASE
--         WHEN score_ai IS NULL THEN NULL
--         ELSE ROUND((score_ai - 1) / 4.0 * 100)::SMALLINT
--     END;
--
-- ALTER TABLE answers
--     ADD CONSTRAINT answers_score_ai_check
--     CHECK (score_ai BETWEEN 0 AND 100);
--
-- ALTER TABLE answers
--     ADD COLUMN score_human SMALLINT
--     CHECK (score_human BETWEEN 0 AND 100);
--
-- CREATE VIEW teacher_answer_view AS ...  (restore original)
-- CREATE VIEW student_score_view AS ...   (restore original)
--
-- COMMIT;