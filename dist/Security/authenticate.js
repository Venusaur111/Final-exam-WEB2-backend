import jwt from "jsonwebtoken";
// Clé secrète JWT (à placer idéalement dans vos variables d'environnement .env)
const JWT_SECRET = process.env.JWT_SECRET || "votre_cle_secrete_super_securisee";
export const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({
                success: false,
                message: "Accès non autorisé. Token manquant ou format invalide."
            });
            return;
        }
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        // Attache les infos de l'utilisateur (id, role, etc.) à la requête
        req.user = decoded;
        next();
    }
    catch (error) {
        res.status(401).json({
            success: false,
            message: "Token invalide ou expiré."
        });
    }
};
