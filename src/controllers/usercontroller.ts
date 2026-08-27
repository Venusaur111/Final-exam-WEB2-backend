import { Request,Response } from "express";
import { AdminUserService } from "../services/userserv.js";
export class UserController {

    private userService: AdminUserService;

    constructor(userService: AdminUserService) {
        this.userService = userService;
    }
    // ... constructeur et autres méthodes ...
    public async getStudentById(req: Request, res: Response): Promise<void> {
        const id = req.query.id as string;

        if (!id || typeof id !== 'string') {
            res.status(400).json({ message: "Identifiant invalide ou absent" });
            return;
        }

        const student = await this.userService.getStudentById(id);

        if (!student) {
            res.status(404).json({ message: "Étudiant introuvable" });
            return;
        }

        res.json(student);
    }
}