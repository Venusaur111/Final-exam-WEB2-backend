import { ExamRepository } from '../../repositories/examRepository.js';
import { Exam } from '../../models/examModel.js';

export class StudentExamService {
    private examRepository: ExamRepository;

    constructor(examRepository: ExamRepository) {
        this.examRepository = examRepository;
    }

    public async findAvailableExams(): Promise<Exam[]> {
        return this.examRepository.findAvailable();
    }

    public async getExamById(id: string): Promise<Exam | null> {
        return this.examRepository.findById(id);
    }
}