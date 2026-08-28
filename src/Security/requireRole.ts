// requireRole.ts
import { Request, Response, NextFunction } from "express";

export const requireRole = (role: "admin" | "student") => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const user = (req as any).user;

        if (!user) {
            res.status(401).json({
                success: false,
                message: "Unauthenticated user."
            });
            return;
        }

        if (user.role !== role) {
            res.status(403).json({
                success: false,
                message: `Access denied. The role '${role}' is required for this action.`
            });
            return;
        }

        next();
    };
};