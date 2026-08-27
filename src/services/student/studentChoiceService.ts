import { ChoiceRepository } from '../../repository/choiceRepository.js';
import { Choice } from '../../models/choice.js';

export class StudentChoiceService {
    constructor(private choiceRepository: ChoiceRepository) {
        this.choiceRepository = choiceRepository;
    }

    public async getChoiceById(choiceId: string): Promise<Choice> {
        const choice = await this.choiceRepository.findChoiceById(choiceId);
        if (!choice) {
            throw new Error("Choice not found");
        }
        return choice;
    }

    public async selectChoice(choiceId: string): Promise<Choice | null> {
        await this.getChoiceById(choiceId);
        return await this.choiceRepository.updateChoiceSelection(choiceId, true);
    }

    public async getChoicesByQuestionId(questionId: string): Promise<Choice[]> {
        return await this.choiceRepository.findByQuestionId(questionId);
    }

    public async choiceOrderIndex(choiceId: string): Promise<number> {
        const choice = await this.getChoiceById(choiceId);
        return choice.choiceOrderIndex;
    }
}