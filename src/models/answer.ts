// answer.ts

/**
 * Represents a student's answer to a specific question.
 */
export interface Answer {
    readonly id: string;
    readonly attemptId: string;
    readonly questionId: string;
    readonly choiceId: string | null; // RG-05: question left unanswered
}

/**
 * Represents an individual correction line displayed to the student after submission (RG-12).
 */
export interface AnswerCorrection {
    readonly questionId: string;
    readonly statement: string;
    readonly points: number;
    readonly chosenChoiceId: string | null;
    readonly correctChoiceId: string;
    readonly isCorrect: boolean;
    readonly earnedPoints: number;
}

/**
 * Represents the complete correction and grading summary for an exam attempt.
 */
export interface ExamCorrection {
    readonly attemptId: string;
    readonly examId: string;
    readonly score: number;
    readonly maxScore: number;
    readonly corrections: readonly AnswerCorrection[];
}