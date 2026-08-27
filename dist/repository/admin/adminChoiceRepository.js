import { pool } from '../../config/database.js';
const CHOICE_FIELDS = `
    id, 
    choice_order_index AS "choiceOrderIndex", 
    content
`;
export class ChoiceRepository {
    async insert(questionId, content, orderIndex) {
        const hasAttempts = await this.questionHasAttempts(questionId);
        if (hasAttempts)
            throw new Error('Choix verrouillés : des tentatives existent');
        const result = await pool.query(`INSERT INTO choices (question_id, choice_order_index, content)
             VALUES ($1, $2, $3)
             RETURNING ${CHOICE_FIELDS}`, [questionId, orderIndex, content]);
        return result.rows[0];
    }
    async updateContent(id, content) {
        const hasAttempts = await this.choiceHasAttempts(id);
        if (hasAttempts)
            throw new Error('Choix verrouillés : des tentatives existent');
        const result = await pool.query(`UPDATE choices SET content = $2 WHERE id = $1
             RETURNING ${CHOICE_FIELDS}`, [id, content]);
        if (result.rowCount === 0)
            throw new Error('Choix introuvable');
        return result.rows[0];
    }
    async delete(id) {
        const hasAttempts = await this.choiceHasAttempts(id);
        if (hasAttempts)
            throw new Error('Choix verrouillés : des tentatives existent');
        const result = await pool.query('DELETE FROM choices WHERE id = $1', [id]);
        if (result.rowCount === 0)
            throw new Error('Choix introuvable');
    }
    async findByQuestionId(questionId) {
        const result = await pool.query(`SELECT ${CHOICE_FIELDS}
             FROM choices 
             WHERE question_id = $1 
             ORDER BY choice_order_index`, [questionId]);
        return result.rows;
    }
    async findById(id) {
        const result = await pool.query(`SELECT ${CHOICE_FIELDS} FROM choices WHERE id = $1`, [id]);
        return result.rows[0] ?? null;
    }
    async questionHasAttempts(questionId) {
        const result = await pool.query(`SELECT EXISTS(
                SELECT 1 FROM attempts a
                JOIN questions q ON q.exam_id = a.exam_id
                WHERE q.id = $1
             ) AS has_attempts`, [questionId]);
        return result.rows[0].has_attempts;
    }
    async choiceHasAttempts(choiceId) {
        const result = await pool.query(`SELECT EXISTS(
                SELECT 1 FROM attempts a
                JOIN questions q ON q.exam_id = a.exam_id
                JOIN choices c ON c.question_id = q.id
                WHERE c.id = $1
             ) AS has_attempts`, [choiceId]);
        return result.rows[0].has_attempts;
    }
}
