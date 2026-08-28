// studentExamService.ts
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

    /**
     * RG-02 + RG-03: List of exams with open window and not attempted[cite: 20].
     */
    async getAvailableExams(studentId: string): Promise<readonly Exam[]> {
        if (!studentId) {
            throw new Error("Student identifier is required.");
        }
        return await this.repo.findAvailableExams(studentId);
    }

    /**
     * RG-07: Retrieves exam questions without exposing the correct answer (is_correct)[cite: 20].
     */
    async getExamQuestions(examId: string, studentId: string): Promise<readonly QuestionForStudent[]> {
        const exam = await this.repo.findExamById(examId);
        if (!exam) {
            throw new Error("Exam not found.");
        }

        // RG-03: Check availability window[cite: 20]
        const isOpen = await this.repo.isWithinWindow(examId);
        if (!isOpen) {
            throw new Error("This exam is not currently accessible.");
        }

        // RG-02: Check that no attempt has already been made[cite: 20]
        const alreadyAttempted = await this.repo.hasAttempt(examId, studentId);
        if (alreadyAttempted) {
            throw new Error("You have already submitted an attempt for this exam.");
        }

        return await this.repo.getQuestionsForStudent(examId);
    }

    /**
     * RG-02 + RG-05 + RG-06: Exam submission and server-side score calculation[cite: 20].
     */
    async submitExam(
        examId: string,
        studentId: string,
        answers: readonly SubmitAnswerInput[]
    ): Promise<ExamCorrection> {
        const exam = await this.repo.findExamById(examId);
        if (!exam) {
            throw new Error("Exam not found.");
        }

        // Check time window upon submission[cite: 20]
        const isOpen = await this.repo.isWithinWindow(examId);
        if (!isOpen) {
            throw new Error("The submission period for this exam has expired.");
        }

        // Check attempt uniqueness[cite: 20]
        const alreadyAttempted = await this.repo.hasAttempt(examId, studentId);
        if (alreadyAttempted) {
            throw new Error("You have already taken this exam.");
        }

        // Transaction and score calculation (RG-06) are delegated to the repository[cite: 20]
        return await this.repo.submitExam(examId, studentId, answers);
    }

    /**
     * History of results for the logged-in student[cite: 20].
     */
    async getMyResults(studentId: string): Promise<
        readonly { readonly attemptId: string; readonly examId: string; readonly examTitle: string; readonly score: number; readonly submittedAt: Date }[]
    > {
        if (!studentId) {
            throw new Error("Student identifier is required.");
        }
        return await this.repo.findMyResults(studentId);
    }

    /**
     * View detailed correction of an attempt[cite: 20].
     */
    async getCorrectionForAttempt(attemptId: string, studentId: string): Promise<ExamCorrection> {
        if (!attemptId || !studentId) {
            throw new Error("Missing identifiers.");
        }

        const correction = await this.repo.getCorrectionForAttempt(attemptId, studentId);

        if (!correction) {
            throw new Error("Correction not found or you are not authorized to view it.");
        }

        return correction;
    }
}