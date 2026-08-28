import { QuestionService } from "../../services/admin/questionService.js";
export class QuestionController {
    questionService;
    constructor() {
        this.questionService = new QuestionService();
    }
    /**
     * GET /api/exams/:id/questions
     */
    getQuestionsByExam = async (req, res) => {
        try {
            const { id: examId } = req.params;
            const questions = await this.questionService.getQuestionsByExam(examId);
            res.status(200).json({ success: true, data: questions });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    };
    /**
     * POST /api/exams/:id/questions
     */
    createQuestion = async (req, res) => {
        try {
            const { id: examId } = req.params;
            const newQuestion = await this.questionService.createQuestion(examId, req.body);
            res.status(201).json({ success: true, data: newQuestion });
        }
        catch (error) {
            if (error.message.includes("attempts") || error.message.includes("passed")) {
                res.status(403).json({ success: false, message: error.message });
                return;
            }
            if (error.message.includes("required") || error.message.includes("choice") || error.message.includes("points")) {
                res.status(400).json({ success: false, message: error.message });
                return;
            }
            res.status(500).json({ success: false, message: error.message });
        }
    };
    /**
     * PUT /api/questions/:id
     */
    updateQuestion = async (req, res) => {
        try {
            const { id: questionId } = req.params;
            const updatedQuestion = await this.questionService.updateQuestion(questionId, req.body);
            res.status(200).json({ success: true, data: updatedQuestion });
        }
        catch (error) {
            if (error.message === "Question not found.") {
                res.status(404).json({ success: false, message: error.message });
                return;
            }
            if (error.message.includes("impossible") || error.message.includes("attempts")) {
                res.status(403).json({ success: false, message: error.message });
                return;
            }
            if (error.message.includes("choice") || error.message.includes("points")) {
                res.status(400).json({ success: false, message: error.message });
                return;
            }
            res.status(500).json({ success: false, message: error.message });
        }
    };
    /**
     * DELETE /api/questions/:id
     */
    deleteQuestion = async (req, res) => {
        try {
            const { id: questionId } = req.params;
            await this.questionService.deleteQuestion(questionId);
            res.status(200).json({ success: true, message: "Question deleted successfully." });
        }
        catch (error) {
            if (error.message === "Question not found.") {
                res.status(404).json({ success: false, message: error.message });
                return;
            }
            if (error.message.includes("impossible") || error.message.includes("attempts")) {
                res.status(403).json({ success: false, message: error.message });
                return;
            }
            res.status(500).json({ success: false, message: error.message });
        }
    };
}
