export interface Attempt {
    id: string; // UUID
    attemptnumber: number; // Serial
    score: number;
    submittedAt: string; // Format: Year-Month-Day Hour:Minute
}