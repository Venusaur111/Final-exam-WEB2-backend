import { pool } from '../../config/database.js';
const QUESTION_FIELDS = `
    q.id, q.question_number AS "questionNumber", q.content, q.score, q.exam_id AS "examId"
`;
export class QuestionRepository {
    async insert(examId, dto) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const qResult = await client.query(`INSERT INTO questions (exam_id, content, score, correct_answer_index) 
             VALUES ($1, $2, $3, $4)
             RETURNING 
                id, 
                question_number AS "questionNumber", 
                correct_answer_index AS "correctAnswerIndex", 
                content, 
                score`, [
                examId,
                dto.content,
                dto.score ?? 1,
                dto.correctAnswerIndex ?? null
            ]);
            await client.query('COMMIT');
            return qResult.rows[0];
        }
        catch (e) {
            await client.query('ROLLBACK');
            throw e;
        }
        finally {
            client.release();
        }
    }
    async updateContent(id, content, score, correctAnswerIndex) {
        const hasAttempts = await this.examHasAttempts(id);
        if (hasAttempts)
            throw new Error('Questions verrouillées : des tentatives existent');
        const result = await pool.query(`UPDATE questions 
             SET 
                content = $2, 
                score = COALESCE($3, score),
                correct_answer_index = COALESCE($4, correct_answer_index)
             WHERE id = $1
             RETURNING ${QUESTION_FIELDS}`, [id, content, score ?? null, correctAnswerIndex ?? null]);
        if (result.rowCount === 0)
            throw new Error('Question introuvable');
        return result.rows[0];
    }
    async delete(id) {
        const hasAttempts = await this.examHasAttempts(id);
        if (hasAttempts)
            throw new Error('Questions verrouillées : des tentatives existent');
        const result = await pool.query('DELETE FROM questions WHERE id = $1', [id]);
        if (result.rowCount === 0)
            throw new Error('Question introuvable');
    }
    async findByExamId(examId) {
        const qResult = await pool.query(`SELECT ${QUESTION_FIELDS} 
             FROM questions q 
             WHERE q.exam_id = $1 
             ORDER BY q.question_number`, [examId]);
        return qResult.rows;
    }
    async findForStudent(examId) {
        // Exclut correctAnswerIndex pour ne pas donner la bonne réponse à l'étudiant
        const qResult = await pool.query(`SELECT 
                q.id, 
                q.question_number AS "questionNumber", 
                q.content, 
                q.score 
             FROM questions q 
             WHERE q.exam_id = $1 
             ORDER BY q.question_number`, [examId]);
        return qResult.rows;
    }
    async findById(id) {
        const result = await pool.query(`SELECT ${QUESTION_FIELDS} FROM questions q WHERE q.id = $1`, [id]);
        return result.rows[0] ?? null;
    }
    async examHasAttempts(questionId) {
        const result = await pool.query(`SELECT EXISTS(
                SELECT 1 FROM attempts a
                JOIN questions q ON q.exam_id = a.exam_id
                WHERE q.id = $1
             ) AS has_attempts`, [questionId]);
        return result.rows[0].has_attempts;
    }
}
