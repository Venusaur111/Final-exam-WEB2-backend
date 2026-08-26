export interface Exam {
    id: string; // UUID
    examOrderNumber: number; // Serial
    title: string;
    description: string;
    startingDate: string; // Format: Year-Month-Day Hour:Minute
    endingDate: string; // Format: Year-Month-Day Hour:Minute
    createdAt: string; // Format: Year-Month-Day Hour:Minute
}