// choice.ts

/**
 * Represents a choice option for a question.
 */
export interface Choice {
    readonly id: string;
    readonly questionId: string;
    readonly label: string;
    readonly isCorrect: boolean;
}

/**
 * Represents the choice view exposed to students (RG-07: never exposes isCorrect)[cite: 27].
 */
export type ChoiceForStudent = Omit<Choice, "isCorrect">;

/**
 * Represents the data required to create a new choice.
 */
export interface CreateChoiceInput {
    readonly label: string;
    readonly isCorrect: boolean;
}