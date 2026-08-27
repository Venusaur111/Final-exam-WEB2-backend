export interface Exam {
    id: string; // UUID
    examOrderNumber: number; // Serial number of the exam
    courseId: string; // Foreign key referencing the course (subject)
    title: string;
    description: string;
    startingDate: string; // Format: Year-Month-Day Hour:Minute
    endingDate: string; // Format: Year-Month-Day Hour:Minute
    createdAt: string; // Format: Year-Month-Day Hour:Minute
}