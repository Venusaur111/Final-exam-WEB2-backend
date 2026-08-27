import { AttemptRepository } from '../../repository/admin/attemptRepository.js';
import { Attempt } from '../../models/attempt.js';
import { StudentQuestionService } from './studentQuestionService.js';

export interface Answer {
    questionId: string;
    choiceOrderIndex: number;
}

export class StudentAttemptService {
    private attemptRepository: AttemptRepository;
    private studentQuestionService: StudentQuestionService;

    constructor(attemptRepository: AttemptRepository, studentQuestionService: StudentQuestionService) {
        this.attemptRepository = attemptRepository;
        this.studentQuestionService = studentQuestionService;
    }

    public async submitExam(userId: string, examId: string, answers: Answer[]): Promise<Attempt> {
        const score = await this.computeScore(examId, answers);
        return this.attemptRepository.insert(userId, examId, score, answers);
    }

    public async computeScore(examId: string, answers: Answer[]): Promise<number> {
        const questions = await this.studentQuestionService.getQuestionsByExamId(examId);
        let totalScore = 0;

        for (const question of questions) {
            const studentAnswer = answers.find(a => a.questionId === question.id);
            if (studentAnswer && studentAnswer.choiceOrderIndex === question.correctAnswerIndex) {
                totalScore += question.score;
            }
        }

        return totalScore;
    }

    public async getMyResults(userId: string): Promise<Attempt[]> {
        return this.attemptRepository.findByUserId(userId);
    }
}