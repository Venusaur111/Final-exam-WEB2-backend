export class StudentExamService {
    examRepository;
    constructor(examRepository) {
        this.examRepository = examRepository;
    }
    async findAvailableExams() {
        return this.examRepository.findAvailable();
    }
    async getExamById(id) {
        return this.examRepository.findById(id);
    }
}
