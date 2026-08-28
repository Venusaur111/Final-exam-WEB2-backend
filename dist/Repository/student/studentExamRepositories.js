// studentExamRepository.ts
import { pool } from "../../config/database.js";
export class StudentExamRepository {
    // RG-02 + RG-03: open window AND no existing attempt[cite: 10]
    async findAvailableExams(studentId) {
        const result = await pool.query(`SELECT e.id, e.course_id AS "courseId", e.title, e.description,
                    e.start_at AS "startAt", e.end_at AS "endAt", e.created_at AS "createdAt"
             FROM exams e
             WHERE e.start_at <= now() AND e.end_at >= now()
               AND NOT EXISTS (
                 SELECT 1 FROM attempts a
                 WHERE a.exam_id = e.id AND a.student_id = $1
             )
             ORDER BY e.end_at`, [studentId]);
        return result.rows;
    }
    async findExamById(examId) {
        const result = await pool.query(`SELECT id, course_id AS "courseId", title, description,
                    start_at AS "startAt", end_at AS "endAt", created_at AS "createdAt"
             FROM exams WHERE id = $1`, [examId]);
        return result.rows[0] ?? null;
    }
    async isWithinWindow(examId, now = new Date()) {
        const result = await pool.query(`SELECT 1 FROM exams WHERE id = $1 AND start_at <= $2 AND end_at >= $2`, [examId, now]);
        return (result.rowCount ?? 0) > 0;
    }
    async hasAttempt(examId, studentId) {
        const result = await pool.query(`SELECT 1 FROM attempts WHERE exam_id = $1 AND student_id = $2`, [examId, studentId]);
        return (result.rowCount ?? 0) > 0;
    }
    // RG-07: is_correct never selected[cite: 10]
    async getQuestionsForStudent(examId) {
        const result = await pool.query(`SELECT q.id, q.statement, q.points,
                    c.id AS "choiceId", c.label AS "choiceLabel"
             FROM questions q
                      LEFT JOIN choices c ON c.question_id = q.id
             WHERE q.exam_id = $1
             ORDER BY q.created_at, c.label`, [examId]);
        const map = new Map();
        for (const row of result.rows) {
            if (!map.has(row.id)) {
                map.set(row.id, { id: row.id, statement: row.statement, points: row.points, choices: [] });
            }
            if (row.choiceId) {
                map.get(row.id).choices.push({ id: row.choiceId, questionId: row.id, label: row.choiceLabel });
            }
        }
        return Array.from(map.values());
    }
    // RG-02 (uniqueness also guaranteed by database UNIQUE constraint) +
    // RG-05 (null choice allowed) + RG-06 (score calculated and written here,
    // never received from client) — all within a single transaction[cite: 10].
    async submitExam(examId, studentId, answers) {
        const client = await pool.connect();
        try {
            await client.query("BEGIN");
            const attemptResult = await client.query(`INSERT INTO attempts (exam_id, student_id, submitted_at)
                 VALUES ($1, $2, now())
                     RETURNING id, exam_id AS "examId", student_id AS "studentId",
                           score, started_at AS "startedAt", submitted_at AS "submittedAt"`, [examId, studentId]);
            const attempt = attemptResult.rows[0];
            for (const answer of answers) {
                await client.query(`INSERT INTO answers (attempt_id, question_id, choice_id)
                     VALUES ($1, $2, $3)`, [attempt.id, answer.questionId, answer.choiceId]);
            }
            // Score and correction calculation: questions/choices join
            // correct vs submitted choice. RG-06: server-side calculation exclusively[cite: 10].
            const correctionResult = await client.query(`SELECT q.id AS "questionId", q.statement, q.points,
                        a.choice_id AS "chosenChoiceId",
                        correct.id AS "correctChoiceId",
                        (a.choice_id = correct.id) AS "isCorrect"
                 FROM questions q
                          LEFT JOIN answers a
                                    ON a.question_id = q.id AND a.attempt_id = $1
                          JOIN choices correct
                               ON correct.question_id = q.id AND correct.is_correct = TRUE
                 WHERE q.exam_id = $2
                 ORDER BY q.created_at`, [attempt.id, examId]);
            const corrections = correctionResult.rows.map((row) => ({
                questionId: row.questionId,
                statement: row.statement,
                points: row.points,
                chosenChoiceId: row.chosenChoiceId,
                correctChoiceId: row.correctChoiceId,
                isCorrect: Boolean(row.isCorrect),
                earnedPoints: row.isCorrect ? row.points : 0,
            }));
            const score = corrections.reduce((sum, c) => sum + c.earnedPoints, 0);
            const maxScore = corrections.reduce((sum, c) => sum + c.points, 0);
            await client.query(`UPDATE attempts SET score = $2 WHERE id = $1`, [attempt.id, score]);
            await client.query("COMMIT");
            return { attemptId: attempt.id, examId, score, maxScore, corrections };
        }
        catch (err) {
            await client.query("ROLLBACK");
            throw err;
        }
        finally {
            client.release();
        }
    }
    async findMyResults(studentId) {
        const result = await pool.query(`SELECT a.id AS "attemptId", e.id AS "examId", e.title AS "examTitle",
                    a.score, a.submitted_at AS "submittedAt"
             FROM attempts a
                      JOIN exams e ON e.id = a.exam_id
             WHERE a.student_id = $1
             ORDER BY a.submitted_at DESC`, [studentId]);
        return result.rows;
    }
    async getCorrectionForAttempt(attemptId, studentId) {
        const attemptResult = await pool.query(`SELECT id, exam_id AS "examId", score
             FROM attempts
             WHERE id = $1 AND student_id = $2`, [attemptId, studentId]);
        const attempt = attemptResult.rows[0];
        if (!attempt)
            return null;
        const result = await pool.query(`SELECT q.id AS "questionId", q.statement, q.points,
                    a.choice_id AS "chosenChoiceId",
                    correct.id AS "correctChoiceId",
                    (a.choice_id = correct.id) AS "isCorrect"
             FROM questions q
                      LEFT JOIN answers a
                                ON a.question_id = q.id AND a.attempt_id = $1
                      JOIN choices correct
                           ON correct.question_id = q.id AND correct.is_correct = TRUE
             WHERE q.exam_id = $2
             ORDER BY q.created_at`, [attemptId, attempt.examId]);
        const corrections = result.rows.map((row) => ({
            questionId: row.questionId,
            statement: row.statement,
            points: row.points,
            chosenChoiceId: row.chosenChoiceId,
            correctChoiceId: row.correctChoiceId,
            isCorrect: Boolean(row.isCorrect),
            earnedPoints: row.isCorrect ? row.points : 0,
        }));
        const maxScore = corrections.reduce((sum, c) => sum + c.points, 0);
        return { attemptId, examId: attempt.examId, score: attempt.score, maxScore, corrections };
    }
}
