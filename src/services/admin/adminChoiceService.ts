import { ChoiceRepository } from '../../repository/admin/adminChoiceRepository.js';
import { Choice } from '../../models/choice.js';
import { CreateChoiceDto } from '../../models/dto/createDtoTypes.js'
export class AdminChoiceService {
    private choiceRepository: ChoiceRepository;

    constructor(choiceRepository: ChoiceRepository) {
        this.choiceRepository = choiceRepository;
    }

    public async addChoice(questionId: string, dto: CreateChoiceDto): Promise<Choice> {
        return this.choiceRepository.insert(questionId, dto.content);
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