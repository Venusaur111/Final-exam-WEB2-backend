// authMiddleware.ts[cite: 14]
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
    userId: number;
}

declare global {
    namespace Express {
        interface Request {
            userId?: number;
        }
    }
}

export function authMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    const authorization = req.headers.authorization;
    if (!authorization) {
        res.status(401).json({
            message: "Missing token"
    });
        return;
    }

    const parts = authorization.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
        res.status(401).json({
            message: "Invalid token format"
    });
        return;
    }

    const token = parts[1];

    const secret = process.env.JWT_SECRET;

    if (!secret) {
        res.status(500).json({
            message: "JWT_SECRET not configured"
    });
        return;
    }

    try {
        const payload = jwt.verify(token, secret) as JwtPayload;

        req.userId = payload.userId;

        next();
    } catch (error) {
        res.status(401).json({
            message: "Invalid or expired token"
    });
    }
}