// user.ts

export type Role = "admin" | "student";

/**
 * Represents a user entity.
 */
export interface User {
    readonly id: string;
    readonly name: string;
    readonly email: string;
    readonly passwordHash: string;
    readonly role: Role;
    readonly isActive: boolean;
    readonly createdAt: Date;
}

/**
 * Represents a practical subtype for API responses (RG-06/RG-07: passwordHash is never exposed).
 */
export type PublicUser = Omit<User, "passwordHash">;

/**
 * Represents the data required to create a student.
 */
export interface CreateStudentInput {
    readonly name: string;
    readonly email: string;
    readonly passwordHash: string; // already hashed upstream by the Service (bcrypt)
}

/**
 * Represents the data allowed for updating a student.
 */
export interface UpdateStudentInput {
    readonly name?: string;
    readonly email?: string;
}