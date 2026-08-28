import { UserService } from "../../services/admin/userService.js";
export class UserController {
    userService;
    constructor(userService) {
        this.userService = userService ?? new UserService();
    }
    /**
     * GET /api/students
     * Retrieves the list of all students
     */
    getAllStudents = async (_req, res) => {
        try {
            const students = await this.userService.getAllStudents();
            res.status(200).json({ success: true, data: students });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    };
    /**
     * POST /api/students
     * Creates a new student
     */
    createStudent = async (req, res) => {
        try {
            const student = await this.userService.createStudent(req.body);
            res.status(201).json({ success: true, data: student });
        }
        catch (error) {
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
    updateStudent = async (req, res) => {
        try {
            const { id } = req.params;
            const updatedStudent = await this.userService.updateStudent(id, req.body);
            res.status(200).json({ success: true, data: updatedStudent });
        }
        catch (error) {
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
    updatePassword = async (req, res) => {
        try {
            const { id } = req.params;
            const { newPassword } = req.body;
            if (!newPassword) {
                res.status(400).json({ success: false, message: "New password is required." });
                return;
            }
            await this.userService.updatePassword(id, newPassword);
            res.status(200).json({ success: true, message: "Password updated successfully." });
        }
        catch (error) {
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
    deactivateStudent = async (req, res) => {
        try {
            const { id } = req.params;
            await this.userService.deactivateStudent(id);
            res.status(200).json({ success: true, message: "Student account deactivated successfully." });
        }
        catch (error) {
            if (error.message === "Student not found.") {
                res.status(404).json({ success: false, message: error.message });
                return;
            }
            res.status(500).json({ success: false, message: error.message });
        }
    };
}
