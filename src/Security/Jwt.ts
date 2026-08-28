import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export interface AuthTokenPayload extends JwtPayload {
    id: string;
    email: string;
    role: "admin" | "student";
}

function getSecret(): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET n'est pas configuré");
    }
    return secret;
}

export function signToken(payload: { id: string; email: string; role: "admin" | "student" }): string {
    return jwt.sign(payload, getSecret(), { expiresIn: "24h" });
}

export function verifyToken(token: string): AuthTokenPayload {
    return jwt.verify(token, getSecret()) as AuthTokenPayload;
}
