-- ============================================================
-- PostgreSQL Schema v2 — with RBAC, RLS, Audit Log
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE user_role    AS ENUM ('admin', 'teacher', 'student');
CREATE TYPE member_role  AS ENUM ('teacher', 'student');
CREATE TYPE reg_status   AS ENUM ('pending', 'approved', 'rejected');

-- ============================================================
-- TABLES
-- ============================================================

-- Core user table. New signups start as 'student'; admin promotes.
CREATE TABLE users (
    user_id       UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    name          VARCHAR(150) NOT NULL,
    identifier    VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role          user_role    NOT NULL DEFAULT 'student',
    is_active     BOOLEAN      NOT NULL DEFAULT FALSE,  -- admin activates after review
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Registration queue — admin sees pending signups and assigns roles
CREATE TABLE registrations (
    registration_id UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID        NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    status          reg_status  NOT NULL DEFAULT 'pending',
    reviewed_by     UUID        REFERENCES users(user_id) ON DELETE SET NULL,
    registered_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at     TIMESTAMPTZ,
    UNIQUE (user_id)  -- one registration row per user
);

-- Classes owned by a teacher or admin
CREATE TABLE classes (
    class_id    UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id    UUID         NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
    name        VARCHAR(200) NOT NULL,
    description TEXT,
    is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Many-to-many: users <-> classes.
-- student_code is generated at enrolment — used anonymously in answer views.
CREATE TABLE class_members (
    class_id     UUID        NOT NULL REFERENCES classes(class_id) ON DELETE CASCADE,
    user_id      UUID        NOT NULL REFERENCES users(user_id)    ON DELETE CASCADE,
    student_code VARCHAR(20) NOT NULL,
    role         member_role NOT NULL DEFAULT 'student',
    joined_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (class_id, user_id),
    UNIQUE (class_id, student_code)   -- codes unique per class
);

-- Questions belong to a class; teacher controls publication
CREATE TABLE questions (
    question_id  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id     UUID        NOT NULL REFERENCES classes(class_id)   ON DELETE CASCADE,
    created_by   UUID        NOT NULL REFERENCES users(user_id)       ON DELETE RESTRICT,
    question     TEXT        NOT NULL,
    key_answer   TEXT        NOT NULL,
    is_published BOOLEAN     NOT NULL DEFAULT FALSE,  -- unpublished = students can't see it yet
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Student answers. score_released controls student visibility.
CREATE TABLE answers (
    answer_id      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id    UUID        NOT NULL REFERENCES questions(question_id) ON DELETE CASCADE,
    user_id        UUID        NOT NULL REFERENCES users(user_id)         ON DELETE CASCADE,
    answer         TEXT        NOT NULL,
    score_ai       SMALLINT    CHECK (score_ai    BETWEEN 0 AND 100),
    score_human    SMALLINT    CHECK (score_human BETWEEN 0 AND 100),
    feedback       TEXT,
    score_released BOOLEAN     NOT NULL DEFAULT FALSE,  -- teacher flips to TRUE to show student
    submitted_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at    TIMESTAMPTZ,
    UNIQUE (question_id, user_id)   -- one answer per student per question
);

-- Immutable audit trail for admin actions (role changes, approvals, etc.)
CREATE TABLE audit_log (
    log_id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id       UUID        NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
    target_user_id UUID        REFERENCES users(user_id) ON DELETE SET NULL,
    action         VARCHAR(80) NOT NULL,  -- e.g. 'role_assigned', 'registration_approved'
    payload        JSONB,                 -- before/after values
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_users_identifier       ON users(identifier);
CREATE INDEX idx_users_role             ON users(role);
CREATE INDEX idx_users_is_active        ON users(is_active);

CREATE INDEX idx_registrations_status   ON registrations(status);
CREATE INDEX idx_registrations_user     ON registrations(user_id);

CREATE INDEX idx_classes_owner          ON classes(owner_id);
CREATE INDEX idx_classes_is_active      ON classes(is_active);

CREATE INDEX idx_class_members_user     ON class_members(user_id);
CREATE INDEX idx_class_members_class    ON class_members(class_id);

CREATE INDEX idx_questions_class        ON questions(class_id);
CREATE INDEX idx_questions_created_by   ON questions(created_by);
CREATE INDEX idx_questions_published    ON questions(is_published);

CREATE INDEX idx_answers_question       ON answers(question_id);
CREATE INDEX idx_answers_user           ON answers(user_id);
CREATE INDEX idx_answers_released       ON answers(score_released);
CREATE INDEX idx_answers_submitted      ON answers(submitted_at);

CREATE INDEX idx_audit_actor            ON audit_log(actor_id);
CREATE INDEX idx_audit_target           ON audit_log(target_user_id);
CREATE INDEX idx_audit_action           ON audit_log(action);
CREATE INDEX idx_audit_created          ON audit_log(created_at);

-- ============================================================
-- AUTO-UPDATE updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_classes_updated_at
    BEFORE UPDATE ON classes FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_questions_updated_at
    BEFORE UPDATE ON questions FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- HELPER: get current user's ID and role from session
-- (Your app sets these at connection time via SET LOCAL)
-- Usage: SET LOCAL app.current_user_id = '<uuid>';
--        SET LOCAL app.current_user_role = 'student';
-- ============================================================

CREATE OR REPLACE FUNCTION current_user_id()   RETURNS UUID      AS $$ SELECT current_setting('app.current_user_id')::UUID $$ LANGUAGE SQL STABLE;
CREATE OR REPLACE FUNCTION current_user_role()  RETURNS user_role AS $$ SELECT current_setting('app.current_user_role')::user_role $$ LANGUAGE SQL STABLE;

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Enforces access rules at the database layer.
-- ============================================================

ALTER TABLE users         ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes       ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers       ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log     ENABLE ROW LEVEL SECURITY;

-- ---- users ----
-- Admins see all. Others see only themselves.
CREATE POLICY users_admin   ON users FOR ALL  USING (current_user_role() = 'admin');
CREATE POLICY users_self    ON users FOR SELECT USING (user_id = current_user_id());

-- ---- registrations ----
-- Only admins see/manage registrations.
CREATE POLICY reg_admin ON registrations FOR ALL USING (current_user_role() = 'admin');

-- ---- classes ----
-- Admins see all.
-- Teachers see classes they own.
-- Students see classes they are enrolled in.
CREATE POLICY classes_admin   ON classes FOR ALL    USING (current_user_role() = 'admin');
CREATE POLICY classes_teacher ON classes FOR ALL    USING (current_user_role() = 'teacher' AND owner_id = current_user_id());
CREATE POLICY classes_student ON classes FOR SELECT USING (
    current_user_role() = 'student' AND
    EXISTS (SELECT 1 FROM class_members cm WHERE cm.class_id = classes.class_id AND cm.user_id = current_user_id())
);

-- ---- class_members ----
-- Admins see all.
-- Teachers see members of their own classes.
-- Students see only their own membership row.
CREATE POLICY cm_admin   ON class_members FOR ALL    USING (current_user_role() = 'admin');
CREATE POLICY cm_teacher ON class_members FOR SELECT USING (
    current_user_role() = 'teacher' AND
    EXISTS (SELECT 1 FROM classes c WHERE c.class_id = class_members.class_id AND c.owner_id = current_user_id())
);
CREATE POLICY cm_student ON class_members FOR SELECT USING (
    current_user_role() = 'student' AND user_id = current_user_id()
);

-- ---- questions ----
-- Admins see all.
-- Teachers can CRUD questions in their own classes.
-- Students see only published questions in their enrolled classes.
CREATE POLICY q_admin   ON questions FOR ALL    USING (current_user_role() = 'admin');
CREATE POLICY q_teacher ON questions FOR ALL    USING (
    current_user_role() = 'teacher' AND
    EXISTS (SELECT 1 FROM classes c WHERE c.class_id = questions.class_id AND c.owner_id = current_user_id())
);
CREATE POLICY q_student ON questions FOR SELECT USING (
    current_user_role() = 'student' AND
    is_published = TRUE AND
    EXISTS (SELECT 1 FROM class_members cm WHERE cm.class_id = questions.class_id AND cm.user_id = current_user_id())
);

-- ---- answers ----
-- Admins see all.
-- Teachers see answers for questions in their classes, but NOT the user_id column —
--   handled at the application layer by joining to class_members.student_code instead.
-- Students see only their own answers, and only when score_released = TRUE.
CREATE POLICY a_admin   ON answers FOR ALL    USING (current_user_role() = 'admin');
CREATE POLICY a_teacher ON answers FOR ALL    USING (
    current_user_role() = 'teacher' AND
    EXISTS (
        SELECT 1 FROM questions q
        JOIN classes c ON c.class_id = q.class_id
        WHERE q.question_id = answers.question_id AND c.owner_id = current_user_id()
    )
);
CREATE POLICY a_student_insert ON answers FOR INSERT WITH CHECK (
    current_user_role() = 'student' AND user_id = current_user_id()
);
CREATE POLICY a_student_select ON answers FOR SELECT USING (
    current_user_role() = 'student' AND
    user_id = current_user_id() AND
    score_released = TRUE
);

-- ---- audit_log ----
-- Only admins can read the audit log. It is append-only (no UPDATE/DELETE).
CREATE POLICY audit_admin_select ON audit_log FOR SELECT USING (current_user_role() = 'admin');
CREATE POLICY audit_insert       ON audit_log FOR INSERT WITH CHECK (TRUE);

-- ============================================================
-- AUDIT HELPER: call this from app when admin changes a role
-- ============================================================

CREATE OR REPLACE FUNCTION log_role_change(
    p_actor_id       UUID,
    p_target_user_id UUID,
    p_old_role       user_role,
    p_new_role       user_role
) RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO audit_log (actor_id, target_user_id, action, payload)
    VALUES (
        p_actor_id,
        p_target_user_id,
        'role_assigned',
        jsonb_build_object('old_role', p_old_role, 'new_role', p_new_role)
    );
END;
$$;

-- ============================================================
-- ANONYMOUS ANSWER VIEW FOR TEACHERS
-- Teachers query this view — user_id is hidden, student_code shown instead.
-- ============================================================

CREATE VIEW teacher_answer_view AS
SELECT
    a.answer_id,
    a.question_id,
    cm.student_code,       -- anonymous identifier
    a.answer,
    a.score_ai,
    a.score_human,
    a.feedback,
    a.score_released,
    a.submitted_at,
    a.reviewed_at
FROM answers a
JOIN class_members cm
  ON cm.user_id = a.user_id
  JOIN questions q ON q.question_id = a.question_id
  AND cm.class_id = q.class_id;

-- ============================================================
-- STUDENT SCORE VIEW
-- Students query this — only released scores, no key_answer exposed.
-- ============================================================

CREATE VIEW student_score_view AS
SELECT
    a.answer_id,
    a.question_id,
    q.question,
    a.answer,
    a.score_ai,
    a.score_human,
    a.feedback,
    a.submitted_at
FROM answers a
JOIN questions q ON q.question_id = a.question_id
WHERE a.user_id    = current_user_id()
  AND a.score_released = TRUE;
