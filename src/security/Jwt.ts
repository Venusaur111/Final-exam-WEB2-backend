import jwt from "jsonwebtoken";

export function generateToken(userId: number): string {

    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error("JWT_SECRET n'est pas configuré");
    }

    return jwt.sign(
        {
            userId: userId
        },
        secret,
        {
            expiresIn: "1h"
        }
    );
}