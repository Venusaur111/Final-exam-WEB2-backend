import { AuthService } from "../../services/auth/authService.js"; // Adapte le chemin selon ton projet
export class AuthController {
    authService;
    constructor() {
        this.authService = new AuthService();
    }
    /**
     * POST /api/auth/login
     * Authentification utilisateur et génération du JWT
     */
    login = async (req, res) => {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                res.status(400).json({
                    success: false,
                    message: "Veuillez fournir un email et un mot de passe."
                });
                return;
            }
            const result = await this.authService.login({ email, password });
            res.status(200).json({ success: true, data: result });
        }
        catch (error) {
            if (error.message === "Identifiants invalides.") {
                res.status(401).json({ success: false, message: error.message });
                return;
            }
            if (error.message === "Ce compte a été désactivé.") {
                res.status(403).json({ success: false, message: error.message });
                return;
            }
            res.status(500).json({ success: false, message: error.message });
        }
    };
}
