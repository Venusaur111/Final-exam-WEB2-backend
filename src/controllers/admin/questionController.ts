import { Request, Response } from "express";
import { QuestionService } from "../../services/admin/questionService.js";

export class QuestionController {
    private questionService: QuestionService;

    constructor() {
        this.questionService = new QuestionService();
    }

    getQuestionsByExam = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
        try {
            const { id: examId } = req.params;
            const questions = await this.questionService.getQuestionsByExam(examId);
            res.status(200).json(questions);
        } catch (error: any) {
            if (error.message === "Examen non trouvé.") {
                res.status(404).json({ message: error.message });
                return;
            }
            res.status(500).json({ message: error.message });
        }
    };

    createQuestion = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
        try {
            const { id: examId } = req.params;
            const newQuestion = await this.questionService.createQuestion(examId, req.body);
            res.status(201).json(newQuestion);
        } catch (error: any) {
            if (error.message.includes("tentatives")) {
                res.status(409).json({ message: error.message });
                return;
            }
            if (error.message === "Examen non trouvé.") {
                res.status(404).json({ message: error.message });
                return;
            }
            res.status(400).json({ message: error.message });
        }
    };

    updateQuestion = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
        try {
            const { id: questionId } = req.params;
            const updatedQuestion = await this.questionService.updateQuestion(questionId, req.body);
            res.status(200).json(updatedQuestion);
        } catch (error: any) {
            if (error.message === "Question introuvable.") {
                res.status(404).json({ message: error.message });
                return;
            }
            if (error.message.includes("impossible") || error.message.includes("tentatives")) {
                res.status(409).json({ message: error.message });
                return;
            }
            res.status(400).json({ message: error.message });
        }
    };

    deleteQuestion = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
        try {
            const { id: questionId } = req.params;
            await this.questionService.deleteQuestion(questionId);
            res.status(200).json({ message: "Question supprimée avec succès." });
        } catch (error: any) {
            if (error.message === "Question introuvable.") {
                res.status(404).json({ message: error.message });
                return;
            }
            if (error.message.includes("impossible") || error.message.includes("tentatives")) {
                res.status(409).json({ message: error.message });
                return;
            }
            res.status(500).json({ message: error.message });
        }
    };
}
