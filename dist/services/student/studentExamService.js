import { StudentExamRepository } from "../../Repository/student/studentExamRepositories.js";
export class StudentExamService {
    repo;
    constructor() {
        this.repo = new StudentExamRepository();
    }
    async getAvailableExams(studentId) {
        if (!studentId) {
            throw Object.assign(new Error("L'identifiant de l'étudiant est requis."), { status: 401 });
        }
        return await this.repo.findAvailableExams(studentId);
    }
    async getExamToTake(examId, studentId) {
        const exam = await this.repo.findExamById(examId);
        if (!exam) {
            throw Object.assign(new Error("Examen introuvable."), { status: 404 });
        }
        const isOpen = await this.repo.isWithinWindow(examId);
        if (!isOpen) {
            throw Object.assign(new Error("Cet examen n'est pas accessible actuellement."), { status: 403 });
        }
        const alreadyAttempted = await this.repo.hasAttempt(examId, studentId);
        if (alreadyAttempted) {
            throw Object.assign(new Error("Vous avez déjà soumis une tentative pour cet examen."), { status: 409 });
        }
        const questions = await this.repo.getQuestionsForStudent(examId);
        return { ...exam, questions };
    }
    async submitExam(examId, studentId, answers) {
        const exam = await this.repo.findExamById(examId);
        if (!exam) {
            throw Object.assign(new Error("Examen introuvable."), { status: 404 });
        }
        const isOpen = await this.repo.isWithinWindow(examId);
        if (!isOpen) {
            throw Object.assign(new Error("La période de soumission pour cet examen est expirée."), { status: 403 });
        }
        const alreadyAttempted = await this.repo.hasAttempt(examId, studentId);
        if (alreadyAttempted) {
            throw Object.assign(new Error("Vous avez déjà passé cet examen."), { status: 409 });
        }
        const validAnswers = (answers ?? []).filter((answer) => answer?.questionId);
        try {
            const correction = await this.repo.submitExam(examId, studentId, validAnswers);
            return {
                ...correction,
                examTitle: exam.title,
                courseName: exam.courseName,
            };
        }
        catch (error) {
            if (error.code === "23505") {
                throw Object.assign(new Error("Vous avez déjà passé cet examen."), { status: 409 });
            }
            throw error;
        }
    }
    async getMyResults(studentId) {
        if (!studentId) {
            throw Object.assign(new Error("L'identifiant de l'étudiant est requis."), { status: 401 });
        }
        return await this.repo.findMyResults(studentId);
    }
}
