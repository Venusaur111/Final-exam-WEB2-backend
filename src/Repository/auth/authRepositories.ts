import { pool } from "../../config/database.js";
import { User } from "../../models/userModel.js";
export class AuthRepository {
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
}   