// authenticate.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// JWT secret key (ideally placed in your .env environment variables)
const JWT_SECRET = process.env.JWT_SECRET || "your_super_secure_secret_key";

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({
                success: false,
                message: "Unauthorized access. Missing or invalid token format."
            });
            return;
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, JWT_SECRET);

        // Attaches user information (id, role, etc.) to the request
        (req as any).user = decoded;

        next();
    } catch (error: any) {
        res.status(401).json({
            success: false,
            message: "Invalid or expired token."
        });
    }
};