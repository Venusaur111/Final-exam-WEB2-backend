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
            throw new Error("Étudiant non trouvé.");
        }
        return student;
    }

    async getAllStudents(): Promise<User[]> {
        return this.userRepo.findAllStudents();
    }

    async createStudent(data: Omit<CreateStudentInput, "passwordHash"> & { password: string }): Promise<User> {
        // Validation unicité email
        const existing = await this.userRepo.findByEmail(data.email);
        if (existing) {
            throw new Error("Un utilisateur avec cet email existe déjà.");
        }

        // Hachage du mot de passe (séparation des responsabilités du repo)
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
                throw new Error("Cet email est déjà utilisé par un autre compte.");
            }
        }

        const updated = await this.userRepo.updateStudent(id, data);
        if (!updated) throw new Error("Échec de la mise à jour.");
        return updated;
    }

    async updatePassword(id: string, newPassword: string): Promise<void> {
        await this.getStudentById(id);
        const passwordHash = await bcrypt.hash(newPassword, this.SALT_ROUNDS);
        await this.userRepo.updatePassword(id, passwordHash);
    }

    // RG-10 : Désactivation logique au lieu de la suppression physique
    async deactivateStudent(id: string): Promise<void> {
        await this.getStudentById(id);
        await this.userRepo.deactivate(id);
    }
}