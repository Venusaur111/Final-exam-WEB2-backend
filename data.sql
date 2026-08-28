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
-- ON DELETE CASCADE added to allow course deletion along with its exams
-- ============================================================================
CREATE TABLE exams (
                       id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                       course_id   UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
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
-- ON DELETE CASCADE already present here to delete questions with exams
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
-- ============================================================================
CREATE TABLE choices (
                         id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                         question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
                         label       VARCHAR(500) NOT NULL,
                         is_correct  BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_choices_question_id ON choices(question_id);

CREATE OR REPLACE FUNCTION validate_question_choices()
RETURNS TRIGGER AS $$VITE_API_URL=http://localhost:3000/api
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
-- ON DELETE CASCADE added to allow exam deletion along with its attempts
-- ============================================================================
CREATE TABLE attempts (
                          id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                          exam_id      UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
                          student_id   UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
                          score        INTEGER,
                          started_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
                          submitted_at TIMESTAMPTZ,
                          CONSTRAINT uq_attempt_exam_student UNIQUE (exam_id, student_id)
);

CREATE INDEX idx_attempts_exam_id ON attempts(exam_id);
CREATE INDEX idx_attempts_student_id ON attempts(student_id);

-- ============================================================================
-- TABLE : answers
-- ON DELETE CASCADE added for question_id to allow question deletion along with answers
-- ============================================================================
CREATE TABLE answers (
                         id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                         attempt_id  UUID NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,
                         question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
                         choice_id   UUID REFERENCES choices(id) ON DELETE SET NULL,
                         CONSTRAINT uq_answer_attempt_question UNIQUE (attempt_id, question_id)
);

CREATE INDEX idx_answers_attempt_id ON answers(attempt_id);
CREATE INDEX idx_answers_question_id ON answers(question_id);

-- ============================================================================
-- SEED — Initial data
-- ============================================================================

\encoding UTF8

TRUNCATE users, courses, exams, questions, choices CASCADE;

INSERT INTO users (name, email, password_hash, role, is_active)
VALUES (
           'Administrator',
           'admin@examhub.local',
           '$2b$10$W60kaS8Z5OCuoH7bCk8EUOqC81Fgbrj4l10Pv3gKayvFr9O5vJNV2',
           'admin',
           TRUE
       );

INSERT INTO users (name, email, password_hash, role, is_active)
VALUES (
           'Test Student',
           'student@examhub.local',
           '$2b$10$wmzk/g0ygEryPd2YqYALJuLfNSawVI9PskOsW2xuvO3uIKq.GHEAG',
           'student',
           TRUE
       );

INSERT INTO courses (code, name, description)
VALUES ('PROG2', 'Advanced Programming', 'Object-oriented programming and data structures course.');

INSERT INTO exams (course_id, title, description, start_at, end_at)
SELECT id, 'PROG2 Final Exam', 'End of module evaluation.', now() - INTERVAL '1 day', now() + INTERVAL '30 days'
FROM courses WHERE code = 'PROG2';

DO $$
DECLARE
v_exam_id UUID;
    v_q1_id   UUID;
    v_q2_id   UUID;
BEGIN
SELECT id INTO v_exam_id FROM exams WHERE title = 'PROG2 Final Exam';

INSERT INTO questions (exam_id, statement, points)
VALUES (v_exam_id, 'Which data structure operates on a LIFO basis?', 2)
    RETURNING id INTO v_q1_id;

INSERT INTO choices (question_id, label, is_correct) VALUES
                                                         (v_q1_id, 'Queue', FALSE),
                                                         (v_q1_id, 'Stack', TRUE),
                                                         (v_q1_id, 'Linked List', FALSE),
                                                         (v_q1_id, 'Binary Tree', FALSE);

INSERT INTO questions (exam_id, statement, points)
VALUES (v_exam_id, 'What is the average time complexity of a search in a hash table?', 3)
    RETURNING id INTO v_q2_id;

INSERT INTO choices (question_id, label, is_correct) VALUES
                                                         (v_q2_id, 'O(1)', TRUE),
                                                         (v_q2_id, 'O(n)', FALSE),
                                                         (v_q2_id, 'O(log n)', FALSE);
END $$;