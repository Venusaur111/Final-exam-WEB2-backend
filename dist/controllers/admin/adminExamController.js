import { Router } from 'express';
export class AdminExamController {
    adminExamService;
    adminQuestionService;
    constructor(adminExamService, adminQuestionService) {
        this.adminExamService = adminExamService;
        this.adminQuestionService = adminQuestionService;
    }
    getRouter() {
        const router = Router();
        router.get('/', async (req, res) => {
            try {
                const exams = await this.adminExamService.listExams();
                res.json(exams);
            }
            catch (error) {
                res.status(500).json({ error: 'Internal server error' });
            }
        });
        router.post('/', async (req, res) => {
            try {
                const exam = await this.adminExamService.createExam(req.body);
                res.status(201).json(exam);
            }
            catch (error) {
                res.status(400).json({ error: 'Invalid input data' });
            }
        });
        router.put('/:id', async (req, res) => {
            try {
                const exam = await this.adminExamService.updateExam(String(req.params.id), req.body);
                res.json(exam);
            }
            catch (error) {
                res.status(400).json({ error: 'Update failed' });
            }
        });
        router.delete('/:id', async (req, res) => {
            try {
                await this.adminExamService.deleteExam(String(req.params.id));
                res.status(204).send();
            }
            catch (error) {
                res.status(400).json({ error: 'Deletion failed' });
            }
        });
        router.get('/:id/questions', async (req, res) => {
            try {
                const questions = await this.adminQuestionService.getQuestions(String(req.params.id));
                res.json(questions);
            }
            catch (error) {
                res.status(500).json({ error: 'Internal server error' });
            }
        });
        router.post('/:id/questions', async (req, res) => {
            try {
                const question = await this.adminQuestionService.addQuestion(String(req.params.id), req.body);
                res.status(201).json(question);
            }
            catch (error) {
                res.status(400).json({ error: 'Invalid input data' });
            }
        });
        router.get('/:id/results', async (req, res) => {
            try {
                const results = await this.adminExamService.getExamResults(String(req.params.id));
                res.json(results);
            }
            catch (error) {
                res.status(500).json({ error: 'Internal server error' });
            }
        });
        return router;
    }
}
