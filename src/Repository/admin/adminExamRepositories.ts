import { pool } from "../../config/database.js";
import {
    Exam,
    CreateExamInput,
    UpdateExamInput,
    ExamResultsSummary,
    ExamResultRow,
} from "../../models/examModel.js";

export class ExamRepository {
    async findAll(): Promise<Exam[]> {
        const result = await pool.query(
            `SELECT e.id, e.course_id AS "courseId", e.title, e.description,
                    e.start_at AS "startAt", e.end_at AS "endAt", e.created_at AS "createdAt",
                    c.name AS "courseName", c.code AS "courseCode",
                    EXISTS(SELECT 1 FROM attempts a WHERE a.exam_id = e.id) AS "hasAttempts"
             FROM exams e
             JOIN courses c ON c.id = e.course_id
             ORDER BY e.start_at DESC`
        );
        return result.rows;
    }

    async findByCourse(courseId: string): Promise<Exam[]> {
        const result = await pool.query(
            `SELECT id, course_id AS "courseId", title, description,
                    start_at AS "startAt", end_at AS "endAt", created_at AS "createdAt"
             FROM exams
             WHERE course_id = $1
             ORDER BY start_at DESC`,
            [courseId]
        );
        return result.rows;
    }

    async findById(id: string): Promise<Exam | null> {
        const result = await pool.query(
            `SELECT e.id, e.course_id AS "courseId", e.title, e.description,
                    e.start_at AS "startAt", e.end_at AS "endAt", e.created_at AS "createdAt",
                    c.name AS "courseName", c.code AS "courseCode",
                    EXISTS(SELECT 1 FROM attempts a WHERE a.exam_id = e.id) AS "hasAttempts"
             FROM exams e
             JOIN courses c ON c.id = e.course_id
             WHERE e.id = $1`,
            [id]
        );
        return result.rows[0] ?? null;
    }

    async create(data: CreateExamInput): Promise<Exam> {
        const result = await pool.query(
            `INSERT INTO exams (course_id, title, description, start_at, end_at)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, course_id AS "courseId", title, description,
                       start_at AS "startAt", end_at AS "endAt", created_at AS "createdAt"`,
            [data.courseId, data.title, data.description ?? null, data.startAt, data.endAt]
        );
        return result.rows[0];
    }

    async update(id: string, data: UpdateExamInput): Promise<Exam | null> {
        const result = await pool.query(
            `UPDATE exams
             SET title       = COALESCE($2, title),
                 description = COALESCE($3, description),
                 start_at    = COALESCE($4, start_at),
                 end_at      = COALESCE($5, end_at)
             WHERE id = $1
             RETURNING id, course_id AS "courseId", title, description,
                       start_at AS "startAt", end_at AS "endAt", created_at AS "createdAt"`,
            [id, data.title ?? null, data.description ?? null, data.startAt ?? null, data.endAt ?? null]
        );
        return result.rows[0] ?? null;
    }

    // RG-09 : ON DELETE RESTRICT sur attempts.exam_id bloque si tentatives
    async delete(id: string): Promise<void> {
        await pool.query(`DELETE FROM exams WHERE id = $1`, [id]);
    }

    async hasAttempts(id: string): Promise<boolean> {
        const result = await pool.query(
            `SELECT 1 FROM attempts WHERE exam_id = $1 LIMIT 1`,
            [id]
        );
        return (result.rowCount ?? 0) > 0;
    }

    async isWithinWindow(id: string, now: Date = new Date()): Promise<boolean> {
        const result = await pool.query(
            `SELECT 1 FROM exams WHERE id = $1 AND start_at <= $2 AND end_at >= $2`,
            [id, now]
        );
        return (result.rowCount ?? 0) > 0;
    }

    async getResultsSummary(examId: string): Promise<ExamResultsSummary> {
        const maxScoreResult = await pool.query(
            `SELECT COALESCE(SUM(points), 0)::int AS "maxScore" FROM questions WHERE exam_id = $1`,
            [examId]
        );
        const maxScore = maxScoreResult.rows[0]?.maxScore ?? 0;

        const result = await pool.query(
            `SELECT u.id AS "studentId", u.name AS "studentName", u.email AS "studentEmail",
                    a.score, a.submitted_at AS "submittedAt", $2::int AS "maxScore"
             FROM attempts a
             JOIN users u ON u.id = a.student_id
             WHERE a.exam_id = $1
             ORDER BY a.submitted_at DESC`,
            [examId, maxScore]
        );
        const rows: ExamResultRow[] = result.rows;
        const attemptsCount = rows.length;
        const average =
            attemptsCount === 0
                ? 0
                : rows.reduce((sum, r) => sum + (r.score ?? 0), 0) / attemptsCount;

        return { rows, average, attemptsCount, maxScore };
    }
}