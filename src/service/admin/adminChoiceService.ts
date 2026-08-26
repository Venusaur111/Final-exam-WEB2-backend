import { ChoiceRepository } from '../../repositories/choiceRepository.js';
import { Choice, CreateChoiceDto } from '../../models/choiceModel.js';

export class AdminChoiceService {
    private choiceRepository: ChoiceRepository;

    constructor(choiceRepository: ChoiceRepository) {
        this.choiceRepository = choiceRepository;
    }

    public async addChoice(questionId: string, dto: CreateChoiceDto): Promise<Choice> {
        return this.choiceRepository.insert(questionId, dto);
    }

    public async updateChoiceContent(id: string, content: string): Promise<Choice> {
        return this.choiceRepository.updateContent(id, content);
    }

    public async setAsCorrect(id: string): Promise<Choice> {
        return this.choiceRepository.setAsCorrect(id);
    }

    public async getChoices(questionId: string): Promise<Choice[]> {
        return this.choiceRepository.findByQuestionId(questionId);
    }

    public async getAChoice(id: string): Promise<Choice | null> {
        return this.choiceRepository.findById(id);
    }
}