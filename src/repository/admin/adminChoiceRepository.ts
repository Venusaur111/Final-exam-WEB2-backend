import { pool } from '../../config/database.js';
import { Choice } from '../../models/choice.js';
import { CreateChoiceDto } from '../../models/dto/createDtoTypes.js';

const CHOICE_FIELDS = `
    id, 
    choice_order_index AS "choiceOrderIndex", 
    content
`;

export class ChoiceRepository {
    public async insert(questionId: string, content: string, orderIndex: number): Promise<Choice> {
        const hasAttempts = await this.questionHasAttempts(questionId);
        if (hasAttempts) throw new Error('Choix verrouillés : des tentatives existent');

        const result = await pool.query(
            `INSERT INTO choices (question_id, choice_order_index, content)
             VALUES ($1, $2, $3)
             RETURNING ${CHOICE_FIELDS}`,
            [questionId, orderIndex, content]
        );
        return result.rows[0];
    }

    public async updateContent(id: string, content: string): Promise<Choice> {
        const hasAttempts = await this.choiceHasAttempts(id);
        if (hasAttempts) throw new Error('Choix verrouillés : des tentatives existent');

        const result = await pool.query(
            `UPDATE choices SET content = $2 WHERE id = $1
             RETURNING ${CHOICE_FIELDS}`,
            [id, content]
        );
        if (result.rowCount === 0) throw new Error('Choix introuvable');
        return result.rows[0];
    }

    public async delete(id: string): Promise<void> {
        const hasAttempts = await this.choiceHasAttempts(id);
        if (hasAttempts) throw new Error('Choix verrouillés : des tentatives existent');

        const result = await pool.query('DELETE FROM choices WHERE id = $1', [id]);
        if (result.rowCount === 0) throw new Error('Choix introuvable');
    }

    public async findByQuestionId(questionId: string): Promise<Choice[]> {
        const result = await pool.query(
            `SELECT ${CHOICE_FIELDS}
             FROM choices 
             WHERE question_id = $1 
             ORDER BY choice_order_index`,
            [questionId]
        );
        return result.rows;
    }

    public async findById(id: string): Promise<Choice | null> {
        const result = await pool.query(
            `SELECT ${CHOICE_FIELDS} FROM choices WHERE id = $1`,
            [id]
        );
        return result.rows[0] ?? null;
    }

    private async questionHasAttempts(questionId: string): Promise<boolean> {
        const result = await pool.query(
            `SELECT EXISTS(
                SELECT 1 FROM attempts a
                JOIN questions q ON q.exam_id = a.exam_id
                WHERE q.id = $1
             ) AS has_attempts`,
            [questionId]
        );
        return result.rows[0].has_attempts;
    }

    private async choiceHasAttempts(choiceId: string): Promise<boolean> {
        const result = await pool.query(
            `SELECT EXISTS(
                SELECT 1 FROM attempts a
                JOIN questions q ON q.exam_id = a.exam_id
                JOIN choices c ON c.question_id = q.id
                WHERE c.id = $1
             ) AS has_attempts`,
            [choiceId]
        );
        return result.rows[0].has_attempts;
    }
}