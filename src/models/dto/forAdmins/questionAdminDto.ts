export interface AdminQuestionResponseDto {
    id: string; // UUID
    questionNumber: number; // Serial
    correctAnswerIndex: number | null; // Visible only for admins[cite: 14]
    content: string;
    score: number;
}