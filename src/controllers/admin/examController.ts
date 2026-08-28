// ExamController.ts
import { Request, Response } from "express";
import { ExamService } from "../../services/admin/examService.js";

export class ExamController {
    private examService: ExamService;

    constructor() {
        this.examService = new ExamService();
    }

    /**
     * GET /api/admin/exams
     * Retrieves the list of all exams
     */
    getAllExams = async (_req: Request, res: Response): Promise<void> => {
        try {
            const exams = await this.examService.getAllExams();
            res.status(200).json({ success: true, data: exams });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    };

    /**
     * GET /api/admin/exams/course/:courseId
     * Retrieves exams for a specific course
     */
    getExamsByCourse = async (req: Request<{ courseId: string }>, res: Response): Promise<void> => {
        try {
            const { courseId } = req.params;
            const exams = await this.examService.getExamsByCourse(courseId);
            res.status(200).json({ success: true, data: exams });
        } catch (error: any) {
            if (error.message === "Course not found.") {
                res.status(404).json({ success: false, message: error.message });
                return;
            }
            res.status(500).json({ success: false, message: error.message });
        }
    };

    /**
     * GET /api/admin/exams/:id
     * Retrieves an exam by its ID
     */
    getExamById = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const exam = await this.examService.getExamById(id);
            res.status(200).json({ success: true, data: exam });
        } catch (error: any) {
            if (error.message === "Exam not found.") {
                res.status(404).json({ success: false, message: error.message });
                return;
            }
            res.status(500).json({ success: false, message: error.message });
        }
    };

    /**
     * POST /api/admin/exams
     * Creates a new exam
     */
    createExam = async (req: Request, res: Response): Promise<void> => {
        try {
            const exam = await this.examService.createExam(req.body);
            res.status(201).json({ success: true, data: exam });
        } catch (error: any) {
            if (error.message === "The specified course does not exist.") {
                res.status(404).json({ success: false, message: error.message });
                return;
            }
            if (error.message === "The start date must be earlier than the end date.") {
                res.status(400).json({ success: false, message: error.message });
                return;
            }
            res.status(500).json({ success: false, message: error.message });
        }
    };

    /**
     * PUT /api/admin/exams/:id
     * Updates an existing exam
     */
    updateExam = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const updated = await this.examService.updateExam(id, req.body);
            res.status(200).json({ success: true, data: updated });
        } catch (error: any) {
            if (error.message === "Exam not found.") {
                res.status(404).json({ success: false, message: error.message });
                return;
            }
            if (error.message === "The start date must be earlier than the end date.") {
                res.status(400).json({ success: false, message: error.message });
                return;
            }
            res.status(500).json({ success: false, message: error.message });
        }
    };

    /**
     * DELETE /api/admin/exams/:id
     * Deletes an exam (RG-09 check applied via service)
     */
    deleteExam = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            await this.examService.deleteExam(id);
            res.status(200).json({ success: true, message: "Exam deleted successfully." });
        } catch (error: any) {
            if (error.message === "Exam not found.") {
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
     * Retrieves the results summary for an exam
     */
    getExamResults = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const results = await this.examService.getExamResults(id);
            res.status(200).json({ success: true, data: results });
        } catch (error: any) {
            if (error.message === "Exam not found.") {
                res.status(404).json({ success: false, message: error.message });
                return;
            }
            res.status(500).json({ success: false, message: error.message });
        }
    };
}