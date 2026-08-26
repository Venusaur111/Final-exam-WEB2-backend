import { Router } from 'express';
export class AdminCourseController {
    adminCourseService;
    constructor(adminCourseService) {
        this.adminCourseService = adminCourseService;
    }
    getRouter() {
        const router = Router();
        router.get('/', async (req, res) => {
            try {
                const courses = await this.adminCourseService.listCourses();
                res.json(courses);
            }
            catch (error) {
                res.status(500).json({ error: 'Internal server error' });
            }
        });
        router.post('/', async (req, res) => {
            try {
                const course = await this.adminCourseService.createCourse(req.body);
                res.status(201).json(course);
            }
            catch (error) {
                res.status(400).json({ error: 'Invalid input data' });
            }
        });
        router.put('/:id', async (req, res) => {
            try {
                const course = await this.adminCourseService.updateCourse(String(req.params.id), req.body);
                res.json(course);
            }
            catch (error) {
                res.status(400).json({ error: 'Update failed' });
            }
        });
        router.delete('/:id', async (req, res) => {
            try {
                await this.adminCourseService.deleteCourse(String(req.params.id));
                res.status(204).send();
            }
            catch (error) {
                res.status(400).json({ error: 'Deletion failed' });
            }
        });
        return router;
    }
}
