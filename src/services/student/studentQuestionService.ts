import { QuestionRepository } from "../../repository/QuestionRepository.js"
import { Question} from "../../models/questionModel.js";
import {Choice} from "../../models/choice.js";

export class StudentQuestionService {
    private questionRepository: QuestionRepository;

    constructor (private questionRepository: QuestionRepository) {
        this.questionRepository = questionRepository;
    }

    /**
     * Retrieves all questions for a specific exam.
     */

    public async getQuestionsByExamId(examId: string): Promise<Question[]> {
        const questions: Question[] = await this.questionRepository.findByExamId(examId);
        if (!questions || questions.length === 0) {
            throw new Error("Questions not found for this exam");
        }
        return questions;
    }

    public async isValidQuestion(questionId: string): Promise<boolean> {
        const question: Question = await this.questionRepository.findQuestionById(questionId);
        if (!question) {
            throw new Error("Question not found");
        }
        return (await this.choiceRepository.findByQuestionId(questionId))
            .some((choice: Choice) => choice.choiceOrderIndex === question.answerIndex);
    }

}