import { UserRepository } from '../../Repository/admin/adminUserRepositories.js';
import { User} from '../../models/userModel.js';
export class AdminUserService {
    private userRepository: UserRepository;

    constructor(userRepository: UserRepository) {
        this.userRepository = userRepository;
    }
        public async getStudentById(id: string): Promise<User | null> {
        return this.userRepository.findById(id);
    }
}