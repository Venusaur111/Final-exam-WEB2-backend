import { Request, Response } from "express";
import { QuestionService } from "../../services/admin/questionService.js";

export class QuestionController {
    private questionService: QuestionService;

    constructor() {
        this.questionService = new QuestionService();
    }

    /**
     * GET /api/exams/:id/questions
     */
    getQuestionsByExam = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
        try {
            const { id: examId } = req.params;
            const questions = await this.questionService.getQuestionsByExam(examId);
            res.status(200).json({ success: true, data: questions });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    };

    /**
     * POST /api/exams/:id/questions
     */
    createQuestion = async (req: Request <{id: string }>, res: Response): Promise<void> => {
        try {
            const { id: examId } = req.params;
            const newQuestion = await this.questionService.createQuestion(examId, req.body);
            res.status(201).json({ success: true, data: newQuestion });
        } catch (error: any) {
            if (error.message.includes("tentatives") || error.message.includes("passé")) {
                res.status(403).json({ success: false, message: error.message });
                return;
            }
            if (error.message.includes("requis") || error.message.includes("choix") || error.message.includes("points")) {
                res.status(400).json({ success: false, message: error.message });
                return;
            }
            res.status(500).json({ success: false, message: error.message });
        }
    };

    /**
     * PUT /api/questions/:id
     */
    updateQuestion = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
        try {
            const { id: questionId } = req.params;
            const updatedQuestion = await this.questionService.updateQuestion(questionId, req.body);
            res.status(200).json({ success: true, data: updatedQuestion });
        } catch (error: any) {
            if (error.message === "Question introuvable.") {
                res.status(404).json({ success: false, message: error.message });
                return;
            }
            if (error.message.includes("impossible") || error.message.includes("tentatives")) {
                res.status(403).json({ success: false, message: error.message });
                return;
            }
            if (error.message.includes("choix") || error.message.includes("points")) {
                res.status(400).json({ success: false, message: error.message });
                return;
            }
            res.status(500).json({ success: false, message: error.message });
        }
    };

    /**
     * DELETE /api/questions/:id
     */
    deleteQuestion = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
        try {
            const { id: questionId } = req.params;
            await this.questionService.deleteQuestion(questionId);
            res.status(200).json({ success: true, message: "Question supprimée avec succès." });
        } catch (error: any) {
            if (error.message === "Question introuvable.") {
                res.status(404).json({ success: false, message: error.message });
                return;
            }
            if (error.message.includes("impossible") || error.message.includes("tentatives")) {
                res.status(403).json({ success: false, message: error.message });
                return;
            }
            res.status(500).json({ success: false, message: error.message });
        }
    };
}