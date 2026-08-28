-- ============================================================================
-- Exam Hub — Database Creation Script
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- for gen_random_uuid()

-- ============================================================================
-- TABLE : users
-- Single role per user (role column, no join table)
-- RG-10: no physical deletion -> is_active
-- ============================================================================
CREATE TABLE users (
                       id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                       name          VARCHAR(255) NOT NULL,
                       email         VARCHAR(255) NOT NULL UNIQUE,
                       password_hash VARCHAR(255) NOT NULL,
                       role          VARCHAR(20)  NOT NULL CHECK (role IN ('admin', 'student')),
                       is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
                       created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE : courses
-- RG-09: a course with exams cannot be deleted
--        -> guaranteed by ON DELETE RESTRICT on exams.course_id (below)
-- ============================================================================
CREATE TABLE courses (
                         id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                         code        VARCHAR(50)  NOT NULL UNIQUE,
                         name        VARCHAR(255) NOT NULL,
                         description TEXT,
                         created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE : exams
-- RG-03: availability window (server validation in addition to CHECK)
-- RG-09: ON DELETE RESTRICT towards courses -> blocks deletion of a course
--        that has exams
-- ============================================================================
CREATE TABLE exams (
                       id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                       course_id   UUID NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,
                       title       VARCHAR(255) NOT NULL,
                       description TEXT,
                       start_at    TIMESTAMPTZ NOT NULL,
                       end_at      TIMESTAMPTZ NOT NULL,
                       created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
                       CONSTRAINT chk_exam_window CHECK (end_at > start_at)
);

CREATE INDEX idx_exams_course_id ON exams(course_id);

-- ============================================================================
-- TABLE : questions
-- RG-08: locking managed at the Service level (prohibition to modify/
--        delete if the exam has attempts); ON DELETE CASCADE here
--        only applies when the exam itself is deletable
--        (therefore without attempts, cf RG-09 on exams -> attempts below)
-- ============================================================================
CREATE TABLE questions (
                           id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                           exam_id    UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
                           statement  TEXT NOT NULL,
                           points     INTEGER NOT NULL CHECK (points > 0),
                           created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_questions_exam_id ON questions(exam_id);

-- ============================================================================
-- TABLE : choices
-- RG-04: between 2 and 6 choices per question, exactly one correct.
-- Impossible to guarantee with a simple CHECK (rule applies to all
-- rows linked to a question) -> DEFERRABLE constraint trigger, checked
-- at the end of the transaction (allows inserting choices one by one or in
-- batch within the same transaction, cf CreateQuestionInput on service side).
-- ============================================================================
CREATE TABLE choices (
                         id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                         question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
                         label       VARCHAR(500) NOT NULL,
                         is_correct  BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_choices_question_id ON choices(question_id);

CREATE OR REPLACE FUNCTION validate_question_choices()
RETURNS TRIGGER AS $$
DECLARE
v_question_id UUID;
    v_total       INTEGER;
    v_correct     INTEGER;
BEGIN
    IF TG_OP = 'DELETE' THEN
        v_question_id := OLD.question_id;
ELSE
        v_question_id := NEW.question_id;
END IF;

SELECT COUNT(*), COUNT(*) FILTER (WHERE is_correct)
INTO v_total, v_correct
FROM choices
WHERE question_id = v_question_id;

IF v_total < 2 OR v_total > 6 THEN
        RAISE EXCEPTION 'RG-04: question % must have between 2 and 6 choices (found: %)',
            v_question_id, v_total;
END IF;

    IF v_correct <> 1 THEN
        RAISE EXCEPTION 'RG-04: question % must have exactly one correct choice (found: %)',
            v_question_id, v_correct;
END IF;

RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE CONSTRAINT TRIGGER trg_validate_question_choices
    AFTER INSERT OR UPDATE OR DELETE ON choices
    DEFERRABLE INITIALLY DEFERRED
    FOR EACH ROW
    EXECUTE FUNCTION validate_question_choices();

-- ============================================================================
-- TABLE : attempts
-- RG-02: a student can only take an exam once
--        -> UNIQUE(exam_id, student_id), in addition to server validation
-- RG-09: ON DELETE RESTRICT -> blocks deletion of an exam that has
--        attempts
-- ============================================================================
CREATE TABLE attempts (
                          id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                          exam_id      UUID NOT NULL REFERENCES exams(id) ON DELETE RESTRICT,
                          student_id   UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
                          score        INTEGER,
                          started_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
                          submitted_at TIMESTAMPTZ,
                          CONSTRAINT uq_attempt_exam_student UNIQUE (exam_id, student_id)
);

CREATE INDEX idx_attempts_exam_id ON attempts(exam_id);
CREATE INDEX idx_attempts_student_id ON attempts(student_id);

-- ============================================================================
-- TABLE : answers (answers given during an attempt)
-- RG-05: choice_id NULLABLE -> question left unanswered = 0 points
-- RG-06: score is never stored here, it is recalculated and written to
--        attempts.score server-side upon submission
-- ============================================================================
CREATE TABLE answers (
                         id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                         attempt_id  UUID NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,
                         question_id UUID NOT NULL REFERENCES questions(id) ON DELETE RESTRICT,
                         choice_id   UUID REFERENCES choices(id) ON DELETE RESTRICT,
                         CONSTRAINT uq_answer_attempt_question UNIQUE (attempt_id, question_id)
);

CREATE INDEX idx_answers_attempt_id ON answers(attempt_id);
CREATE INDEX idx_answers_question_id ON answers(question_id);

-- ============================================================================
-- SEED — Initial data (RG-01: the first admin is created by script,
-- never by self-registration)
-- ============================================================================

-- Test administrator account
-- email    : admin@examhub.local
-- password : Admin123!
-- Set client encoding to UTF-8 to avoid WIN1252 error
\encoding UTF8

-- 1. Preventive cleanup of partially inserted data
TRUNCATE users, courses, exams, questions, choices CASCADE;

-- 2. Test administrator account
INSERT INTO users (name, email, password_hash, role, is_active)
VALUES (
           'Administrator',
           'admin@examhub.local',
           '$2b$10$W60kaS8Z5OCuoH7bCk8EUOqC81Fgbrj4l10Pv3gKayvFr9O5vJNV2',
           'admin',
           TRUE
       );

-- 3. Test student account
INSERT INTO users (name, email, password_hash, role, is_active)
VALUES (
           'Test Student',
           'student@examhub.local',
           '$2b$10$wmzk/g0ygEryPd2YqYALJuLfNSawVI9PskOsW2xuvO3uIKq.GHEAG',
           'student',
           TRUE
       );

-- 4. Demo course
INSERT INTO courses (code, name, description)
VALUES ('PROG2', 'Advanced Programming', 'Object-oriented programming and data structures course.');

-- 5. Demo exam
INSERT INTO exams (course_id, title, description, start_at, end_at)
SELECT id, 'PROG2 Final Exam', 'End of module evaluation.', now() - INTERVAL '1 day', now() + INTERVAL '30 days'
FROM courses WHERE code = 'PROG2';

-- 6. Insertion of Questions and Choices (PL/pgSQL Block)
DO $$
DECLARE
v_exam_id UUID;
    v_q1_id   UUID;
    v_q2_id   UUID;
BEGIN
SELECT id INTO v_exam_id FROM exams WHERE title = 'PROG2 Final Exam';

-- Question 1
INSERT INTO questions (exam_id, statement, points)
VALUES (v_exam_id, 'Which data structure operates on a LIFO basis?', 2)
    RETURNING id INTO v_q1_id;

INSERT INTO choices (question_id, label, is_correct) VALUES
                                                         (v_q1_id, 'Queue', FALSE),
                                                         (v_q1_id, 'Stack', TRUE),
                                                         (v_q1_id, 'Linked List', FALSE),
                                                         (v_q1_id, 'Binary Tree', FALSE);

-- Question 2
INSERT INTO questions (exam_id, statement, points)
VALUES (v_exam_id, 'What is the average time complexity of a search in a hash table?', 3)
    RETURNING id INTO v_q2_id;

INSERT INTO choices (question_id, label, is_correct) VALUES
                                                         (v_q2_id, 'O(1)', TRUE),
                                                         (v_q2_id, 'O(n)', FALSE),
                                                         (v_q2_id, 'O(log n)', FALSE);
END $$;