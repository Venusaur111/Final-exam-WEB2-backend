import { UserService } from "../../services/admin/userService.js";
export class UserController {
    userService;
    constructor(userService) {
        this.userService = userService ?? new UserService();
    }
    /**
     * GET /api/students
     * Récupère la liste de tous les étudiants
     */
    getAllStudents = async (req, res) => {
        try {
            const students = await this.userService.getAllStudents();
            res.status(200).json({ success: true, data: students });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    };
    /**
     * GET /api/students/:id
     * Récupère un étudiant par son ID
     */
    getStudentById = async (req, res) => {
        try {
            const { id } = req.params;
            const student = await this.userService.getStudentById(id);
            res.status(200).json({ success: true, data: student });
        }
        catch (error) {
            if (error.message === "Étudiant non trouvé.") {
                res.status(404).json({ success: false, message: error.message });
                return;
            }
            res.status(500).json({ success: false, message: error.message });
        }
    };
    /**
     * POST /api/students
     * Crée un nouvel étudiant
     */
    createStudent = async (req, res) => {
        try {
            const student = await this.userService.createStudent(req.body);
            res.status(201).json({ success: true, data: student });
        }
        catch (error) {
            if (error.message === "Un utilisateur avec cet email existe déjà.") {
                res.status(409).json({ success: false, message: error.message });
                return;
            }
            res.status(400).json({ success: false, message: error.message });
        }
    };
    /**
     * PUT /api/students/:id
     * Met à jour les informations d'un étudiant
     */
    updateStudent = async (req, res) => {
        try {
            const { id } = req.params;
            const updatedStudent = await this.userService.updateStudent(id, req.body);
            res.status(200).json({ success: true, data: updatedStudent });
        }
        catch (error) {
            if (error.message === "Étudiant non trouvé.") {
                res.status(404).json({ success: false, message: error.message });
                return;
            }
            if (error.message === "Cet email est déjà utilisé par un autre compte.") {
                res.status(409).json({ success: false, message: error.message });
                return;
            }
            res.status(400).json({ success: false, message: error.message });
        }
    };
    /**
     * PATCH /api/students/:id/password
     * Met à jour le mot de passe d'un étudiant
     */
    updatePassword = async (req, res) => {
        try {
            const { id } = req.params;
            const { newPassword } = req.body;
            if (!newPassword) {
                res.status(400).json({ success: false, message: "Le nouveau mot de passe est requis." });
                return;
            }
            await this.userService.updatePassword(id, newPassword);
            res.status(200).json({ success: true, message: "Mot de passe mis à jour avec succès." });
        }
        catch (error) {
            if (error.message === "Étudiant non trouvé.") {
                res.status(404).json({ success: false, message: error.message });
                return;
            }
            res.status(500).json({ success: false, message: error.message });
        }
    };
    /**
     * DELETE /api/students/:id
     * Désactivation logique d'un étudiant (RG-10)
     */
    deactivateStudent = async (req, res) => {
        try {
            const { id } = req.params;
            await this.userService.deactivateStudent(id);
            res.status(200).json({ success: true, message: "Compte étudiant désactivé avec succès." });
        }
        catch (error) {
            if (error.message === "Étudiant non trouvé.") {
                res.status(404).json({ success: false, message: error.message });
                return;
            }
            res.status(500).json({ success: false, message: error.message });
        }
    };
}
