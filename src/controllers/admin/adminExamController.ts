import { Router, Request, Response } from 'express';
import { AdminExamService } from '../../services/admin/adminExamService.js';
import { AdminQuestionService } from '../../services/admin/adminQuestionService.js';

export class AdminExamController {
    private adminExamService: AdminExamService;
    private adminQuestionService: AdminQuestionService;

    constructor(adminExamService: AdminExamService, adminQuestionService: AdminQuestionService) {
        this.adminExamService = adminExamService;
        this.adminQuestionService = adminQuestionService;
    }

    public getRouter(): Router {
        const router = Router();

        router.get('/', async (req: Request, res: Response) => {
            try {
                const exams = await this.adminExamService.listExams();
                res.json(exams);
            } catch (error) {
                res.status(500).json({ error: 'Internal server error' });
            }
        });

        router.post('/', async (req: Request, res: Response) => {
            try {
                const exam = await this.adminExamService.createExam(req.body);
                res.status(201).json(exam);
            } catch (error) {
                res.status(400).json({ error: 'Invalid input data' });
            }
        });

        router.put('/:id', async (req: Request, res: Response) => {
            try {
                const exam = await this.adminExamService.updateExam(req.params.id, req.body);
                res.json(exam);
            } catch (error) {
                res.status(400).json({ error: 'Update failed' });
            }
        });

        router.delete('/:id', async (req: Request, res: Response) => {
            try {
                await this.adminExamService.deleteExam(req.params.id);
                res.status(204).send();
            } catch (error) {
                res.status(400).json({ error: 'Deletion failed' });
            }
        });

        router.get('/:id/questions', async (req: Request, res: Response) => {
            try {
                const questions = await this.adminQuestionService.getQuestions(req.params.id);
                res.json(questions);
            } catch (error) {
                res.status(500).json({ error: 'Internal server error' });
            }
        });

        router.post('/:id/questions', async (req: Request, res: Response) => {
            try {
                const question = await this.adminQuestionService.addQuestion(req.params.id, req.body);
                res.status(201).json(question);
            } catch (error) {
                res.status(400).json({ error: 'Invalid input data' });
            }
        });

        router.get('/:id/results', async (req: Request, res: Response) => {
            try {
                const results = await this.adminExamService.getExamResults(req.params.id);
                res.json(results);
            } catch (error) {
                res.status(500).json({ error: 'Internal server error' });
            }
        });

        return router;
    }
}