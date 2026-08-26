import { Router } from 'express';
export class StudentPortalController {
    studentExamService;
    studentAttemptService;
    constructor(studentExamService, studentAttemptService) {
        this.studentExamService = studentExamService;
        this.studentAttemptService = studentAttemptService;
    }
    getRouter() {
        const router = Router();
        router.get('/exams', async (req, res) => {
            try {
                const exams = await this.studentExamService.findAvailableExams();
                res.json(exams);
            }
            catch (error) {
                res.status(500).json({ error: 'Internal server error' });
            }
        });
        router.get('/exams/:id', async (req, res) => {
            try {
                const exam = await this.studentExamService.getExamById(String(req.params.id));
                if (!exam) {
                    res.status(404).json({ error: 'Exam not found' });
                    return;
                }
                res.json(exam);
            }
            catch (error) {
                res.status(500).json({ error: 'Internal server error' });
            }
        });
        router.post('/exams/:id/submit', async (req, res) => {
            try {
                const userId = req.user.id;
                const attempt = await this.studentAttemptService.submitExam(userId, String(req.params.id), req.body.answers);
                res.status(201).json(attempt);
            }
            catch (error) {
                res.status(400).json({ error: 'Submission failed' });
            }
        });
        router.get('/results', async (req, res) => {
            try {
                const userId = req.user.id;
                const results = await this.studentAttemptService.getMyResults(userId);
                res.json(results);
            }
            catch (error) {
                res.status(500).json({ error: 'Internal server error' });
            }
        });
        return router;
    }
}
