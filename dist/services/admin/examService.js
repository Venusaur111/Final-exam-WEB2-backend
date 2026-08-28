// examService.ts
import { ExamRepository } from "../../Repository/admin/adminExamRepositories.js";
import { CourseRepository } from "../../Repository/admin/adminCourseRepositories.js";
export class ExamService {
    examRepo;
    courseRepo;
    constructor() {
        this.examRepo = new ExamRepository();
        this.courseRepo = new CourseRepository();
    }
    async getAllExams() {
        return this.examRepo.findAll();
    }
    async getExamsByCourse(courseId) {
        const course = await this.courseRepo.findById(courseId);
        if (!course) {
            throw new Error("Course not found.");
        }
        return this.examRepo.findByCourse(courseId);
    }
    async getExamById(id) {
        const exam = await this.examRepo.findById(id);
        if (!exam) {
            throw new Error("Exam not found.");
        }
        return exam;
    }
    async createExam(data) {
        // Verify if the associated course exists
        const course = await this.courseRepo.findById(data.courseId);
        if (!course) {
            throw new Error("The specified course does not exist.");
        }
        // Date validation
        if (new Date(data.startAt) >= new Date(data.endAt)) {
            throw new Error("The start date must be earlier than the end date.");
        }
        return this.examRepo.create(data);
    }
    async updateExam(id, data) {
        const exam = await this.getExamById(id);
        const startAt = data.startAt ? new Date(data.startAt) : new Date(exam.startAt);
        const endAt = data.endAt ? new Date(data.endAt) : new Date(exam.endAt);
        if (startAt >= endAt) {
            throw new Error("The start date must be earlier than the end date.");
        }
        const updated = await this.examRepo.update(id, data);
        if (!updated)
            throw new Error("Failed to update the exam.");
        return updated;
    }
    async deleteExam(id) {
        await this.getExamById(id);
        // RG-09: Prevent deletion if attempts exist
        const hasAttempts = await this.examRepo.hasAttempts(id);
        if (hasAttempts) {
            throw new Error("Cannot delete this exam because attempts are linked to it (RG-09).");
        }
        await this.examRepo.delete(id);
    }
    async getExamResults(examId) {
        await this.getExamById(examId);
        return this.examRepo.getResultsSummary(examId);
    }
}
