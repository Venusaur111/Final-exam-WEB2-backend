export const requireRole = (role) => {
    return (req, res, next) => {
        const user = req.user;
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
