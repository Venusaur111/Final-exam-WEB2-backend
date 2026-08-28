// AuthController.ts
import { Request, Response } from "express";
import { AuthService } from "../../services/auth/authService.js";

export class AuthController {
    private authService: AuthService;

    constructor() {
        this.authService = new AuthService();
    }

    /**
     * POST /api/auth/login
     * User authentication and JWT generation
     */
    public login = async (req: Request, res: Response): Promise<void> => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                res.status(400).json({
                    success: false,
                    message: "Please provide an email and a password."
                });
                return;
            }

            const result = await this.authService.login({ email, password });
            res.status(200).json({ success: true, data: result });
        } catch (error: any) {
            if (error.message === "Invalid credentials.") {
                res.status(401).json({ success: false, message: error.message });
                return;
            }
            if (error.message === "This account has been deactivated.") {
                res.status(403).json({ success: false, message: error.message });
                return;
            }
            res.status(500).json({ success: false, message: error.message });
        }
    };
}