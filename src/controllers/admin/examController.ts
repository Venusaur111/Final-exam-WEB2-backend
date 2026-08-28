import { Request, Response } from "express";
import { ExamService } from "../../services/admin/examService.js"; // Adapte le chemin si nécessaire

export class ExamController {
    private examService: ExamService;

    constructor() {
        this.examService = new ExamService();
    }

    /**
     * GET /api/admin/exams
     * Récupère la liste de tous les examens
     */
    getAllExams = async (req: Request, res: Response): Promise<void> => {
        try {
            const exams = await this.examService.getAllExams();
            res.status(200).json({ success: true, data: exams });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    };

    /**
     * GET /api/admin/exams/course/:courseId
     * Récupère les examens d'un cours spécifique
     */
    getExamsByCourse = async (req: Request<{ courseId: string }>, res: Response): Promise<void> => {
        try {
            const { courseId } = req.params; // courseId est maintenant garanti de type 'string'
            const exams = await this.examService.getExamsByCourse(courseId);
            res.status(200).json({ success: true, data: exams });
        } catch (error: any) {
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
    getExamById = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const exam = await this.examService.getExamById(id);
            res.status(200).json({ success: true, data: exam });
        } catch (error: any) {
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
    createExam = async (req: Request, res: Response): Promise<void> => {
        try {
            const exam = await this.examService.createExam(req.body);
            res.status(201).json({ success: true, data: exam });
        } catch (error: any) {
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
    updateExam = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const updated = await this.examService.updateExam(id, req.body);
            res.status(200).json({ success: true, data: updated });
        } catch (error: any) {
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
    deleteExam = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            await this.examService.deleteExam(id);
            res.status(200).json({ success: true, message: "Examen supprimé avec succès." });
        } catch (error: any) {
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
    getExamResults = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const results = await this.examService.getExamResults(id);
            res.status(200).json({ success: true, data: results });
        } catch (error: any) {
            if (error.message === "Examen non trouvé.") {
                res.status(404).json({ success: false, message: error.message });
                return;
            }
            res.status(500).json({ success: false, message: error.message });
        }
    };
}