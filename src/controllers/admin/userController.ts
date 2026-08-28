import { Request, Response } from "express";
import { UserService } from "../../services/admin/userService.js";

export class UserController {
    private userService: UserService;

    constructor(userService?: UserService) {
        this.userService = userService ?? new UserService();
    }

    public getAllStudents = async (_req: Request, res: Response): Promise<void> => {
        try {
            const students = await this.userService.getAllStudents();
            res.status(200).json(students);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    };

    public createStudent = async (req: Request, res: Response): Promise<void> => {
        try {
            const student = await this.userService.createStudent(req.body);
            res.status(201).json(student);
        } catch (error: any) {
            if (error.status === 409) {
                res.status(409).json({ message: error.message });
                return;
            }
            res.status(400).json({ message: error.message });
        }
    };

    public updateStudent = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const updatedStudent = await this.userService.updateStudent(id, req.body);
            res.status(200).json(updatedStudent);
        } catch (error: any) {
            if (error.message === "Étudiant non trouvé.") {
                res.status(404).json({ message: error.message });
                return;
            }
            if (error.status === 409) {
                res.status(409).json({ message: error.message });
                return;
            }
            res.status(400).json({ message: error.message });
        }
    };

    public deactivateStudent = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            await this.userService.deactivateStudent(id);
            res.status(200).json({ message: "Compte étudiant désactivé avec succès." });
        } catch (error: any) {
            if (error.message === "Étudiant non trouvé.") {
                res.status(404).json({ message: error.message });
                return;
            }
            res.status(500).json({ message: error.message });
        }
    };
}
