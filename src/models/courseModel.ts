export interface Course {
    id: string;
    code: string;
    name: string;
    description: string | null;
    createdAt: Date;
}
 
export interface CreateCourseInput {
    code: string;
    name: string;
    description?: string;
}
 
export interface UpdateCourseInput {
    code?: string;
    name?: string;
    description?: string;
}