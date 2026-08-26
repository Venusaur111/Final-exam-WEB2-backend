import { Router, Request, Response } from 'express';
import { AdminQuestionService } from '../../services/admin/adminQuestionService.js';

export class AdminQuestionController {
    private adminQuestionService: AdminQuestionService;

    constructor(adminQuestionService: AdminQuestionService) {
        this.adminQuestionService = adminQuestionService;
    }

    public getRouter(): Router {
        const router = Router();

        router.put('/:id', async (req: Request, res: Response) => {
            try {
                const question = await this.adminQuestionService.updateQuestionContent(String(req.params.id), req.body.content);
                res.json(question);
            } catch (error) {
                res.status(400).json({ error: 'Update failed' });
            }
        });

        router.delete('/:id', async (req: Request, res: Response) => {
            try {
                await this.adminQuestionService.deleteQuestion(String(req.params.id));
                res.status(204).send();
            } catch (error) {
                res.status(400).json({ error: 'Deletion failed' });
            }
        });

        return router;
    }
}