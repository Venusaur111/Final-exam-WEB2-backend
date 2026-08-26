import { UserRepository } from '../../repository/userRepository.js';
import { User, CreateUserDto } from '../../models/userModel.js';

export class AdminUserService {
    private userRepository: UserRepository;

    constructor(userRepository: UserRepository) {
        this.userRepository = userRepository;
    }

    public async registerStudent(dto: CreateUserDto): Promise<User> {
        return this.userRepository.insertStudent(dto);
    }

    public async updateStudent(id: string, dto: Partial<User>): Promise<User> {
        return this.userRepository.update(id, dto);
    }

    public async deactivateStudent(id: string): Promise<User> {
        return this.userRepository.updateStatus(id, 'DEACTIVATED');
    }

    public async changePassword(id: string, newPassword: string): Promise<void> {
        return this.userRepository.updatePassword(id, newPassword);
    }

    public async listStudents(): Promise<User[]> {
        return this.userRepository.findAllStudents();
    }

    public async getStudentById(id: string): Promise<User | null> {
        return this.userRepository.findStudentById(id);
    }

    public async updateStudentFirstName(id: string, firstName: string): Promise<User> {
        return this.userRepository.updateField(id, 'first_name', firstName);
    }

    public async updateStudentLastName(id: string, lastName: string): Promise<User> {
        return this.userRepository.updateField(id, 'last_name', lastName);
    }

    public async updateStudentNumber(id: string, userNumber: number): Promise<User> {
        return this.userRepository.updateField(id, 'user_number', userNumber);
    }
}