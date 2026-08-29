import { Request, Response, NextFunction } from "express";
import { verifyToken } from "./Jwt.js";

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({
                message: "Accès non autorisé. Token manquant ou format invalide.",
            });
            return;
        }

        const token = authHeader.split(" ")[1];
        (req as any).user = verifyToken(token);
        next();
    } catch {
        res.status(401).json({ message: "Token invalide ou expiré." });
    }
};
