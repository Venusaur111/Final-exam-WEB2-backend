// course.ts

/**
 * Represents a course entity.
 */
export interface Course {
    readonly id: string;
    readonly code: string;
    readonly name: string;
    readonly description: string | null;
    readonly createdAt: Date;
}

/**
 * Represents the data required to create a new course[cite: 18].
 */
export interface CreateCourseInput {
    readonly code: string;
    readonly name: string;
    readonly description?: string;
}

/**
 * Represents the data allowed for updating an existing course[cite: 18].
 */
export interface UpdateCourseInput {
    readonly code?: string;
    readonly name?: string;
    readonly description?: string;
}