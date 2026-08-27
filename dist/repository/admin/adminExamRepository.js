import { pool } from '../../config/database.js';
const EXAM_FIELDS = `
    e.id, 
    e.exam_order_number AS "examOrderNumber", 
    e.title, 
    e.description,
    TO_CHAR(e.starting_date, 'YYYY-MM-DD HH24:MI') AS "startingDate", 
    TO_CHAR(e.ending_date, 'YYYY-MM-DD HH24:MI') AS "endingDate", 
    TO_CHAR(e.created_at, 'YYYY-MM-DD HH24:MI') AS "createdAt"
`;
export class ExamRepository {
    async insert(dto) {
        const inserted = await pool.query(`INSERT INTO exams (course_id, title, description, starting_date, ending_date)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id`, [dto.title, dto.description ?? '', dto.startingDate, dto.endingDate]);
        const examId = inserted.rows[0].id;
        const exam = await this.findById(examId);
        if (!exam)
            throw new Error("Erreur lors de la création de l'examen");
        return exam;
    }
    async update(id, dto) {
        const updated = await pool.query(`UPDATE exams SET
                title = COALESCE($2, title),
                description = COALESCE($3, description),
                starting_date = COALESCE($4, starting_date),
                ending_date = COALESCE($5, ending_date),
                course_id = COALESCE($6, course_id)
             WHERE id = $1
             RETURNING id`, [id, dto.title ?? null, dto.description ?? null, dto.startingDate ?? null, dto.endingDate ?? null, dto.courseId ?? null]);
        if (updated.rowCount === 0)
            throw new Error('Examen introuvable');
        const exam = await this.findById(id);
        if (!exam)
            throw new Error('Examen introuvable');
        return exam;
    }
    async delete(id) {
        const attempts = await pool.query('SELECT COUNT(*) FROM attempts WHERE exam_id = $1', [id]);
        if (parseInt(attempts.rows[0].count, 10) > 0) {
            throw new Error('Impossible de supprimer un examen qui possède des tentatives');
        }
        const result = await pool.query('DELETE FROM exams WHERE id = $1', [id]);
        if (result.rowCount === 0)
            throw new Error('Examen introuvable');
    }
    async findAll() {
        const result = await pool.query(`SELECT ${EXAM_FIELDS},
                    EXISTS(SELECT 1 FROM attempts a WHERE a.exam_id = e.id) AS "hasAttempts"
             FROM exams e 
             JOIN courses c ON c.id = e.course_id
             ORDER BY e.exam_order_number`);
        return result.rows;
    }
    async findById(id) {
        const result = await pool.query(`SELECT ${EXAM_FIELDS} 
             FROM exams e 
             JOIN courses c ON c.id = e.course_id 
             WHERE e.id = $1`, [id]);
        return result.rows[0] ?? null;
    }
    async findAvailable(userId) {
        let query = `
            SELECT ${EXAM_FIELDS}
            FROM exams e 
            JOIN courses c ON c.id = e.course_id
            WHERE NOW() BETWEEN e.starting_date AND e.ending_date
        `;
        const params = [];
        if (userId) {
            query += ` AND NOT EXISTS (SELECT 1 FROM attempts a WHERE a.exam_id = e.id AND a.user_id = $1)`;
            params.push(userId);
        }
        query += ' ORDER BY e.starting_date';
        const result = await pool.query(query, params);
        return result.rows;
    }
    async isAvailable(examId) {
        const result = await pool.query(`SELECT 1 FROM exams WHERE id = $1 AND NOW() BETWEEN starting_date AND ending_date`, [examId]);
        return result.rowCount !== null && result.rowCount > 0;
    }
    async hasAttempts(examId) {
        const result = await pool.query('SELECT COUNT(*) FROM attempts WHERE exam_id = $1', [examId]);
        return parseInt(result.rows[0].count, 10) > 0;
    }
    async findResultsByExamId(examId) {
        const result = await pool.query(`SELECT a.id, 
                    a.attempt_order_number AS "attemptOrderNumber",
                    a.score, 
                    TO_CHAR(a.submitted_at, 'YYYY-MM-DD HH24:MI') AS "submittedAt",
                    a.user_id AS "userId", 
                    a.exam_id AS "examId",
                    u.first_name || ' ' || u.last_name AS "studentName",
                    u.email AS "studentEmail"
             FROM attempts a 
             JOIN users u ON u.id = a.user_id
             WHERE a.exam_id = $1 
             ORDER BY a.submitted_at DESC`, [examId]);
        return result.rows;
    }
    async count() {
        const result = await pool.query('SELECT COUNT(*) FROM exams');
        return parseInt(result.rows[0].count, 10);
    }
}
