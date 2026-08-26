export class AdminCourseService {
    courseRepository;
    constructor(courseRepository) {
        this.courseRepository = courseRepository;
    }
    async createCourse(dto) {
        return this.courseRepository.insert(dto);
    }
    async updateCourse(id, dto) {
        return this.courseRepository.update(id, dto);
    }
    async deleteCourse(id) {
        return this.courseRepository.delete(id);
    }
    async listCourses() {
        return this.courseRepository.findAll();
    }
    async findCourseById(id) {
        return this.courseRepository.findById(id);
    }
}
