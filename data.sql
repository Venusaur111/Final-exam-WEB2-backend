-- ============================================================================
-- Exam Hub — Script de création de la base de données
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- pour gen_random_uuid()

-- ============================================================================
-- TABLE : users
-- Un seul rôle par utilisateur (colonne role, pas de table de jointure)
-- RG-10 : pas de suppression physique -> is_active
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
-- RG-09 : un cours avec des examens ne peut pas être supprimé
--         -> garanti par ON DELETE RESTRICT sur exams.course_id (plus bas)
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
-- RG-03 : fenêtre de disponibilité (vérification serveur en plus du CHECK)
-- RG-09 : ON DELETE RESTRICT vers courses -> bloque la suppression d'un cours
--         qui a des examens
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
-- RG-08 : verrouillage géré au niveau Service (interdiction de modifier/
--         supprimer si l'examen a des tentatives) ; ON DELETE CASCADE ici
--         ne s'applique que lorsque l'examen lui-même est supprimable
--         (donc sans tentatives, cf RG-09 sur exams -> attempts plus bas)
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
-- RG-04 : entre 2 et 6 choix par question, exactement un correct.
-- Impossible à garantir avec un simple CHECK (règle porte sur l'ensemble des
-- lignes liées à une question) -> trigger de contrainte DEFERRABLE, vérifié
-- à la fin de la transaction (permet l'insertion des choix un par un ou en
-- lot dans la même transaction, cf CreateQuestionInput côté service).
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
        RAISE EXCEPTION 'RG-04: la question % doit avoir entre 2 et 6 choix (trouvé: %)',
            v_question_id, v_total;
    END IF;

    IF v_correct <> 1 THEN
        RAISE EXCEPTION 'RG-04: la question % doit avoir exactement un choix correct (trouvé: %)',
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
-- TABLE : attempts (tentatives)
-- RG-02 : un étudiant ne peut passer un examen qu'une seule fois
--         -> UNIQUE(exam_id, student_id), en plus de la vérification serveur
-- RG-09 : ON DELETE RESTRICT -> bloque la suppression d'un examen qui a
--         des tentatives
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
-- TABLE : answers (réponses données lors d'une tentative)
-- RG-05 : choice_id NULLABLE -> question laissée sans réponse = 0 point
-- RG-06 : le score n'est jamais stocké ici, il est recalculé et écrit dans
--         attempts.score côté serveur au moment de la soumission
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
-- SEED — Données initiales (RG-01 : le premier admin est créé par script,
-- jamais par auto-inscription)
-- ============================================================================

-- Compte administrateur de test
-- email    : admin@examhub.local
-- password : Admin123!
-- Fixer l'encodage client en UTF-8 pour éviter l'erreur WIN1252
\encoding UTF8

-- 1. Nettoyage préventif des données déjà partiellement insérées
TRUNCATE users, courses, exams, questions, choices CASCADE;

-- 2. Compte administrateur de test
INSERT INTO users (name, email, password_hash, role, is_active)
VALUES (
    'Administrateur',
    'admin@examhub.local',
    '$2b$10$W60kaS8Z5OCuoH7bCk8EUOqC81Fgbrj4l10Pv3gKayvFr9O5vJNV2',
    'admin',
    TRUE
);

-- 3. Compte étudiant de test
INSERT INTO users (name, email, password_hash, role, is_active)
VALUES (
    'Etudiant Test',
    'student@examhub.local',
    '$2b$10$wmzk/g0ygEryPd2YqYALJuLfNSawVI9PskOsW2xuvO3uIKq.GHEAG',
    'student',
    TRUE
);

-- 4. Cours de démonstration
INSERT INTO courses (code, name, description)
VALUES ('PROG2', 'Programmation avancee', 'Cours de programmation orientee objet et structures de donnees.');

-- 5. Examen de démonstration
INSERT INTO exams (course_id, title, description, start_at, end_at)
SELECT id, 'Examen final PROG2', 'Evaluation de fin de module.', now() - INTERVAL '1 day', now() + INTERVAL '30 days'
FROM courses WHERE code = 'PROG2';

-- 6. Insertion des Questions et Choix (Bloc PL/pgSQL)
DO $$
DECLARE
    v_exam_id UUID;
    v_q1_id   UUID;
    v_q2_id   UUID;
BEGIN
    SELECT id INTO v_exam_id FROM exams WHERE title = 'Examen final PROG2';

    -- Question 1
    INSERT INTO questions (exam_id, statement, points)
    VALUES (v_exam_id, 'Quelle structure de donnees fonctionne en LIFO ?', 2)
    RETURNING id INTO v_q1_id;

    INSERT INTO choices (question_id, label, is_correct) VALUES
        (v_q1_id, 'File (Queue)', FALSE),
        (v_q1_id, 'Pile (Stack)', TRUE),
        (v_q1_id, 'Liste chainee', FALSE),
        (v_q1_id, 'Arbre binaire', FALSE);

    -- Question 2
    INSERT INTO questions (exam_id, statement, points)
    VALUES (v_exam_id, 'Quelle est la complexite moyenne d une recherche dans une table de hachage ?', 3)
    RETURNING id INTO v_q2_id;

    INSERT INTO choices (question_id, label, is_correct) VALUES
        (v_q2_id, 'O(1)', TRUE),
        (v_q2_id, 'O(n)', FALSE),
        (v_q2_id, 'O(log n)', FALSE);
END $$;