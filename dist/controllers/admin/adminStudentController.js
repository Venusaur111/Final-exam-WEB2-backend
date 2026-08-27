import { Router } from 'express';
import { AdminUserService } from '../../services/admin/adminUserService.js';
export class AdminStudentController {
    adminUserService;
    constructor(adminUserService = new AdminUserService()) {
        this.adminUserService = adminUserService;
    }
    getRouter() {
        const router = Router();
        router.get('/', async (req, res) => {
            try {
                const students = await this.adminUserService.listStudents();
                res.json(students);
            }
            catch (error) {
                res.status(500).json({ error: 'Internal server error' });
            }
        });
        router.post('/', async (req, res) => {
            try {
                const student = await this.adminUserService.registerStudent(req.body);
                res.status(201).json(student);
            }
            catch (error) {
                res.status(400).json({ error: 'Invalid input data' });
            }
        });
        router.put('/:id', async (req, res) => {
            try {
                const student = await this.adminUserService.updateStudent(String(req.params.id), req.body);
                res.json(student);
            }
            catch (error) {
                res.status(400).json({ error: 'Update failed' });
            }
        });
        router.delete('/:id', async (req, res) => {
            try {
                const student = await this.adminUserService.deactivateStudent(String(req.params.id));
                res.json({ message: 'Student deactivated successfully', student });
            }
            catch (error) {
                res.status(400).json({ error: 'Deactivation failed' });
            }
        });
        return router;
    }
}
