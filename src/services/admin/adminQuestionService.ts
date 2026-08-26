import { QuestionRepository } from '../../repositories/questionRepository.js';
import { Question, CreateQuestionDto } from '../../models/questionModel.js';

export class AdminQuestionService {
    private questionRepository: QuestionRepository;

    constructor(questionRepository: QuestionRepository) {
        this.questionRepository = questionRepository;
    }

    public async addQuestion(examId: string, dto: CreateQuestionDto): Promise<Question> {
        return this.questionRepository.insert(examId, dto);
    }

    public async updateQuestionContent(id: string, content: string): Promise<Question> {
        return this.questionRepository.updateContent(id, content);
    }

    public async deleteQuestion(id: string): Promise<void> {
        return this.questionRepository.delete(id);
    }

    public async getQuestions(examId: string): Promise<Question[]> {
        return this.questionRepository.findByExamId(examId);
    }

    public async getOneQuestion(id: string): Promise<Question | null> {
        return this.questionRepository.findById(id);
    }
}