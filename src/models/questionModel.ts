// question.ts
import { Choice, ChoiceForStudent, CreateChoiceInput } from "./choice.js";

/**
 * Represents a question entity.
 */
export interface Question {
    readonly id: string;
    readonly examId: string;
    readonly statement: string;
    readonly points: number;
    readonly createdAt: Date;
}

/**
 * Represents the admin view of a question with its choices, where is_correct is visible[cite: 14].
 */
export interface QuestionWithChoices extends Question {
    readonly choices: readonly Choice[];
}

/**
 * Represents the student view of a question (RG-07: is_correct is never present)[cite: 14].
 */
export interface QuestionForStudent {
    readonly id: string;
    readonly statement: string;
    readonly points: number;
    readonly choices: readonly ChoiceForStudent[];
}

/**
 * Represents the data required to create a new question[cite: 14].
 */
export interface CreateQuestionInput {
    readonly statement: string;
    readonly points: number;
    readonly choices: readonly CreateChoiceInput[]; // between 2 and 6, exactly one correct (RG-04)[cite: 14]
}

/**
 * Represents the data allowed for updating an existing question[cite: 14].
 */
export interface UpdateQuestionInput {
    readonly statement?: string;
    readonly points?: number;
    readonly choices?: readonly CreateChoiceInput[]; // replaces all choices if provided[cite: 14]
}