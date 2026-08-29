export class AdminUserService {
    userRepository;
    constructor(userRepository) {
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
    async updateStudentFirstName(id, firstName) {
        return this.userRepository.updateField(id, 'first_name', firstName);
    }
    async updateStudentLastName(id, lastName) {
        return this.userRepository.updateField(id, 'last_name', lastName);
    }
    async updateStudentNumber(id, userNumber) {
        return this.userRepository.updateField(id, 'user_number', userNumber);
    }
}
