export class AdminQuestionService {
    questionRepository;
    constructor(questionRepository) {
        this.questionRepository = questionRepository;
    }
    async addQuestion(examId, dto) {
        return this.questionRepository.insert(examId, dto);
    }
    async updateQuestionContent(id, content) {
        return this.questionRepository.updateContent(id, content);
    }
    async deleteQuestion(id) {
        return this.questionRepository.delete(id);
    }
    async getQuestions(examId) {
        return this.questionRepository.findByExamId(examId);
    }
    async getOneQuestion(id) {
        return this.questionRepository.findById(id);
    }
}
