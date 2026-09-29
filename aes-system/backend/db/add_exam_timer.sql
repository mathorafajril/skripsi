ALTER TABLE classes
  ADD COLUMN IF NOT EXISTS exam_start_time     TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS exam_duration_minutes INTEGER    DEFAULT NULL;

COMMENT ON COLUMN classes.exam_start_time IS
  'UTC timestamp when the exam window opens. NULL = no scheduled exam.';

COMMENT ON COLUMN classes.exam_duration_minutes IS
  'Duration of exam window in minutes. NULL = no scheduled exam.';