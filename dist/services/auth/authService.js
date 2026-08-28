// authService.ts
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AuthRepository } from "../../Repository/auth/authRepositories.js";
export class AuthService {
    authRepo;
    JWT_SECRET = process.env.JWT_SECRET || "your_fallback_secret_key";
    JWT_EXPIRES_IN = "24h";
    constructor() {
        this.authRepo = new AuthRepository();
    }
    async login(credentials) {
        const { email, password } = credentials;
        // 1. Search for user by email
        const user = await this.authRepo.findByEmail(email);
        if (!user) {
            throw new Error("Invalid credentials.");
        }
        // 2. Check if the account is active
        if (!user.isActive) {
            throw new Error("This account has been deactivated.");
        }
        // 3. Verify password
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            throw new Error("Invalid credentials.");
        }
        // 4. Generate JWT Token
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, this.JWT_SECRET, { expiresIn: this.JWT_EXPIRES_IN });
        // 5. Exclude password hash from the return object
        const { passwordHash, ...userWithoutPassword } = user;
        return {
            token,
            user: userWithoutPassword,
        };
    }
}
