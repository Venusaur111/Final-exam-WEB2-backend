import { UserRepository } from '../Repository/userrepo.js';
import { User} from '../models/userModel.js';
import {CreateUserDto} from '../models/dto/createDtoTypes.js';
export class AdminUserService {
    private userRepository: UserRepository;

    constructor(userRepository: UserRepository) {
        this.userRepository = userRepository;
    }
        public async getStudentById(id: string): Promise<User | null> {
        return this.userRepository.findById(id);
    }
}