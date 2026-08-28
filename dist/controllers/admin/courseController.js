import { CourseService } from "../../services/admin/courseService.js";
export class CourseController {
    courseService;
    constructor() {
        this.courseService = new CourseService();
    }
    /**
     * GET /api/courses
     * Récupère la liste de tous les cours
     */
    getAllCourses = async (req, res) => {
        try {
            const courses = await this.courseService.getAllCourses();
            res.status(200).json({ success: true, data: courses });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    };
    /**
     * GET /api/courses/:id
     * Récupère un cours par son ID
     */
    getCourseById = async (req, res) => {
        try {
            const { id } = req.params;
            const course = await this.courseService.getCourseById(id);
            res.status(200).json({ success: true, data: course });
        }
        catch (error) {
            if (error.message === "Cours non trouvé.") {
                res.status(404).json({ success: false, message: error.message });
                return;
            }
            res.status(500).json({ success: false, message: error.message });
        }
    };
    /**
     * POST /api/courses
     * Crée un nouveau cours
     */
    createCourse = async (req, res) => {
        try {
            const course = await this.courseService.createCourse(req.body);
            res.status(201).json({ success: true, data: course });
        }
        catch (error) {
            if (error.message === "Un cours avec ce code existe déjà.") {
                res.status(409).json({ success: false, message: error.message });
                return;
            }
            res.status(400).json({ success: false, message: error.message });
        }
    };
    /**
     * PUT /api/courses/:id
     * Met à jour un cours existant
     */
    updateCourse = async (req, res) => {
        try {
            const { id } = req.params;
            const updatedCourse = await this.courseService.updateCourse(id, req.body);
            res.status(200).json({ success: true, data: updatedCourse });
        }
        catch (error) {
            if (error.message === "Cours non trouvé.") {
                res.status(404).json({ success: false, message: error.message });
                return;
            }
            if (error.message === "Ce code de cours est déjà utilisé.") {
                res.status(409).json({ success: false, message: error.message });
                return;
            }
            res.status(400).json({ success: false, message: error.message });
        }
    };
    /**
     * DELETE /api/courses/:id
     * Supprime un cours (Bloqué si des examens y sont rattachés - RG-09)
     */
    deleteCourse = async (req, res) => {
        try {
            const { id } = req.params;
            await this.courseService.deleteCourse(id);
            res.status(200).json({ success: true, message: "Cours supprimé avec succès." });
        }
        catch (error) {
            if (error.message === "Cours non trouvé.") {
                res.status(404).json({ success: false, message: error.message });
                return;
            }
            if (error.message.includes("RG-09")) {
                res.status(400).json({ success: false, message: error.message });
                return;
            }
            res.status(500).json({ success: false, message: error.message });
        }
    };
}
