import { StudentExamRepository } from "../../Repository/student/studentExamRepositories.js";
import { SubmitAnswerInput } from "../../models/attempt.js";
import { Exam } from "../../models/examModel.js";
import { QuestionForStudent } from "../../models/questionModel.js";
import { ExamCorrection } from "../../models/answer.js";

export class StudentExamService {
    private repo: StudentExamRepository;

    constructor() {
        this.repo = new StudentExamRepository();
    }

    async getAvailableExams(studentId: string): Promise<Exam[]> {
        if (!studentId) {
            throw Object.assign(new Error("L'identifiant de l'étudiant est requis."), { status: 401 });
        }
        return await this.repo.findAvailableExams(studentId);
    }

    async getExamToTake(examId: string, studentId: string): Promise<Exam & { questions: QuestionForStudent[] }> {
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

    async submitExam(
        examId: string,
        studentId: string,
        answers: SubmitAnswerInput[]
    ): Promise<ExamCorrection> {
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
        } catch (error: any) {
            if (error.code === "23505") {
                throw Object.assign(new Error("Vous avez déjà passé cet examen."), { status: 409 });
            }
            throw error;
        }
    }

    async getMyResults(studentId: string) {
        if (!studentId) {
            throw Object.assign(new Error("L'identifiant de l'étudiant est requis."), { status: 401 });
        }
        return await this.repo.findMyResults(studentId);
    }
}
