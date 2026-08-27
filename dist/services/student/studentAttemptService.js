export class StudentAttemptService {
    attemptRepository;
    studentQuestionService;
    constructor(attemptRepository, studentQuestionService) {
        this.attemptRepository = attemptRepository;
        this.studentQuestionService = studentQuestionService;
    }
    async submitExam(userId, examId, answers) {
        const score = await this.computeScore(examId, answers);
        return this.attemptRepository.insert(userId, examId, score, answers);
    }
    async computeScore(examId, answers) {
        const questions = await this.studentQuestionService.getQuestionsByExamId(examId);
        let totalScore = 0;
        for (const question of questions) {
            const studentAnswer = answers.find(a => a.questionId === question.id);
            if (studentAnswer && studentAnswer.choiceOrderIndex === question.correctAnswerIndex) {
                totalScore += question.score;
            }
        }
        return totalScore;
    }
    async getMyResults(userId) {
        return this.attemptRepository.findByUserId(userId);
    }
}
