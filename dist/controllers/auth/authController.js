import { AuthService } from "../../services/auth/authService.js";
export class AuthController {
    authService;
    constructor() {
        this.authService = new AuthService();
    }
    login = async (req, res) => {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                res.status(400).json({ message: "Veuillez fournir un email et un mot de passe." });
                return;
            }
            const result = await this.authService.login({ email, password });
            res.status(200).json(result);
        }
        catch (error) {
            const status = error.status || 500;
            res.status(status).json({ message: error.message });
        }
    };
}
