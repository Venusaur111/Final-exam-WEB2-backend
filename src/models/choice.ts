export interface Choice {
    id: string; // UUID
    choiceOrderIndex: number; // Serial number of the choice
    questionId: string; // Foreign key referencing the question
    content: string;
}