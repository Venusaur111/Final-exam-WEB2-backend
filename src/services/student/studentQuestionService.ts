import { QuestionRepository } from "../../repositories/questionRepository.js";
import { ChoiceRepository } from "../../repositories/choiceRepository.js";
import { Question } from "../../models/questionModel.js";
import { Choice } from "../../models/choice.js";

export class StudentQuestionService {
    private questionRepository: QuestionRepository;
    private choiceRepository: ChoiceRepository;

    constructor(questionRepository: QuestionRepository, choiceRepository: ChoiceRepository) {
        this.questionRepository = questionRepository;
        this.choiceRepository = choiceRepository;
    }

    public async getQuestionsByExamId(examId: string): Promise<Question[]> {
        const questions: Question[] = await this.questionRepository.findByExamId(examId);
        if (!questions || questions.length === 0) {
            throw new Error("Questions not found for this exam");
        }
        return questions;
    }

    public async isValidQuestion(questionId: string): Promise<boolean> {
        const question: Question = await this.questionRepository.findById(questionId);
        if (!question) {
            throw new Error("Question not found");
        }
        return (await this.choiceRepository.findByQuestionId(questionId))
            .some((choice: Choice) => choice.choiceOrderIndex === question.correctAnswerIndex);
    }
}