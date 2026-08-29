import { Request, Response } from "express";
import { CourseService } from "../../services/admin/courseService.js";

export class CourseController {
    private courseService: CourseService;

    constructor() {
        this.courseService = new CourseService();
    }

    getAllCourses = async (_req: Request, res: Response): Promise<void> => {
        try {
            const courses = await this.courseService.getAllCourses();
            res.status(200).json(courses);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    };

    createCourse = async (req: Request, res: Response): Promise<void> => {
        try {
            const course = await this.courseService.createCourse(req.body);
            res.status(201).json(course);
        } catch (error: any) {
            if (error.message === "Un cours avec ce code existe déjà.") {
                res.status(409).json({ message: error.message });
                return;
            }
            res.status(400).json({ message: error.message });
        }
    };

    updateCourse = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const updatedCourse = await this.courseService.updateCourse(id, req.body);
            res.status(200).json(updatedCourse);
        } catch (error: any) {
            if (error.message === "Cours non trouvé.") {
                res.status(404).json({ message: error.message });
                return;
            }
            if (error.message === "Ce code de cours est déjà utilisé.") {
                res.status(409).json({ message: error.message });
                return;
            }
            res.status(400).json({ message: error.message });
        }
    };

    deleteCourse = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            await this.courseService.deleteCourse(id);
            res.status(200).json({ message: "Cours supprimé avec succès." });
        } catch (error: any) {
            if (error.message === "Cours non trouvé.") {
                res.status(404).json({ message: error.message });
                return;
            }
            if (error.message.includes("RG-09")) {
                res.status(409).json({ message: error.message });
                return;
            }
            res.status(500).json({ message: error.message });
        }
    };
}
