export interface Attempt {
    id: string; // UUID
    attemptOrderNumber: number; // Serial
    score: number;
    submittedAt: string; // Format: Year-Month-Day Hour:Minute
}