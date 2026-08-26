export interface Course {
    id: string; // UUID
    courseOrderNumber: number; // Serial
    courseCode: string;
    name: string;
    description: string;
    createdAt: string; // Format: Year-Month-Day Hour:Minute
}