import { Request, Response, NextFunction } from "express";

export const requireRole = (role: "admin" | "student") => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const user = (req as any).user;

        if (!user) {
            res.status(401).json({ 
                success: false, 
                message: "Utilisateur non authentifié." 
            });
            return;
        }

        if (user.role !== role) {
            res.status(403).json({ 
                success: false, 
                message: `Accès refusé. Le rôle '${role}' est requis pour cette action.` 
            });
            return;
        }

        next();
    };
};