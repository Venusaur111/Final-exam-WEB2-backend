export interface Question {
    id: string; // UUID
    questionNumber: number; // Serial number of the question
    examId: string; // Foreign key referencing the exam
    correctAnswerIndex: number | null;
    content: string;
    score: number;
}