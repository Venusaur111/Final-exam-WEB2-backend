import { pool } from '../config/database.js';
import { User } from '../models/userModel.js';
import { CreateUserDto } from '../models/dto/createDtoTypes.js';
import bcrypt from 'bcrypt';
export class UserRepository {

  async findById(id: string): Promise<User | null> {

    const result = await pool.query(
        `SELECT *
         FROM users
         WHERE id = $1`,
        [id]
    );

    if (result.rows.length === 0) {
        return null;
    }

    return result.rows[0];
}
}