import { pool } from "../../config/database.js";

import { Exam } from "../../models/examModel.js";
import { QuestionForStudent } from "../../models/questionModel.js";
import {
    Attempt,
    SubmitAnswerInput,
} from "../../models/attempt.js";
import {
    ExamCorrection,
    AnswerCorrection,
} from "../../models/answer.js";

export class StudentExamRepository {
    async findAvailableExams(
        studentId: string
    ): Promise<Exam[]> {
        const result = await pool.query(
            `SELECT
                e.id,
                e.course_id AS "courseId",
                e.title,
                e.description,
                e.start_at AS "startAt",
                e.end_at AS "endAt",
                e.created_at AS "createdAt",
                c.name AS "courseName",
                c.code AS "courseCode"
             FROM exams e
             JOIN courses c ON c.id = e.course_id
             WHERE e.start_at <= now()
               AND e.end_at >= now()
               AND NOT EXISTS (
                   SELECT 1
                   FROM attempts a
                   WHERE a.exam_id = e.id
                     AND a.student_id = $1
               )
             ORDER BY e.end_at`,
            [studentId]
        );

        return result.rows;
    }

    async findExamById(
        examId: string
    ): Promise<Exam | null> {
        const result = await pool.query(
            `SELECT
                e.id,
                e.course_id AS "courseId",
                e.title,
                e.description,
                e.start_at AS "startAt",
                e.end_at AS "endAt",
                e.created_at AS "createdAt",
                c.name AS "courseName",
                c.code AS "courseCode"
             FROM exams e
             JOIN courses c ON c.id = e.course_id
             WHERE e.id = $1`,
            [examId]
        );

        return result.rows[0] ?? null;
    }

    async isWithinWindow(
        examId: string,
        now: Date = new Date()
    ): Promise<boolean> {
        const result = await pool.query(
            `SELECT 1
             FROM exams
             WHERE id = $1
               AND start_at <= $2
               AND end_at >= $2`,
            [examId, now]
        );

        return (result.rowCount ?? 0) > 0;
    }

    async hasAttempt(
        examId: string,
        studentId: string
    ): Promise<boolean> {
        const result = await pool.query(
            `SELECT 1
             FROM attempts
             WHERE exam_id = $1
               AND student_id = $2`,
            [examId, studentId]
        );

        return (result.rowCount ?? 0) > 0;
    }

    async getQuestionsForStudent(
        examId: string
    ): Promise<QuestionForStudent[]> {
        const result = await pool.query(
            `SELECT
                q.id,
                q.statement,
                q.points,
                c.id AS "choiceId",
                c.label AS "choiceLabel"
             FROM questions q
             LEFT JOIN choices c
                    ON c.question_id = q.id
             WHERE q.exam_id = $1
             ORDER BY q.created_at, c.label`,
            [examId]
        );

        const map = new Map<
            string,
            QuestionForStudent
        >();

        for (const row of result.rows) {
            if (!map.has(row.id)) {
                map.set(row.id, {
                    id: row.id,
                    statement: row.statement,
                    points: row.points,
                    choices: [],
                });
            }

            if (row.choiceId) {
                map.get(row.id)!.choices.push({
                    id: row.choiceId,
                    questionId: row.id,
                    label: row.choiceLabel,
                });
            }
        }

        return Array.from(map.values());
    }

    async submitExam(
        examId: string,
        studentId: string,
        answers: SubmitAnswerInput[]
    ): Promise<ExamCorrection> {
        const client = await pool.connect();

        try {
            await client.query("BEGIN");

            const attemptResult = await client.query(
                `INSERT INTO attempts (
                    exam_id,
                    student_id,
                    submitted_at
                )
                VALUES ($1, $2, now())
                RETURNING
                    id,
                    exam_id AS "examId",
                    student_id AS "studentId",
                    score,
                    started_at AS "startedAt",
                    submitted_at AS "submittedAt"`,
                [examId, studentId]
            );

            const attempt: Attempt =
                attemptResult.rows[0];

            for (const answer of answers) {
                await client.query(
                    `INSERT INTO answers (
                        attempt_id,
                        question_id,
                        choice_id
                    )
                    VALUES ($1, $2, $3)`,
                    [
                        attempt.id,
                        answer.questionId,
                        answer.choiceId ?? null,
                    ]
                );
            }

            const correction =
                await this.buildCorrection(
                    client,
                    attempt.id,
                    examId
                );

            await client.query(
                `UPDATE attempts
                 SET score = $2
                 WHERE id = $1`,
                [
                    attempt.id,
                    correction.score,
                ]
            );

            await client.query("COMMIT");

            // IMPORTANT :
            // On retourne uniquement la correction.
            // submittedAt sera ajouté dans le service si nécessaire.
            return correction;
        } catch (err) {
            await client.query("ROLLBACK");
            throw err;
        } finally {
            client.release();
        }
    }

