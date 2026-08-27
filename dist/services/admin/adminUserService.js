import { UserRepository } from '../../repository/admin/adminUserRepository.js';
export class AdminUserService {
    userRepository;
    constructor(userRepository = new UserRepository()) {
        this.userRepository = userRepository;
    }
    async registerStudent(dto) {
        return this.userRepository.insertStudent(dto);
    }
    async updateStudent(id, dto) {
        return this.userRepository.update(id, dto);
    }
    async deactivateStudent(id) {
        return this.userRepository.updateStatus(id, 'DEACTIVATED');
    }
    async changePassword(id, newPassword) {
        return this.userRepository.updatePassword(id, newPassword);
    }
    async listStudents() {
        return this.userRepository.findAllStudents();
    }
    async getStudentById(id) {
        return this.userRepository.findStudentById(id);
    }
}
