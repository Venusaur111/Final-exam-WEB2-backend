import { pool } from '../../config/database.js';
const COURSE_FIELDS = `
    id, 
    course_order_number AS "courseOrderNumber",
    course_code AS "courseCode", 
    name, 
    description,
    TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI') AS "createdAt"
`;
export class CourseRepository {
    async insert(dto) {
        const result = await pool.query(`INSERT INTO courses (course_code, name, description)
             VALUES ($1, $2, $3)
             RETURNING ${COURSE_FIELDS}`, [dto.courseCode, dto.name, dto.description ?? '']);
        return result.rows[0];
    }
    async update(id, dto) {
        const result = await pool.query(`UPDATE courses SET
                course_code = COALESCE($2, course_code),
                name = COALESCE($3, name),
                description = COALESCE($4, description)
             WHERE id = $1
             RETURNING ${COURSE_FIELDS}`, [id, dto.courseCode ?? null, dto.name ?? null, dto.description ?? null]);
        if (result.rowCount === 0)
            throw new Error('Cours introuvable');
        return result.rows[0];
    }
    async delete(id) {
        const exams = await pool.query('SELECT COUNT(*) FROM exams WHERE course_id = $1', [id]);
        if (parseInt(exams.rows[0].count, 10) > 0) {
            throw new Error('Impossible de supprimer un cours qui possède des examens');
        }
        const result = await pool.query('DELETE FROM courses WHERE id = $1', [id]);
        if (result.rowCount === 0)
            throw new Error('Cours introuvable');
    }
    async findAll() {
        const result = await pool.query(`SELECT ${COURSE_FIELDS} FROM courses ORDER BY course_order_number`);
        return result.rows;
    }
    async findById(id) {
        const result = await pool.query(`SELECT ${COURSE_FIELDS} FROM courses WHERE id = $1`, [id]);
        return result.rows[0] ?? null;
    }
    async count() {
        const result = await pool.query('SELECT COUNT(*) FROM courses');
        return parseInt(result.rows[0].count, 10);
    }
}
