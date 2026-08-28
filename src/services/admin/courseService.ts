// courseService.ts
import { CourseRepository } from "../../Repository/admin/adminCourseRepositories.js";
import { Course, CreateCourseInput, UpdateCourseInput } from "../../models/courseModel.js";

export class CourseService {
    private courseRepo: CourseRepository;

    constructor() {
        this.courseRepo = new CourseRepository();
    }

    async getAllCourses(): Promise<readonly Course[]> {
        return this.courseRepo.findAll();
    }

    async getCourseById(id: string): Promise<Course> {
        const course = await this.courseRepo.findById(id);
        if (!course) {
            throw new Error("Course not found.");
        }
        return course;
    }

    async createCourse(data: CreateCourseInput): Promise<Course> {
        // Code uniqueness validation
        const existing = await this.courseRepo.findByCode(data.code);
        if (existing) {
            throw new Error("A course with this code already exists.");
        }
        return this.courseRepo.create(data);
    }

    async updateCourse(id: string, data: UpdateCourseInput): Promise<Course> {
        await this.getCourseById(id); // Verifies existence

        if (data.code) {
            const existing = await this.courseRepo.findByCode(data.code);
            if (existing && existing.id !== id) {
                throw new Error("This course code is already in use.");
            }
        }

        const updated = await this.courseRepo.update(id, data);
        if (!updated) throw new Error("Failed to update the course.");
        return updated;
    }

    async deleteCourse(id: string): Promise<void> {
        await this.getCourseById(id);

        // Business rule RG-09: Check before deletion
        const hasExams = await this.courseRepo.hasExams(id);
        if (hasExams) {
            throw new Error("Cannot delete this course because exams are attached to it (RG-09).");
        }

        await this.courseRepo.delete(id);
    }
}