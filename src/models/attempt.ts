// attempt.ts

/**
 * Represents a student's attempt at an exam.
 */
export interface Attempt {
    readonly id: string;
    readonly examId: string;
    readonly studentId: string;
    readonly score: number | null; // null until submitted[cite: 26]
    readonly startedAt: Date;
    readonly submittedAt: Date | null;
}

/**
 * Represents the data sent by the client upon submission (RG-06: never includes score or isCorrect)[cite: 26].
 */
export interface SubmitAnswerInput {
    readonly questionId: string;
    readonly choiceId: string | null; // null allowed = question left unanswered (RG-05)[cite: 26]
}

/**
 * Represents the payload for submitting an entire exam.
 */
export interface SubmitExamInput {
    readonly answers: readonly SubmitAnswerInput[];
}