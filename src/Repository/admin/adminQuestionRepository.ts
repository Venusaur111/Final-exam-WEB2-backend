import { pool } from '../../config/database.js';
import { Question } from '../../models/questionModel.js';
import { CreateQuestionDto } from '../../models/dto/createDtoTypes.js';
import { Choice } from '../../models/choice.js';

const QUESTION_FIELDS = `
    q.id, q.question_number AS "questionNumber", q.content, q.score, q.exam_id AS "examId"
`;

export class QuestionRepository {
  public async insert(examId: string, dto: CreateQuestionDto): Promise<Question> {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const qResult = await client.query(
            `INSERT INTO questions (exam_id, content, score, correct_answer_index) 
             VALUES ($1, $2, $3, $4)
             RETURNING 
                id, 
                question_number AS "questionNumber", 
                correct_answer_index AS "correctAnswerIndex", 
                content, 
                score`,
            [
                examId, 
                dto.content, 
                dto.score ?? 1, 
                dto.correctAnswerIndex ?? null
            ]
        );

        await client.query('COMMIT');
        return qResult.rows[0];
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
}

  public async updateContent(
        id: string, 
        content: string, 
        score?: number, 
        correctAnswerIndex?: number | null
    ): Promise<Question> {
        const hasAttempts = await this.examHasAttempts(id);
        if (hasAttempts) throw new Error('Questions verrouillées : des tentatives existent');

        const result = await pool.query(
            `UPDATE questions 
             SET 
                content = $2, 
                score = COALESCE($3, score),
                correct_answer_index = COALESCE($4, correct_answer_index)
             WHERE id = $1
             RETURNING ${QUESTION_FIELDS}`,
            [id, content, score ?? null, correctAnswerIndex ?? null]
        );
        
        if (result.rowCount === 0) throw new Error('Question introuvable');
        return result.rows[0];
    }

    public async delete(id: string): Promise<void> {
        const hasAttempts = await this.examHasAttempts(id);
        if (hasAttempts) throw new Error('Questions verrouillées : des tentatives existent');
        
        const result = await pool.query('DELETE FROM questions WHERE id = $1', [id]);
        if (result.rowCount === 0) throw new Error('Question introuvable');
    }

    public async findByExamId(examId: string): Promise<Question[]> {
        const qResult = await pool.query(
            `SELECT ${QUESTION_FIELDS} 
             FROM questions q 
             WHERE q.exam_id = $1 
             ORDER BY q.question_number`,
            [examId]
        );
        return qResult.rows;
    }

    public async findForStudent(examId: string): Promise<Omit<Question, 'correctAnswerIndex'>[]> {
        // Exclut correctAnswerIndex pour ne pas donner la bonne réponse à l'étudiant
        const qResult = await pool.query(
            `SELECT 
                q.id, 
                q.question_number AS "questionNumber", 
                q.content, 
                q.score 
             FROM questions q 
             WHERE q.exam_id = $1 
             ORDER BY q.question_number`,
            [examId]
        );
        return qResult.rows;
    }

    public async findById(id: string): Promise<Question | null> {
        const result = await pool.query(
            `SELECT ${QUESTION_FIELDS} FROM questions q WHERE q.id = $1`,
            [id]
        );
        return result.rows[0] ?? null;
    }

    private async examHasAttempts(questionId: string): Promise<boolean> {
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
}
