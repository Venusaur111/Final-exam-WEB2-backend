import { StudentExamRepository } from "../../Repository/student/studentExamRepositories.js";
export class StudentExamService {
    repo;
    constructor() {
        this.repo = new StudentExamRepository();
    }
    /**
     * RG-02 + RG-03 : Liste des examens dont la fenêtre est ouverte et non tentés.
     */
    async getAvailableExams(studentId) {
        if (!studentId) {
            throw new Error("L'identifiant de l'étudiant est requis.");
        }
        return await this.repo.findAvailableExams(studentId);
    }
    /**
     * RG-07 : Récupère les questions d'un examen sans exposer la bonne réponse (is_correct).
     */
    async getExamQuestions(examId, studentId) {
        const exam = await this.repo.findExamById(examId);
        if (!exam) {
            throw new Error("Examen introuvable.");
        }
        // RG-03 : Vérification de la fenêtre de disponibilité
        const isOpen = await this.repo.isWithinWindow(examId);
        if (!isOpen) {
            throw new Error("Cet examen n'est pas accessible actuellement.");
        }
        // RG-02 : Vérification qu'aucune tentative n'a déjà été effectuée
        const alreadyAttempted = await this.repo.hasAttempt(examId, studentId);
        if (alreadyAttempted) {
            throw new Error("Vous avez déjà soumis une tentative pour cet examen.");
        }
        return await this.repo.getQuestionsForStudent(examId);
    }
    /**
     * RG-02 + RG-05 + RG-06 : Soumission de l'examen et calcul du score côté serveur.
     */
    async submitExam(examId, studentId, answers) {
        const exam = await this.repo.findExamById(examId);
        if (!exam) {
            throw new Error("Examen introuvable.");
        }
        // Vérification de la fenêtre temporelle lors de la soumission
        const isOpen = await this.repo.isWithinWindow(examId);
        if (!isOpen) {
            throw new Error("La période de soumission pour cet examen est expirée.");
        }
        // Vérification unicité de la tentative
        const alreadyAttempted = await this.repo.hasAttempt(examId, studentId);
        if (alreadyAttempted) {
            throw new Error("Vous avez déjà passé cet examen.");
        }
        // La transaction et le calcul du score (RG-06) sont délégués au repository
        return await this.repo.submitExam(examId, studentId, answers);
    }
    /**
     * Historique des résultats de l'étudiant connecté.
     */
    async getMyResults(studentId) {
        if (!studentId) {
            throw new Error("L'identifiant de l'étudiant est requis.");
        }
        return await this.repo.findMyResults(studentId);
    }
    /**
     * Consultation de la correction détaillée d'une tentative.
     */
    async getCorrectionForAttempt(attemptId, studentId) {
        if (!attemptId || !studentId) {
            throw new Error("Identifiants manquants.");
        }
        const correction = await this.repo.getCorrectionForAttempt(attemptId, studentId);
        if (!correction) {
            throw new Error("Correction introuvable ou vous n'êtes pas autorisé à la consulter.");
        }
        return correction;
    }
}
