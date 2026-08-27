import { UserRepository } from '../../repository/admin/adminUserRepository.js';
import { User } from '../../models/userModel.js';
import { CreateUserDto } from '../../models/dto/createDtoTypes.js';

export class AdminUserService {
    private userRepository: UserRepository;

    constructor(userRepository: UserRepository = new UserRepository()) {
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
}