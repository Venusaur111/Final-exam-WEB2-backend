export class AdminExamService {
    examRepository;
    constructor(examRepository) {
        this.examRepository = examRepository;
    }
    async createExam(dto) {
        return this.examRepository.insert(dto);
    }
    async updateExam(id, dto) {
        return this.examRepository.update(id, dto);
    }
    async deleteExam(id) {
        return this.examRepository.delete(id);
    }
    async listExams() {
        return this.examRepository.findAll();
    }
    async getExamResults(examId) {
        return this.examRepository.findResultsByExamId(examId);
    }
}
