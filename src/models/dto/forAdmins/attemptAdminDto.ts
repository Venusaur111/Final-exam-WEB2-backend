export interface AdminAttemptResponseDto {
    id: string; // UUID
    attemptOrderNumber: number; // Serial
    score: number;
    submittedAt: string;
}