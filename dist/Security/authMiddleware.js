import jwt from "jsonwebtoken";
export function authMiddleware(req, res, next) {
    const authorization = req.headers.authorization;
    if (!authorization) {
        res.status(401).json({
            message: "Missing token"
        });
        return;
    }
    const parts = authorization.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
        res.status(401).json({
            message: "Invalid token format"
        });
        return;
    }
    const token = parts[1];
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        res.status(500).json({
            message: "JWT_SECRET not configured"
        });
        return;
    }
    try {
        const payload = jwt.verify(token, secret);
        req.userId = payload.userId;
        next();
    }
    catch (error) {
        res.status(401).json({
            message: "Invalid or expired token"
        });
    }
}
