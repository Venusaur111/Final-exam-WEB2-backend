import { ExamService } from "../../services/admin/examService.js"; // Adapte le chemin si nécessaire
export class ExamController {
    examService;
    constructor() {
        this.examService = new ExamService();
    }
    /**
     * GET /api/admin/exams
     * Récupère la liste de tous les examens
     */
    getAllExams = async (req, res) => {
        try {
            const exams = await this.examService.getAllExams();
            res.status(200).json({ success: true, data: exams });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    };
    /**
     * GET /api/admin/exams/course/:courseId
     * Récupère les examens d'un cours spécifique
     */
    getExamsByCourse = async (req, res) => {
        try {
            const { courseId } = req.params; // courseId est maintenant garanti de type 'string'
            const exams = await this.examService.getExamsByCourse(courseId);
            res.status(200).json({ success: true, data: exams });
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
     * GET /api/admin/exams/:id
     * Récupère un examen par son ID
     */
    getExamById = async (req, res) => {
        try {
            const { id } = req.params;
            const exam = await this.examService.getExamById(id);
            res.status(200).json({ success: true, data: exam });
        }
        catch (error) {
            if (error.message === "Examen non trouvé.") {
                res.status(404).json({ success: false, message: error.message });
                return;
            }
            res.status(500).json({ success: false, message: error.message });
        }
    };
    /**
     * POST /api/admin/exams
     * Crée un nouvel examen
     */
    createExam = async (req, res) => {
        try {
            const exam = await this.examService.createExam(req.body);
            res.status(201).json({ success: true, data: exam });
        }
        catch (error) {
            if (error.message === "Le cours spécifié n'existe pas.") {
                res.status(404).json({ success: false, message: error.message });
                return;
            }
            if (error.message === "La date de début doit être antérieure à la date de fin.") {
                res.status(400).json({ success: false, message: error.message });
                return;
            }
            res.status(500).json({ success: false, message: error.message });
        }
    };
    /**
     * PUT /api/admin/exams/:id
     * Met à jour un examen existant
     */
    updateExam = async (req, res) => {
        try {
            const { id } = req.params;
            const updated = await this.examService.updateExam(id, req.body);
            res.status(200).json({ success: true, data: updated });
        }
        catch (error) {
            if (error.message === "Examen non trouvé.") {
                res.status(404).json({ success: false, message: error.message });
                return;
            }
            if (error.message === "La date de début doit être antérieure à la date de fin.") {
                res.status(400).json({ success: false, message: error.message });
                return;
            }
            res.status(500).json({ success: false, message: error.message });
        }
    };
    /**
     * DELETE /api/admin/exams/:id
     * Supprime un examen (vérification RG-09 appliquée via le service)
     */
    deleteExam = async (req, res) => {
        try {
            const { id } = req.params;
            await this.examService.deleteExam(id);
            res.status(200).json({ success: true, message: "Examen supprimé avec succès." });
        }
        catch (error) {
            if (error.message === "Examen non trouvé.") {
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
    /**
     * GET /api/admin/exams/:id/results
     * Récupère le résumé des résultats d'un examen
     */
    getExamResults = async (req, res) => {
        try {
            const { id } = req.params;
            const results = await this.examService.getExamResults(id);
            res.status(200).json({ success: true, data: results });
        }
        catch (error) {
            if (error.message === "Examen non trouvé.") {
                res.status(404).json({ success: false, message: error.message });
                return;
            }
            res.status(500).json({ success: false, message: error.message });
        }
    };
}
