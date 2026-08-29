import { verifyToken } from "./Jwt.js";
export const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({
                message: "Accès non autorisé. Token manquant ou format invalide.",
            });
            return;
        }
        const token = authHeader.split(" ")[1];
        req.user = verifyToken(token);
        next();
    }
    catch {
        res.status(401).json({ message: "Token invalide ou expiré." });
    }
};
