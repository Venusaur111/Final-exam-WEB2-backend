export const requireRole = (role) => {
    return (req, res, next) => {
        const user = req.user;
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
