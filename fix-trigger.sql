DROP TRIGGER IF EXISTS trg_validate_question_choices ON choices;
DROP FUNCTION IF EXISTS validate_question_choices();

CREATE FUNCTION validate_question_choices()
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

.
    IF NOT EXISTS (SELECT 1 FROM questions WHERE id = v_question_id) THEN
        RETURN NULL;
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


SELECT prosrc FROM pg_proc WHERE proname = 'validate_question_choices';
