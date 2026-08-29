import { Request, Response, NextFunction } from "express";

export const requireRole = (role: "admin" | "student") => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const user = (req as any).user;

        if (!user) {
            res.status(401).json({ message: "Utilisateur non authentifié." });
            return;
        }

        if (user.role !== role) {
            res.status(403).json({ message: "Accès refusé." });
            return;
        }

        next();
    };
};
