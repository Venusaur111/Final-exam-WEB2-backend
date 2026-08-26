export interface AdminCourseResponseDto {
    id: string; // UUID
    courseOrderNumber: number; // Serial
    courseCode: string;
    name: string;
    description: string;
    createdAt: string;
}