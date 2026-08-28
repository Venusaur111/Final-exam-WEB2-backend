import { StudentExamService } from "../../services/student/studentExamService.js";
export class StudentExamController {
    studentExamService;
    constructor() {
        this.studentExamService = new StudentExamService();
    }
    /**
     * GET /api/my/exams
     * Récupère les examens accessibles (fenêtre ouverte & non tentés)
     */
    getAvailableExams = async (req, res) => {
        try {
            const studentId = req.user?.id;
            const exams = await this.studentExamService.getAvailableExams(studentId);
            res.status(200).json({ success: true, data: exams });
        }
        catch (error) {
            if (error.message.includes("requis")) {
                res.status(401).json({ success: false, message: error.message });
                return;
            }
            res.status(500).json({ success: false, message: error.message });
        }
    };
    /**
     * GET /api/my/exams/:id
     * Alias utilisé dans server.ts pour récupérer l'examen/questions (RG-07)
     */
    getExamToTake = async (req, res) => {
        try {
            const { id: examId } = req.params;
            const studentId = req.user?.id;
            const questions = await this.studentExamService.getExamQuestions(examId, studentId);
            res.status(200).json({ success: true, data: questions });
        }
        catch (error) {
            if (error.message === "Examen introuvable.") {
                res.status(404).json({ success: false, message: error.message });
                return;
            }
            if (error.message.includes("accessible") ||
                error.message.includes("déjà soumis")) {
                res.status(403).json({ success: false, message: error.message });
                return;
            }
            res.status(500).json({ success: false, message: error.message });
        }
    };
    /**
     * POST /api/my/exams/:id/submit
     * Soumet la tentative et effectue le calcul de la note côté serveur
     */
    submitExam = async (req, res) => {
        try {
            const { id: examId } = req.params;
            const studentId = req.user?.id;
            const { answers } = req.body;
            const correction = await this.studentExamService.submitExam(examId, studentId, answers ?? req.body);
            res.status(201).json({ success: true, data: correction });
        }
        catch (error) {
            if (error.message === "Examen introuvable.") {
                res.status(404).json({ success: false, message: error.message });
                return;
            }
            if (error.message.includes("expirée") ||
                error.message.includes("déjà passé")) {
                res.status(400).json({ success: false, message: error.message });
                return;
            }
            res.status(500).json({ success: false, message: error.message });
        }
    };
    /**
     * GET /api/my/results/:attemptId/correction
     * Récupère la correction détaillée d'une tentative
     */
    getCorrectionForAttempt = async (req, res) => {
        try {
            const { attemptId } = req.params;
            const studentId = req.user?.id;
            const correction = await this.studentExamService.getCorrectionForAttempt(attemptId, studentId);
            res.status(200).json({ success: true, data: correction });
        }
        catch (error) {
            if (error.message.includes("manquants")) {
                res.status(400).json({ success: false, message: error.message });
                return;
            }
            if (error.message.includes("introuvable")) {
                res.status(404).json({ success: false, message: error.message });
                return;
            }
            res.status(500).json({ success: false, message: error.message });
        }
    };
}
