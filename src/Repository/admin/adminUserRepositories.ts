import { pool } from '../../config/database.js';
import { User, CreateStudentInput, UpdateStudentInput } from "../../models/userModel.js";

export class UserRepository {
    // Retrieves a student user by their unique identifier UUID
    async findById(id: string): Promise<User | null> {
        const result = await pool.query(
            `SELECT id, name, email, password_hash AS "passwordHash",
                    role, is_active AS "isActive", created_at AS "createdAt"
             FROM users
             WHERE id = $1 AND role = 'student'`,
            [id]
        );
        return result.rows[0] ?? null;
    }

// Retrieves a user by their email address
    async findByEmail(email: string): Promise<User | null> {
        const result = await pool.query(
            `SELECT id, name, email, password_hash AS "passwordHash",
                    role, is_active AS "isActive", created_at AS "createdAt"
             FROM users
             WHERE email = $1`,
            [email]
        );
        return result.rows[0] ?? null;
    }

// Retrieves all student users ordered by creation date descending
    async findAllStudents(): Promise<User[]> {
        const result = await pool.query(
            `SELECT id, name, email, password_hash AS "passwordHash",
                    role, is_active AS "isActive", created_at AS "createdAt"
             FROM users
             WHERE role = 'student'
             ORDER BY created_at DESC`
        );
        return result.rows;
    }

// Creates a new student user in the database
    async createStudent(data: CreateStudentInput): Promise<User> {
        const result = await pool.query(
            `INSERT INTO users (name, email, password_hash, role, is_active)
             VALUES ($1, $2, $3, 'student', TRUE)
                 RETURNING id, name, email, password_hash AS "passwordHash",
                       role, is_active AS "isActive", created_at AS "createdAt"`,
            [data.name, data.email, data.passwordHash]
        );
        return result.rows[0];
    }

// Updates student information dynamically using COALESCE
    async updateStudent(id: string, data: UpdateStudentInput): Promise<User | null> {
        const result = await pool.query(
            `UPDATE users
             SET name  = COALESCE($2, name),
                 email = COALESCE($3, email)
             WHERE id = $1 AND role = 'student'
                 RETURNING id, name, email, password_hash AS "passwordHash",
                       role, is_active AS "isActive", created_at AS "createdAt"`,
            [id, data.name ?? null, data.email ?? null]
        );
        return result.rows[0] ?? null;
    }

// Updates the password hash for a specific student
    async updatePassword(id: string, passwordHash: string): Promise<void> {
        await pool.query(
            `UPDATE users SET password_hash = $2 WHERE id = $1 AND role = 'student'`,
            [id, passwordHash]
        );
    }

// Deactivates a student account instead of physical deletion per business rule RG-10
    async deactivate(id: string): Promise<void> {
        await pool.query(
            `UPDATE users SET is_active = FALSE WHERE id = $1 AND role = 'student'`,
            [id]
        );
    }
}