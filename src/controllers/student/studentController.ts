// StudentExamController.ts
import { Request, Response } from "express";
import { StudentExamService } from "../../services/student/studentExamService.js";

export class StudentExamController {
    private studentExamService: StudentExamService;

    constructor() {
        this.studentExamService = new StudentExamService();
    }

    /**
     * GET /api/my/exams
     * Retrieves accessible exams (open window & unattempted)[cite: 24]
     */
    public getAvailableExams = async (_req: Request, res: Response): Promise<void> => {
        try {
            const studentId = (_req as any).user?.id;
            const exams = await this.studentExamService.getAvailableExams(studentId);
            res.status(200).json({ success: true, data: exams });
        } catch (error: any) {
            if (error.message.includes("required")) {
                res.status(401).json({ success: false, message: error.message });
                return;
            }
            res.status(500).json({ success: false, message: error.message });
        }
    };

    /**
     * GET /api/my/exams/:id
     * Alias used in server.ts to retrieve the exam/questions (RG-07)[cite: 24]
     */
    public getExamToTake = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
        try {
            const { id: examId } = req.params;
            const studentId = (req as any).user?.id;
            const questions = await this.studentExamService.getExamQuestions(examId, studentId);
            res.status(200).json({ success: true, data: questions });
        } catch (error: any) {
            if (error.message === "Exam not found.") {
                res.status(404).json({ success: false, message: error.message });
                return;
            }
            if (
                error.message.includes("accessible") ||
                error.message.includes("already submitted")
            ) {
                res.status(403).json({ success: false, message: error.message });
                return;
            }
            res.status(500).json({ success: false, message: error.message });
        }
    };

    /**
     * POST /api/my/exams/:id/submit
     * Submits the attempt and performs server-side grade calculation[cite: 24]
     */
    public submitExam = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
        try {
            const { id: examId } = req.params;
            const studentId = (req as any).user?.id;
            const { answers } = req.body;

            const correction = await this.studentExamService.submitExam(
                examId,
                studentId,
                answers ?? req.body
            );

            res.status(201).json({ success: true, data: correction });
        } catch (error: any) {
            if (error.message === "Exam not found.") {
                res.status(404).json({ success: false, message: error.message });
                return;
            }
            if (
                error.message.includes("expired") ||
                error.message.includes("already taken")
            ) {
                res.status(400).json({ success: false, message: error.message });
                return;
            }
            res.status(500).json({ success: false, message: error.message });
        }
    };

    /**
     * GET /api/my/results/:attemptId/correction
     * Retrieves the detailed correction for an attempt[cite: 24]
     */
    public getCorrectionForAttempt = async (req: Request<{ attemptId: string }>, res: Response): Promise<void> => {
        try {
            const { attemptId } = req.params;
            const studentId = (req as any).user?.id;

            const correction = await this.studentExamService.getCorrectionForAttempt(
                attemptId,
                studentId
            );
            res.status(200).json({ success: true, data: correction });
        } catch (error: any) {
            if (error.message.includes("missing")) {
                res.status(400).json({ success: false, message: error.message });
                return;
            }
            if (error.message.includes("not found")) {
                res.status(404).json({ success: false, message: error.message });
                return;
            }
            res.status(500).json({ success: false, message: error.message });
        }
    };
}