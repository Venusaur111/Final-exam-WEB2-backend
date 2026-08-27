import { pool } from '../../config/database.js';
import { User } from '../../models/userModel.js';
import { CreateUserDto } from '../../models/dto/createDtoTypes.js';
import bcrypt from 'bcrypt';

const USER_FIELDS = `
    id, 
    user_number AS "userNumber", 
    email, 
    password,
    first_name AS "firstName", 
    last_name AS "lastName",
    status, 
    role, 
    TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI') AS "createdAt"
`;

export class UserRepository {
    public async insertStudent(dto: CreateUserDto): Promise<User> {
        const hashed = await bcrypt.hash(dto.password, 10);
        const result = await pool.query(
            `INSERT INTO users (email, password, first_name, last_name, status, role)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING ${USER_FIELDS}`,
            [dto.email, hashed, dto.firstName, dto.name, 'ACTIVE', 'STUDENT']
        );
        return result.rows[0];
    }

    public async update(id: string, dto: Partial<User>): Promise<User> {
        const result = await pool.query(
            `UPDATE users SET
                first_name = COALESCE($2, first_name),
                last_name = COALESCE($3, last_name),
                email = COALESCE($4, email)
             WHERE id = $1 AND role = 'STUDENT'
             RETURNING ${USER_FIELDS}`,
            [id, dto.firstName ?? null, dto.name ?? null, dto.email ?? null]
        );
        if (result.rowCount === 0) throw new Error('Étudiant introuvable');
        return result.rows[0];
    }

    public async updateStatus(id: string, status: string): Promise<User> {
        const result = await pool.query(
            `UPDATE users SET status = $2 WHERE id = $1 AND role = 'STUDENT'
             RETURNING ${USER_FIELDS}`,
            [id, status]
        );
        if (result.rowCount === 0) throw new Error('Étudiant introuvable');
        return result.rows[0];
    }

    public async updatePassword(id: string, newPassword: string): Promise<void> {
        const hashed = await bcrypt.hash(newPassword, 10);
        await pool.query('UPDATE users SET password = $2 WHERE id = $1', [id, hashed]);
    }

    public async findAllStudents(): Promise<User[]> {
        const result = await pool.query(
            `SELECT ${USER_FIELDS} FROM users WHERE role = 'STUDENT' ORDER BY user_number`
        );
        return result.rows;
    }

    public async findStudentById(id: string): Promise<User | null> {
        const result = await pool.query(
            `SELECT ${USER_FIELDS} FROM users WHERE id = $1 AND role = 'STUDENT'`,
            [id]
        );
        return result.rows[0] ?? null;
    }

    public async findByEmail(email: string): Promise<User | null> {
        const result = await pool.query(
            `SELECT ${USER_FIELDS} FROM users WHERE email = $1`,
            [email]
        );
        return result.rows[0] ?? null;
    }

    public async findById(id: string): Promise<User | null> {
        const result = await pool.query(
            `SELECT ${USER_FIELDS} FROM users WHERE id = $1`,
            [id]
        );
        return result.rows[0] ?? null;
    }

    public async countStudents(): Promise<number> {
        const result = await pool.query(
            `SELECT COUNT(*) FROM users WHERE role = 'STUDENT' AND status = 'ACTIVE'`
        );
        return parseInt(result.rows[0].count, 10);
    }
}
