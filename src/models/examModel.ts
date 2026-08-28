// exam.ts

/**
 * Represents an exam entity.
 */
export interface Exam {
    readonly id: string;
    readonly courseId: string;
    readonly title: string;
    readonly description: string | null;
    readonly startAt: Date;
    readonly endAt: Date;
    readonly createdAt: Date;
}

/**
 * Represents the data required to create a new exam.
 */
export interface CreateExamInput {
    readonly courseId: string;
    readonly title: string;
    readonly description?: string;
    readonly startAt: Date;
    readonly endAt: Date;
}

/**
 * Represents the data allowed for updating an existing exam.
 */
export interface UpdateExamInput {
    readonly title?: string;
    readonly description?: string;
    readonly startAt?: Date;
    readonly endAt?: Date;
}

/**
 * Represents an aggregated result row for GET /api/exams/:id/results.
 */
export interface ExamResultRow {
    readonly studentId: string;
    readonly studentName: string;
    readonly score: number;
    readonly submittedAt: Date;
}

/**
 * Represents the summary of results for an exam.
 */
export interface ExamResultsSummary {
    readonly rows: readonly ExamResultRow[];
    readonly average: number;
    readonly attemptsCount: number;
}