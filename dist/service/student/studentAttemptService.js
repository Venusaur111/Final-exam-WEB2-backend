export class StudentAttemptService {
    attemptRepository;
    constructor(attemptRepository) {
        this.attemptRepository = attemptRepository;
    }
    async submitExam(userId, examId, answers) {
        const score = await this.computeScore(examId, answers);
        return this.attemptRepository.insert(userId, examId, score);
    }
    async computeScore(examId, answers) {
        // Business logic to calculate score
        return 0;
    }
    async getMyResults(userId) {
        return this.attemptRepository.findByUserId(userId);
    }
}
