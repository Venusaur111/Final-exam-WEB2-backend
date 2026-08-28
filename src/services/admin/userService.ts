// userService.ts
import bcrypt from "bcrypt";
import { UserRepository } from "../../Repository/admin/adminUserRepositories.js";
import { User, CreateStudentInput, UpdateStudentInput } from "../../models/userModel.js";

export class UserService {
    private userRepo: UserRepository;
    private readonly SALT_ROUNDS = 10;

    constructor() {
        this.userRepo = new UserRepository();
    }

    async getStudentById(id: string): Promise<User> {
        const student = await this.userRepo.findById(id);
        if (!student) {
            throw new Error("Student not found.");
        }
        return student;
    }

    async getAllStudents(): Promise<readonly User[]> {
        return this.userRepo.findAllStudents();
    }

    async createStudent(data: Omit<CreateStudentInput, "passwordHash"> & { password: string }): Promise<User> {
        const existingUser = await this.userRepo.findByEmail(data.email);
        if (existingUser) {
            throw new Error("User already exists.");
        }

        const passwordHash = await bcrypt.hash(data.password, this.SALT_ROUNDS);

        return this.userRepo.createStudent({
            name: data.name,
            email: data.email,
            passwordHash,
        });
    }

    async updateStudent(id: string, data: UpdateStudentInput): Promise<User> {
        await this.getStudentById(id);

        if (data.email) {
            const existing = await this.userRepo.findByEmail(data.email);
            if (existing && existing.id !== id) {
                throw new Error("This email is already used by another account.");
            }
        }

        const updated = await this.userRepo.updateStudent(id, data);
        if (!updated) throw new Error("Failed to update.");
        return updated;
    }

    async updatePassword(id: string, newPassword: string): Promise<void> {
        await this.getStudentById(id);
        const passwordHash = await bcrypt.hash(newPassword, this.SALT_ROUNDS);
        await this.userRepo.updatePassword(id, passwordHash);
    }

    // RG-10: Logical deactivation instead of physical deletion
    async deactivateStudent(id: string): Promise<void> {
        await this.getStudentById(id);
        await this.userRepo.deactivate(id);
    }
}