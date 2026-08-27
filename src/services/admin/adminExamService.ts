import { ExamRepository } from '../../repository/admin/adminExamRepository.js';
import { Exam } from '../../models/examModel.js';
import { Attempt } from '../../models/attempt.js';
import { CreateExamDto } from '../../models/dto/createDtoTypes.js';

export class AdminExamService {
    private examRepository: ExamRepository;

    constructor(examRepository: ExamRepository) {
        this.examRepository = examRepository;
    }

    public async createExam(dto: CreateExamDto): Promise<Exam> {
        return this.examRepository.insert(dto);
    }

    public async updateExam(id: string, dto: Partial<Exam>): Promise<Exam> {
        return this.examRepository.update(id, dto);
    }

    public async deleteExam(id: string): Promise<void> {
        return this.examRepository.delete(id);
    }

    public async listExams(): Promise<Exam[]> {
        return this.examRepository.findAll();
    }

    public async getExamResults(examId: string): Promise<Attempt[]> {
        return this.examRepository.findResultsByExamId(examId);
    }
}