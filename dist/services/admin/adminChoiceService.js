export class AdminChoiceService {
    choiceRepository;
    constructor(choiceRepository) {
        this.choiceRepository = choiceRepository;
    }
    async addChoice(questionId, dto) {
        return this.choiceRepository.insert(questionId, dto.content);
    }
    async updateChoiceContent(id, content) {
        return this.choiceRepository.updateContent(id, content);
    }
    async setAsCorrect(id) {
        return this.choiceRepository.setAsCorrect(id);
    }
    async getChoices(questionId) {
        return this.choiceRepository.findByQuestionId(questionId);
    }
    async getAChoice(id) {
        return this.choiceRepository.findById(id);
    }
}
