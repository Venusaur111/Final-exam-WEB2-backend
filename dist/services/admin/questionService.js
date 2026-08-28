import { QuestionRepository } from "../../Repository/admin/adminQuestionRepositories.js"; // Adaptez le chemin
import { ExamRepository } from "../../Repository/admin/adminExamRepositories.js"; // Pour vérifier RG-08 (tentatives)
export class QuestionService {
    questionRepo;
    examRepo;
    constructor() {
        this.questionRepo = new QuestionRepository();
        this.examRepo = new ExamRepository();
    }
    async getQuestionsByExam(examId) {
        if (!examId)
            throw new Error("L'identifiant de l'examen est requis.");
        return await this.questionRepo.findByExam(examId);
    }
    async createQuestion(examId, data) {
        if (!examId)
            throw new Error("L'identifiant de l'examen est requis.");
        if (!data.statement || data.statement.trim() === "") {
            throw new Error("L'énoncé de la question est requis.");
        }
        if (!data.points || data.points <= 0) {
            throw new Error("Le nombre de points doit être supérieur à 0.");
        }
        // Validation des choix (RG-04 : Au moins 2 choix, au moins 1 correct)
        this.validateChoicesInput(data.choices);
        // RG-08 : Impossible d'ajouter des questions si l'examen a déjà des tentatives
        const hasAttempts = await this.examRepo.hasAttempts(examId);
        if (hasAttempts) {
            throw new Error("Impossible de modifier ou d'ajouter une question : l'examen contient déjà des tentatives.");
        }
        return await this.questionRepo.createWithChoices(examId, data);
    }
    async updateQuestion(questionId, data) {
        if (!questionId)
            throw new Error("L'identifiant de la question est requis.");
        const existingQuestion = await this.questionRepo.findById(questionId);
        if (!existingQuestion)
            throw new Error("Question introuvable.");
        // RG-08 : Verrouillage si des étudiants ont déjà passé l'examen
        const hasAttempts = await this.examRepo.hasAttempts(existingQuestion.examId);
        if (hasAttempts) {
            throw new Error("Modification impossible : des étudiants ont déjà passé cet examen.");
        }
        if (data.points !== undefined && data.points <= 0) {
            throw new Error("Le nombre de points doit être supérieur à 0.");
        }
        if (data.choices) {
            this.validateChoicesInput(data.choices);
        }
        const updated = await this.questionRepo.update(questionId, data);
        if (!updated)
            throw new Error("Erreur lors de la mise à jour de la question.");
        return updated;
    }
    async deleteQuestion(questionId) {
        if (!questionId)
            throw new Error("L'identifiant de la question est requis.");
        const examId = await this.questionRepo.getExamIdForQuestion(questionId);
        if (!examId)
            throw new Error("Question introuvable.");
        // RG-08 : Verrouillage suppression
        const hasAttempts = await this.examRepo.hasAttempts(examId);
        if (hasAttempts) {
            throw new Error("Suppression impossible : des étudiants ont déjà passé cet examen.");
        }
        await this.questionRepo.delete(questionId);
    }
    validateChoicesInput(choices) {
        if (!choices || choices.length < 2) {
            throw new Error("Une question doit comporter au moins 2 choix de réponse.");
        }
        const hasCorrect = choices.some((c) => c.isCorrect === true);
        if (!hasCorrect) {
            throw new Error("Au moins un des choix de réponse doit être marqué comme correct.");
        }
    }
}