    async findMyResults(
        studentId: string
    ): Promise<ExamCorrection[]> {
        const attempts = await pool.query(
            `SELECT
                a.id AS "attemptId",
                e.id AS "examId",
                e.title AS "examTitle",
                c.name AS "courseName",
                a.score,
                a.submitted_at AS "submittedAt"
             FROM attempts a
             JOIN exams e
                    ON e.id = a.exam_id
             JOIN courses c
                    ON c.id = e.course_id
             WHERE a.student_id = $1
             ORDER BY a.submitted_at DESC`,
            [studentId]
        );

        const results: ExamCorrection[] = [];

        for (const row of attempts.rows) {
            const correction =
                await this.buildCorrection(
                    pool,
                    row.attemptId,
                    row.examId
                );

            results.push({
                ...correction,
                examTitle: row.examTitle,
                courseName: row.courseName,
                submittedAt: row.submittedAt,
            });
        }

        return results;
    }

    async getCorrectionForAttempt(
        attemptId: string,
        studentId: string
    ): Promise<ExamCorrection | null> {
        const attemptResult = await pool.query(
            `SELECT
                a.id,
                a.exam_id AS "examId",
                a.score,
                e.title AS "examTitle",
                c.name AS "courseName",
                a.submitted_at AS "submittedAt"
             FROM attempts a
             JOIN exams e
                    ON e.id = a.exam_id
             JOIN courses c
                    ON c.id = e.course_id
             WHERE a.id = $1
               AND a.student_id = $2`,
            [attemptId, studentId]
        );

        const attempt = attemptResult.rows[0];

        if (!attempt) {
            return null;
        }

        const correction =
            await this.buildCorrection(
                pool,
                attemptId,
                attempt.examId
            );

        return {
            ...correction,
            examTitle: attempt.examTitle,
            courseName: attempt.courseName,
            submittedAt: attempt.submittedAt,
        };
    }

    async getCorrectionForExam(
        examId: string,
        studentId: string
    ): Promise<ExamCorrection | null> {
        const attemptResult = await pool.query(
            `SELECT
                a.id,
                a.exam_id AS "examId",
                a.score,
                e.title AS "examTitle",
                c.name AS "courseName",
                a.submitted_at AS "submittedAt"
             FROM attempts a
             JOIN exams e
                    ON e.id = a.exam_id
             JOIN courses c
                    ON c.id = e.course_id
             WHERE a.exam_id = $1
               AND a.student_id = $2
             ORDER BY a.submitted_at DESC
             LIMIT 1`,
            [examId, studentId]
        );

        const attempt = attemptResult.rows[0];

        if (!attempt) {
            return null;
        }

        const correction =
            await this.buildCorrection(
                pool,
                attempt.id,
                attempt.examId
            );

        return {
            ...correction,
            examTitle: attempt.examTitle,
            courseName: attempt.courseName,
            submittedAt: attempt.submittedAt,
        };
    }

    private async buildCorrection(
        queryable: {
            query: (
                text: string,
                params?: any[]
            ) => Promise<any>;
        },
        attemptId: string,
        examId: string
    ): Promise<ExamCorrection> {
        const correctionResult =
            await queryable.query(
                `SELECT
                    q.id AS "questionId",
                    q.statement,
                    q.points,

                    a.choice_id AS "chosenChoiceId",
                    chosen.label AS "chosenChoiceLabel",

                    correct.id AS "correctChoiceId",
                    correct.label AS "correctChoiceLabel",

                    (
                        a.choice_id IS NOT NULL
                        AND a.choice_id = correct.id
                    ) AS "isCorrect"

                 FROM questions q

                 LEFT JOIN answers a
                        ON a.question_id = q.id
                       AND a.attempt_id = $1

                 LEFT JOIN choices chosen
                        ON chosen.id = a.choice_id

                 JOIN choices correct
                        ON correct.question_id = q.id
                       AND correct.is_correct = TRUE

                 WHERE q.exam_id = $2

                 ORDER BY q.created_at`,
                [attemptId, examId]
            );

        const corrections: AnswerCorrection[] =
            correctionResult.rows.map(
                (row: any) => ({
                    questionId:
                        row.questionId,

                    statement:
                        row.statement,

                    points:
                        row.points,

                    chosenChoiceId:
                        row.chosenChoiceId,

                    chosenChoiceLabel:
                        row.chosenChoiceLabel ?? null,

                    correctChoiceId:
                        row.correctChoiceId,

                    correctChoiceLabel:
                        row.correctChoiceLabel,

                    isCorrect:
                        Boolean(row.isCorrect),

                    earnedPoints:
                        row.isCorrect
                            ? row.points
                            : 0,
                })
            );

        const score =
            corrections.reduce(
                (sum, c) =>
                    sum + c.earnedPoints,
                0
            );

        const maxScore =
            corrections.reduce(
                (sum, c) =>
                    sum + c.points,
                0
            );

        return {
            attemptId,
            examId,
            score,
            maxScore,
            corrections,
        };
    }
}