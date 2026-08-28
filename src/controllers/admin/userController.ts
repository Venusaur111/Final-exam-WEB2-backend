// userController.ts
import { Request, Response } from "express";
import { UserService } from "../../services/admin/userService.js";

export class UserController {
    private userService: UserService;

    constructor(userService?: UserService) {
        this.userService = userService ?? new UserService();
    }

    /**
     * GET /api/students
     * Retrieves the list of all students
     */
    public getAllStudents = async (_req: Request, res: Response): Promise<void> => {
        try {
            const students = await this.userService.getAllStudents();
            res.status(200).json({ success: true, data: students });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    };

    /**
     * POST /api/students
     * Creates a new student
     */
    public createStudent = async (req: Request, res: Response): Promise<void> => {
        try {
            const student = await this.userService.createStudent(req.body);
            res.status(201).json({ success: true, data: student });
        } catch (error: any) {
            if (error.message === "User already exists.") {
                res.status(409).json({ success: false, message: error.message });
                return;
            }
            res.status(400).json({ success: false, message: error.message });
        }
    };

    /**
     * PUT /api/students/:id
     * Updates student information
     */
    public updateStudent = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const updatedStudent = await this.userService.updateStudent(id, req.body);
            res.status(200).json({ success: true, data: updatedStudent });
        } catch (error: any) {
            if (error.message === "Student not found.") {
                res.status(404).json({ success: false, message: error.message });
                return;
            }
            if (error.message === "This email is already used by another account.") {
                res.status(409).json({ success: false, message: error.message });
                return;
            }
            res.status(400).json({ success: false, message: error.message });
        }
    };

    /**
     * PATCH /api/students/:id/password
     * Updates a student's password
     */
    public updatePassword = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const { newPassword } = req.body;

            if (!newPassword) {
                res.status(400).json({ success: false, message: "New password is required." });
                return;
            }

            await this.userService.updatePassword(id, newPassword);
            res.status(200).json({ success: true, message: "Password updated successfully." });
        } catch (error: any) {
            if (error.message === "Student not found.") {
                res.status(404).json({ success: false, message: error.message });
                return;
            }
            res.status(500).json({ success: false, message: error.message });
        }
    };

    /**
     * DELETE /api/students/:id
     * Logical deactivation of a student (RG-10)
     */
    public deactivateStudent = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            await this.userService.deactivateStudent(id);
            res.status(200).json({ success: true, message: "Student account deactivated successfully." });
        } catch (error: any) {
            if (error.message === "Student not found.") {
                res.status(404).json({ success: false, message: error.message });
                return;
            }
            res.status(500).json({ success: false, message: error.message });
        }
    };
}