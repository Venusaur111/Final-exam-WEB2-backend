export class AdminUserService {
    userRepository;
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async getStudentById(id) {
        return this.userRepository.findById(id);
    }
}
