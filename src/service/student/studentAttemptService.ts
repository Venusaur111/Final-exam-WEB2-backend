import { AttemptRepository } from '../../repositories/attemptRepository.js';
import { Attempt } from '../../models/attempt.js';

export class StudentAttemptService {
    private attemptRepository: AttemptRepository;

    constructor(attemptRepository: AttemptRepository) {
        this.attemptRepository = attemptRepository;
    }

    public async submitExam(userId: string, examId: string, answers: any): Promise<Attempt> {
        const score = await this.computeScore(examId, answers);
        return this.attemptRepository.insert(userId, examId, score);
    }

    public async computeScore(examId: string, answers: any): Promise<number> {
        // Business logic to calculate score
        return 0;
    }

    public async getMyResults(userId: string): Promise<Attempt[]> {
        return this.attemptRepository.findByUserId(userId);
    }
}