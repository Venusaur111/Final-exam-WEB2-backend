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
            throw new Error("Cours non trouvé.");
        }
        return this.examRepo.findByCourse(courseId);
    }
    async getExamById(id) {
        const exam = await this.examRepo.findById(id);
        if (!exam) {
            throw new Error("Examen non trouvé.");
        }
        return exam;
    }
    async createExam(data) {
        // Vérifier si le cours associé existe
        const course = await this.courseRepo.findById(data.courseId);
        if (!course) {
            throw new Error("Le cours spécifié n'existe pas.");
        }
        // Validation des dates
        if (new Date(data.startAt) >= new Date(data.endAt)) {
            throw new Error("La date de début doit être antérieure à la date de fin.");
        }
        return this.examRepo.create(data);
    }
    async updateExam(id, data) {
        const exam = await this.getExamById(id);
        const startAt = data.startAt ? new Date(data.startAt) : new Date(exam.startAt);
        const endAt = data.endAt ? new Date(data.endAt) : new Date(exam.endAt);
        if (startAt >= endAt) {
            throw new Error("La date de début doit être antérieure à la date de fin.");
        }
        const updated = await this.examRepo.update(id, data);
        if (!updated)
            throw new Error("Échec de la mise à jour de l'examen.");
        return updated;
    }
    async deleteExam(id) {
        await this.getExamById(id);
        // RG-09 : On empêche la suppression si des tentatives existent
        const hasAttempts = await this.examRepo.hasAttempts(id);
        if (hasAttempts) {
            throw new Error("Impossible de supprimer cet examen car des tentatives y sont liées (RG-09).");
        }
        await this.examRepo.delete(id);
    }
    async getExamResults(examId) {
        await this.getExamById(examId);
        return this.examRepo.getResultsSummary(examId);
    }
}
