import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
function getSecret() {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET n'est pas configuré");
    }
    return secret;
}
export function signToken(payload) {
    return jwt.sign(payload, getSecret(), { expiresIn: "24h" });
}
export function verifyToken(token) {
    return jwt.verify(token, getSecret());
}
