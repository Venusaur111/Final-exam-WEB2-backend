export interface AdminExamResponseDto {
    id: string; // UUID
    examOrderNumber: number; // Serial
    title: string;
    description: string;
    startingDate: string;
    endingDate: string;
    createdAt: string;
}