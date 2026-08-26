import { Router, Request, Response } from 'express';
import { AdminCourseService } from '../../services/admin/adminCourseService.js';

export class AdminCourseController {
    private adminCourseService: AdminCourseService;

    constructor(adminCourseService: AdminCourseService) {
        this.adminCourseService = adminCourseService;
    }

    public getRouter(): Router {
        const router = Router();

        router.get('/', async (req: Request, res: Response) => {
            try {
                const courses = await this.adminCourseService.listCourses();
                res.json(courses);
            } catch (error) {
                res.status(500).json({ error: 'Internal server error' });
            }
        });

        router.post('/', async (req: Request, res: Response) => {
            try {
                const course = await this.adminCourseService.createCourse(req.body);
                res.status(201).json(course);
            } catch (error) {
                res.status(400).json({ error: 'Invalid input data' });
            }
        });

        router.put('/:id', async (req: Request, res: Response) => {
            try {
                const course = await this.adminCourseService.updateCourse(req.params.id, req.body);
                res.json(course);
            } catch (error) {
                res.status(400).json({ error: 'Update failed' });
            }
        });

        router.delete('/:id', async (req: Request, res: Response) => {
            try {
                await this.adminCourseService.deleteCourse(req.params.id);
                res.status(204).send();
            } catch (error) {
                res.status(400).json({ error: 'Deletion failed' });
            }
        });

        return router;
    }
}