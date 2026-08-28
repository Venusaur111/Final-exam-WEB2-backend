import { CourseService } from "../../services/admin/courseService.js";
export class CourseController {
    courseService;
    constructor() {
        this.courseService = new CourseService();
    }
    /**
     * GET /api/courses
     * Retrieves the list of all courses
     */
    getAllCourses = async (_req, res) => {
        try {
            const courses = await this.courseService.getAllCourses();
            res.status(200).json({ success: true, data: courses });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    };
    /**
     * GET /api/courses/:id
     * Retrieves a course by its ID
     */
    getCourseById = async (req, res) => {
        try {
            const { id } = req.params;
            const course = await this.courseService.getCourseById(id);
            res.status(200).json({ success: true, data: course });
        }
        catch (error) {
            if (error.message === "Course not found.") {
                res.status(404).json({ success: false, message: error.message });
                return;
            }
            res.status(500).json({ success: false, message: error.message });
        }
    };
    /**
     * POST /api/courses
     * Creates a new course
     */
    createCourse = async (req, res) => {
        try {
            const course = await this.courseService.createCourse(req.body);
            res.status(201).json({ success: true, data: course });
        }
        catch (error) {
            if (error.message === "A course with this code already exists.") {
                res.status(409).json({ success: false, message: error.message });
                return;
            }
            res.status(400).json({ success: false, message: error.message });
        }
    };
    /**
     * PUT /api/courses/:id
     * Updates an existing course
     */
    updateCourse = async (req, res) => {
        try {
            const { id } = req.params;
            const updatedCourse = await this.courseService.updateCourse(id, req.body);
            res.status(200).json({ success: true, data: updatedCourse });
        }
        catch (error) {
            if (error.message === "Course not found.") {
                res.status(404).json({ success: false, message: error.message });
                return;
            }
            if (error.message === "This course code is already in use.") {
                res.status(409).json({ success: false, message: error.message });
                return;
            }
            res.status(400).json({ success: false, message: error.message });
        }
    };
    /**
     * DELETE /api/courses/:id
     * Deletes a course (Blocked if exams are attached - RG-09)
     */
    deleteCourse = async (req, res) => {
        try {
            const { id } = req.params;
            await this.courseService.deleteCourse(id);
            res.status(200).json({ success: true, message: "Course deleted successfully." });
        }
        catch (error) {
            if (error.message === "Course not found.") {
                res.status(404).json({ success: false, message: error.message });
                return;
            }
            if (error.message.includes("RG-09")) {
                res.status(400).json({ success: false, message: error.message });
                return;
            }
            res.status(500).json({ success: false, message: error.message });
        }
    };
}
