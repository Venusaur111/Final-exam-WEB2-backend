import bcrypt from "bcrypt";
import { AuthRepository } from "../../Repository/auth/authRepositories.js";
import { PublicUser, User } from "../../models/userModel.js";
import { signToken } from "../../Security/Jwt.js";

interface LoginCredentials {
    email: string;
    password: string;
}

interface AuthPayload {
    token: string;
    user: PublicUser;
}

function toPublicUser(user: User): PublicUser {
    const { passwordHash: _passwordHash, ...rest } = user;
    return rest;
}

export class AuthService {
    private authRepo: AuthRepository;

    constructor() {
        this.authRepo = new AuthRepository();
    }

    async login(credentials: LoginCredentials): Promise<AuthPayload> {
        const { email, password } = credentials;

        const user = await this.authRepo.findByEmail(email);
        if (!user) {
            const error = new Error("Identifiants invalides.");
            (error as any).status = 401;
            throw error;
        }

        // RG-11 : refus distinct d'un mauvais mot de passe
        if (!user.isActive) {
            const error = new Error("Ce compte a été désactivé.");
            (error as any).status = 403;
            throw error;
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            const error = new Error("Identifiants invalides.");
            (error as any).status = 401;
            throw error;
        }

        const token = signToken({ id: user.id, email: user.email, role: user.role });

        return {
            token,
            user: toPublicUser(user),
        };
    }
}
