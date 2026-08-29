import { ExamService } from "../../services/admin/examService.js";
export class ExamController {
    examService;
    constructor() {
        this.examService = new ExamService();
    }
    getAllExams = async (_req, res) => {
        try {
            const exams = await this.examService.getAllExams();
            res.status(200).json(exams);
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    };
    getExamById = async (req, res) => {
        try {
            const { id } = req.params;
            const exam = await this.examService.getExamById(id);
            res.status(200).json(exam);
        }
        catch (error) {
            if (error.message === "Examen non trouvé.") {
                res.status(404).json({ message: error.message });
                return;
            }
            res.status(500).json({ message: error.message });
        }
    };
    createExam = async (req, res) => {
        try {
            const exam = await this.examService.createExam(req.body);
            res.status(201).json(exam);
        }
        catch (error) {
            if (error.message === "Le cours spécifié n'existe pas.") {
                res.status(404).json({ message: error.message });
                return;
            }
            res.status(400).json({ message: error.message });
        }
    };
    updateExam = async (req, res) => {
        try {
            const { id } = req.params;
            const updated = await this.examService.updateExam(id, req.body);
            res.status(200).json(updated);
        }
        catch (error) {
            if (error.message === "Examen non trouvé.") {
                res.status(404).json({ message: error.message });
                return;
            }
            res.status(400).json({ message: error.message });
        }
    };
    deleteExam = async (req, res) => {
        try {
            const { id } = req.params;
            await this.examService.deleteExam(id);
            res.status(200).json({ message: "Examen supprimé avec succès." });
        }
        catch (error) {
            if (error.message === "Examen non trouvé.") {
                res.status(404).json({ message: error.message });
                return;
            }
            if (error.message.includes("RG-09")) {
                res.status(409).json({ message: error.message });
                return;
            }
            res.status(500).json({ message: error.message });
        }
    };
    getExamResults = async (req, res) => {
        try {
            const { id } = req.params;
            const results = await this.examService.getExamResults(id);
            res.status(200).json(results);
        }
        catch (error) {
            if (error.message === "Examen non trouvé.") {
                res.status(404).json({ message: error.message });
                return;
            }
            res.status(500).json({ message: error.message });
        }
    };
}
