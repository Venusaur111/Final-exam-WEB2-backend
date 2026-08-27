export class StudentQuestionService {
    questionRepository;
    choiceRepository;
    constructor(questionRepository, choiceRepository) {
        this.questionRepository = questionRepository;
        this.choiceRepository = choiceRepository;
    }
    async getQuestionsByExamId(examId) {
        const questions = await this.questionRepository.findByExamId(examId);
        if (!questions || questions.length === 0) {
            throw new Error("Questions not found for this exam");
        }
        return questions;
    }
    async isValidQuestion(questionId) {
        const question = await this.questionRepository.findById(questionId);
        if (!question) {
            throw new Error("Question not found");
        }
        return (await this.choiceRepository.findByQuestionId(questionId))
            .some((choice) => choice.choiceOrderIndex === question.correctAnswerIndex);
    }
}
