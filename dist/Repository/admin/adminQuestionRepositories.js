import { pool } from "../../config/database.js";
export class QuestionRepository {
    async findByExam(examId) {
        const result = await pool.query(`SELECT q.id, q.exam_id AS "examId", q.statement, q.points, q.created_at AS "createdAt",
                    c.id AS "choiceId", c.label AS "choiceLabel", c.is_correct AS "choiceIsCorrect"
             FROM questions q
             LEFT JOIN choices c ON c.question_id = q.id
             WHERE q.exam_id = $1
             ORDER BY q.created_at, c.label`, [examId]);
        return this.groupAdminRows(result.rows);
    }
    async findByExamForStudent(examId) {
        // RG-07 : is_correct n'est jamais sélectionné ici
        const result = await pool.query(`SELECT q.id, q.statement, q.points,
                    c.id AS "choiceId", c.label AS "choiceLabel"
             FROM questions q
             LEFT JOIN choices c ON c.question_id = q.id
             WHERE q.exam_id = $1
             ORDER BY q.created_at, c.label`, [examId]);
        return this.groupStudentRows(result.rows);
    }
    async findById(id) {
        const result = await pool.query(`SELECT q.id, q.exam_id AS "examId", q.statement, q.points, q.created_at AS "createdAt",
                    c.id AS "choiceId", c.label AS "choiceLabel", c.is_correct AS "choiceIsCorrect"
             FROM questions q
             LEFT JOIN choices c ON c.question_id = q.id
             WHERE q.id = $1
             ORDER BY c.label`, [id]);
        const grouped = this.groupAdminRows(result.rows);
        return grouped[0] ?? null;
    }
    async getExamIdForQuestion(questionId) {
        const result = await pool.query(`SELECT exam_id AS "examId" FROM questions WHERE id = $1`, [questionId]);
        return result.rows[0]?.examId ?? null;
    }
    // Transaction : question + choix insérés ensemble.
    // Le trigger RG-04 (choices) est vérifié au COMMIT.
    async createWithChoices(examId, data) {
        const client = await pool.connect();
        try {
            await client.query("BEGIN");
            const questionResult = await client.query(`INSERT INTO questions (exam_id, statement, points)
                 VALUES ($1, $2, $3)
                 RETURNING id, exam_id AS "examId", statement, points, created_at AS "createdAt"`, [examId, data.statement, data.points]);
            const question = questionResult.rows[0];
            const choices = [];
            for (const choiceInput of data.choices) {
                const choiceResult = await client.query(`INSERT INTO choices (question_id, label, is_correct)
                     VALUES ($1, $2, $3)
                     RETURNING id, question_id AS "questionId", label, is_correct AS "isCorrect"`, [question.id, choiceInput.label, choiceInput.isCorrect]);
                choices.push(choiceResult.rows[0]);
            }
            await client.query("COMMIT");
            return { ...question, choices };
        }
        catch (err) {
            await client.query("ROLLBACK");
            throw err;
        }
        finally {
            client.release();
        }
    }
    // Remplace intégralement les choix si fournis. Le verrouillage RG-08
    // (examen avec tentatives) est vérifié en amont, côté Service.
    async update(id, data) {
        const client = await pool.connect();
        try {
            await client.query("BEGIN");
            await client.query(`UPDATE questions
                 SET statement = COALESCE($2, statement),
                     points    = COALESCE($3, points)
                 WHERE id = $1`, [id, data.statement ?? null, data.points ?? null]);
            if (data.choices) {
                await client.query(`DELETE FROM choices WHERE question_id = $1`, [id]);
                for (const choiceInput of data.choices) {
                    await client.query(`INSERT INTO choices (question_id, label, is_correct)
                         VALUES ($1, $2, $3)`, [id, choiceInput.label, choiceInput.isCorrect]);
                }
            }
            await client.query("COMMIT");
            return this.findById(id);
        }
        catch (err) {
            await client.query("ROLLBACK");
            throw err;
        }
        finally {
            client.release();
        }
    }
    // Verrouillage RG-08 vérifié côté Service avant l'appel.
    async delete(id) {
        await pool.query(`DELETE FROM questions WHERE id = $1`, [id]);
    }
    groupAdminRows(rows) {
        const map = new Map();
        for (const row of rows) {
            if (!map.has(row.id)) {
                map.set(row.id, {
                    id: row.id,
                    examId: row.examId,
                    statement: row.statement,
                    points: row.points,
                    createdAt: row.createdAt,
                    choices: [],
                });
            }
            if (row.choiceId) {
                map.get(row.id).choices.push({
                    id: row.choiceId,
                    questionId: row.id,
                    label: row.choiceLabel,
                    isCorrect: row.choiceIsCorrect,
                });
            }
        }
        return Array.from(map.values());
    }
    groupStudentRows(rows) {
        const map = new Map();
        for (const row of rows) {
            if (!map.has(row.id)) {
                map.set(row.id, {
                    id: row.id,
                    statement: row.statement,
                    points: row.points,
                    choices: [],
                });
            }
            if (row.choiceId) {
                map.get(row.id).choices.push({
                    id: row.choiceId,
                    questionId: row.id,
                    label: row.choiceLabel,
                });
            }
        }
        return Array.from(map.values());
    }
}
