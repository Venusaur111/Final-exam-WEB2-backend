export interface Exam {
    id: string;
    courseId: string;
    title: string;
    description: string | null;
    startAt: Date;
    endAt: Date;
    createdAt: Date;
    hasAttempts?: boolean;
    courseName?: string;
    courseCode?: string;
}

export interface CreateExamInput {
    courseId: string;
    title: string;
    description?: string;
    startAt: Date;
    endAt: Date;
}

export interface UpdateExamInput {
    title?: string;
    description?: string;
    startAt?: Date;
    endAt?: Date;
}

// Ligne agrégée pour GET /api/exams/:id/results
export interface ExamResultRow {
    studentId: string;
    studentName: string;
    studentEmail: string;
    score: number;
    maxScore: number;
    submittedAt: Date;
}

export interface ExamResultsSummary {
    rows: ExamResultRow[];
    average: number;
    attemptsCount: number;
    maxScore: number;
}