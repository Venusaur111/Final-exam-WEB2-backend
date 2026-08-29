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
            throw new Error("Cours non trouvé.");
        }
        return course;
    }
    async createCourse(data) {
        // Validation d'unicité du code
        const existing = await this.courseRepo.findByCode(data.code);
        if (existing) {
            throw new Error("Un cours avec ce code existe déjà.");
        }
        return this.courseRepo.create(data);
    }
    async updateCourse(id, data) {
        await this.getCourseById(id); // Vérifie l'existence
        if (data.code) {
            const existing = await this.courseRepo.findByCode(data.code);
            if (existing && existing.id !== id) {
                throw new Error("Ce code de cours est déjà utilisé.");
            }
        }
        const updated = await this.courseRepo.update(id, data);
        if (!updated)
            throw new Error("Échec de la mise à jour du cours.");
        return updated;
    }
    async deleteCourse(id) {
        await this.getCourseById(id);
        // Règle de gestion RG-09 : Vérification avant suppression
        const hasExams = await this.courseRepo.hasExams(id);
        if (hasExams) {
            throw new Error("Impossible de supprimer ce cours car des examens y sont rattachés (RG-09).");
        }
        await this.courseRepo.delete(id);
    }
}
