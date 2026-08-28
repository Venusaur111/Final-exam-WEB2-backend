import bcrypt from "bcrypt";
import { UserRepository } from "../../Repository/admin/adminUserRepositories.js";
export class UserService {
    userRepo;
    SALT_ROUNDS = 10;
    constructor() {
        this.userRepo = new UserRepository();
    }
    async getStudentById(id) {
        const student = await this.userRepo.findById(id);
        if (!student) {
            throw new Error("Étudiant non trouvé.");
        }
        return student;
    }
    async getAllStudents() {
        return this.userRepo.findAllStudents();
    }
    async createStudent(data) {
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
    async updateStudent(id, data) {
        await this.getStudentById(id);
        if (data.email) {
            const existing = await this.userRepo.findByEmail(data.email);
            if (existing && existing.id !== id) {
                throw new Error("Cet email est déjà utilisé par un autre compte.");
            }
        }
        const updated = await this.userRepo.updateStudent(id, data);
        if (!updated)
            throw new Error("Échec de la mise à jour.");
        return updated;
    }
    async updatePassword(id, newPassword) {
        await this.getStudentById(id);
        const passwordHash = await bcrypt.hash(newPassword, this.SALT_ROUNDS);
        await this.userRepo.updatePassword(id, passwordHash);
    }
    // RG-10 : Désactivation logique au lieu de la suppression physique
    async deactivateStudent(id) {
        await this.getStudentById(id);
        await this.userRepo.deactivate(id);
    }
}
