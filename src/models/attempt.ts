export interface Attempt {
    id: string; // UUID
    attemptOrderNumber: number; // Serial number of the attempt
    userId: string; // Foreign key referencing the student user
    examId: string; // Foreign key referencing the exam
    score: number;
    submittedAt: string; // Format: Year-Month-Day Hour:Minute
}