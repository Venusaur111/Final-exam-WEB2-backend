// courseService.ts
import { CourseRepository } from "../../Repository/admin/adminCourseRepositories.js";
export class CourseService {
    courseRepo;
    constructor() {
        this.courseRepo = new CourseRepository();
    }
    async getAllCourses() {
        return this.courseRepo.findAll();
    }
    async getCourseById(id) {
        const course = await this.courseRepo.findById(id);
        if (!course) {
            throw new Error("Course not found.");
        }
        return course;
    }
    async createCourse(data) {
        // Code uniqueness validation
        const existing = await this.courseRepo.findByCode(data.code);
        if (existing) {
            throw new Error("A course with this code already exists.");
        }
        return this.courseRepo.create(data);
    }
    async updateCourse(id, data) {
        await this.getCourseById(id); // Verifies existence
        if (data.code) {
            const existing = await this.courseRepo.findByCode(data.code);
            if (existing && existing.id !== id) {
                throw new Error("This course code is already in use.");
            }
        }
        const updated = await this.courseRepo.update(id, data);
        if (!updated)
            throw new Error("Failed to update the course.");
        return updated;
    }
    async deleteCourse(id) {
        await this.getCourseById(id);
        // Business rule RG-09: Check before deletion
        const hasExams = await this.courseRepo.hasExams(id);
        if (hasExams) {
            throw new Error("Cannot delete this course because exams are attached to it (RG-09).");
        }
        await this.courseRepo.delete(id);
    }
}
