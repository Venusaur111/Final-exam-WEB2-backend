import { Router } from 'express';
export class AdminQuestionController {
    adminQuestionService;
    constructor(adminQuestionService) {
        this.adminQuestionService = adminQuestionService;
    }
    getRouter() {
        const router = Router();
        router.put('/:id', async (req, res) => {
            try {
                const question = await this.adminQuestionService.updateQuestionContent(String(req.params.id), req.body.content);
                res.json(question);
            }
            catch (error) {
                res.status(400).json({ error: 'Update failed' });
            }
        });
        router.delete('/:id', async (req, res) => {
            try {
                await this.adminQuestionService.deleteQuestion(String(req.params.id));
                res.status(204).send();
            }
            catch (error) {
                res.status(400).json({ error: 'Deletion failed' });
            }
        });
        return router;
    }
}
