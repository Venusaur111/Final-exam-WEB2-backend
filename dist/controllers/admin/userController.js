import { UserService } from "../../services/admin/userService.js";
export class UserController {
    userService;
    constructor(userService) {
        this.userService = userService ?? new UserService();
    }
    getAllStudents = async (_req, res) => {
        try {
            const students = await this.userService.getAllStudents();
            res.status(200).json(students);
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    };
    createStudent = async (req, res) => {
        try {
            const student = await this.userService.createStudent(req.body);
            res.status(201).json(student);
        }
        catch (error) {
            if (error.status === 409) {
                res.status(409).json({ message: error.message });
                return;
            }
            res.status(400).json({ message: error.message });
        }
    };
    updateStudent = async (req, res) => {
        try {
            const { id } = req.params;
            const updatedStudent = await this.userService.updateStudent(id, req.body);
            res.status(200).json(updatedStudent);
        }
        catch (error) {
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
    deactivateStudent = async (req, res) => {
        try {
            const { id } = req.params;
            await this.userService.deactivateStudent(id);
            res.status(200).json({ message: "Compte étudiant désactivé avec succès." });
        }
        catch (error) {
            if (error.message === "Étudiant non trouvé.") {
                res.status(404).json({ message: error.message });
                return;
            }
            res.status(500).json({ message: error.message });
        }
    };
}
