// questionService.ts
import { QuestionRepository } from "../../Repository/admin/adminQuestionRepositories.js";
import { ExamRepository } from "../../Repository/admin/adminExamRepositories.js";
import {
    QuestionWithChoices,
    CreateQuestionInput,
    UpdateQuestionInput,
} from "../../models/questionModel.js";

export class QuestionService {
    private questionRepo: QuestionRepository;
    private examRepo: ExamRepository;

    constructor() {
        this.questionRepo = new QuestionRepository();
        this.examRepo = new ExamRepository();
    }

    async getQuestionsByExam(examId: string): Promise<readonly QuestionWithChoices[]> {
        if (!examId) throw new Error("Exam identifier is required.");
        return await this.questionRepo.findByExam(examId);
    }

    async createQuestion(examId: string, data: CreateQuestionInput): Promise<QuestionWithChoices> {
        if (!examId) throw new Error("Exam identifier is required.");
        if (!data.statement || data.statement.trim() === "") {
            throw new Error("Question statement is required.");
        }
        if (!data.points || data.points <= 0) {
            throw new Error("The number of points must be greater than 0.");
        }

        // Choice validation (RG-04: At least 2 choices, at least 1 correct)
        this.validateChoicesInput(data.choices);

        // RG-08: Cannot add questions if the exam already has attempts
        const hasAttempts = await this.examRepo.hasAttempts(examId);
        if (hasAttempts) {
            throw new Error("Cannot modify or add a question: the exam already contains attempts.");
        }

        return await this.questionRepo.createWithChoices(examId, data);
    }

    async updateQuestion(questionId: string, data: UpdateQuestionInput): Promise<QuestionWithChoices> {
        if (!questionId) throw new Error("Question identifier is required.");

        const existingQuestion = await this.questionRepo.findById(questionId);
        if (!existingQuestion) throw new Error("Question not found.");

        // RG-08: Lock if students have already taken the exam
        const hasAttempts = await this.examRepo.hasAttempts(existingQuestion.examId);
        if (hasAttempts) {
            throw new Error("Modification impossible: students have already taken this exam.");
        }

        if (data.points !== undefined && data.points <= 0) {
            throw new Error("The number of points must be greater than 0.");
        }

        if (data.choices) {
            this.validateChoicesInput(data.choices);
        }

        const updated = await this.questionRepo.update(questionId, data);
        if (!updated) throw new Error("Error updating the question.");

        return updated;
    }

    async deleteQuestion(questionId: string): Promise<void> {
        if (!questionId) throw new Error("Question identifier is required.");

        const examId = await this.questionRepo.getExamIdForQuestion(questionId);
        if (!examId) throw new Error("Question not found.");

        // RG-08: Deletion lock
        const hasAttempts = await this.examRepo.hasAttempts(examId);
        if (hasAttempts) {
            throw new Error("Deletion impossible: students have already taken this exam.");
        }

        await this.questionRepo.delete(questionId);
    }

    private validateChoicesInput(choices: readonly { readonly label: string; readonly isCorrect: boolean }[] | undefined) {
        if (!choices || choices.length < 2) {
            throw new Error("A question must have at least 2 response choices.");
        }
        const hasCorrect = choices.some((c) => c.isCorrect === true);
        if (!hasCorrect) {
            throw new Error("At least one response choice must be marked as correct.");
        }
    }
}