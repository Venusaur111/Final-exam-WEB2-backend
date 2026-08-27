export class StudentChoiceService {
    choiceRepository;
    constructor(choiceRepository) {
        this.choiceRepository = choiceRepository;
        this.choiceRepository = choiceRepository;
    }
    async getChoiceById(choiceId) {
        const choice = await this.choiceRepository.findChoiceById(choiceId);
        if (!choice) {
            throw new Error("Choice not found");
        }
        return choice;
    }
    async selectChoice(choiceId) {
        await this.getChoiceById(choiceId);
        return await this.choiceRepository.updateChoiceSelection(choiceId, true);
    }
    async getChoicesByQuestionId(questionId) {
        return await this.choiceRepository.findByQuestionId(questionId);
    }
    async choiceOrderIndex(choiceId) {
        const choice = await this.getChoiceById(choiceId);
        return choice.choiceOrderIndex;
    }
}
