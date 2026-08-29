import { Request, Response } from "express";
import { AuthService } from "../../services/auth/authService.js";

export class AuthController {
    private authService: AuthService;

    constructor() {
        this.authService = new AuthService();
    }

    login = async (req: Request, res: Response): Promise<void> => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                res.status(400).json({ message: "Veuillez fournir un email et un mot de passe." });
                return;
            }

            const result = await this.authService.login({ email, password });
            res.status(200).json(result);
        } catch (error: any) {
            const status = error.status || 500;
            res.status(status).json({ message: error.message });
        }
    };
}
