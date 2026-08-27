import { CourseRepository } from '../../repository/admin/adminCourseRepository.js';
import { Course } from '../../models/courseModel.js';
import { CreateCourseDto } from '../../models/dto/createDtoTypes.js'

export class AdminCourseService {
    private courseRepository: CourseRepository;

    constructor(courseRepository: CourseRepository) {
        this.courseRepository = courseRepository;
    }

    public async createCourse(dto: CreateCourseDto): Promise<Course> {
        return this.courseRepository.insert(dto);
    }

    public async updateCourse(id: string, dto: Partial<Course>): Promise<Course> {
        return this.courseRepository.update(id, dto);
    }

    public async deleteCourse(id: string): Promise<void> {
        return this.courseRepository.delete(id);
    }

    public async listCourses(): Promise<Course[]> {
        return this.courseRepository.findAll();
    }

    public async findCourseById(id: string): Promise<Course | null> {
        return this.courseRepository.findById(id);
    }
}