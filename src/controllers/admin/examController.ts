import { Request, Response } from "express";
import { ExamService } from "../../services/admin/examService.js";

export class ExamController {
    private examService: ExamService;

    constructor() {
        this.examService = new ExamService();
    }

    getAllExams = async (_req: Request, res: Response): Promise<void> => {
        try {
            const exams = await this.examService.getAllExams();
            res.status(200).json(exams);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    };

    getExamById = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const exam = await this.examService.getExamById(id);
            res.status(200).json(exam);
        } catch (error: any) {
            if (error.message === "Examen non trouvé.") {
                res.status(404).json({ message: error.message });
                return;
            }
            res.status(500).json({ message: error.message });
        }
    };

    createExam = async (req: Request, res: Response): Promise<void> => {
        try {
            const exam = await this.examService.createExam(req.body);
            res.status(201).json(exam);
        } catch (error: any) {
            if (error.message === "Le cours spécifié n'existe pas.") {
                res.status(404).json({ message: error.message });
                return;
            }
            res.status(400).json({ message: error.message });
        }
    };

    updateExam = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const updated = await this.examService.updateExam(id, req.body);
            res.status(200).json(updated);
        } catch (error: any) {
            if (error.message === "Examen non trouvé.") {
                res.status(404).json({ message: error.message });
                return;
            }
            res.status(400).json({ message: error.message });
        }
    };

    deleteExam = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            await this.examService.deleteExam(id);
            res.status(200).json({ message: "Examen supprimé avec succès." });
        } catch (error: any) {
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

    getExamResults = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const results = await this.examService.getExamResults(id);
            res.status(200).json(results);
        } catch (error: any) {
            if (error.message === "Examen non trouvé.") {
                res.status(404).json({ message: error.message });
                return;
            }
            res.status(500).json({ message: error.message });
        }
    };
}
