export interface Question {
    id: string; // UUID
    questionNumber: number; // Serial
    correctAnswerIndex: number | null;
    content: string;
    score: number;
}