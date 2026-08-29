import { pool } from "../../config/database.js";
export class CourseRepository {
    async findAll() {
        const result = await pool.query(`SELECT id, code, name, description, created_at AS "createdAt"
             FROM courses
             ORDER BY code`);
        return result.rows;
    }
    async findById(id) {
        const result = await pool.query(`SELECT id, code, name, description, created_at AS "createdAt"
             FROM courses WHERE id = $1`, [id]);
        return result.rows[0] ?? null;
    }
    async findByCode(code) {
        const result = await pool.query(`SELECT id, code, name, description, created_at AS "createdAt"
             FROM courses WHERE code = $1`, [code]);
        return result.rows[0] ?? null;
    }
    async create(data) {
        const result = await pool.query(`INSERT INTO courses (code, name, description)
             VALUES ($1, $2, $3)
             RETURNING id, code, name, description, created_at AS "createdAt"`, [data.code, data.name, data.description ?? null]);
        return result.rows[0];
    }
    async update(id, data) {
        const result = await pool.query(`UPDATE courses
             SET code        = COALESCE($2, code),
                 name        = COALESCE($3, name),
                 description = COALESCE($4, description)
             WHERE id = $1
             RETURNING id, code, name, description, created_at AS "createdAt"`, [id, data.code ?? null, data.name ?? null, data.description ?? null]);
        return result.rows[0] ?? null;
    }
    // RG-09 : la contrainte ON DELETE RESTRICT sur exams.course_id
    // fera échouer cette requête (23503) si le cours a des examens.
    async delete(id) {
        await pool.query(`DELETE FROM courses WHERE id = $1`, [id]);
    }
    async hasExams(id) {
        const result = await pool.query(`SELECT 1 FROM exams WHERE course_id = $1 LIMIT 1`, [id]);
        return (result.rowCount ?? 0) > 0;
    }
}
