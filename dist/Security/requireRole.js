export const requireRole = (role) => {
    return (req, res, next) => {
        const user = req.user;
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
