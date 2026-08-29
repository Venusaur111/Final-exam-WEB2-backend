import bcrypt from "bcrypt";
import { UserRepository } from "../../Repository/admin/adminUserRepositories.js";
function toPublicUser(user) {
    const { passwordHash: _passwordHash, ...rest } = user;
    return rest;
}
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
        return toPublicUser(student);
    }
    async getAllStudents() {
        const students = await this.userRepo.findAllStudents();
        return students.map(toPublicUser);
    }
    async createStudent(data) {
        if (!data.name || !data.email || !data.password) {
            throw new Error("Le nom, l'email et le mot de passe sont requis.");
        }
        const existing = await this.userRepo.findByEmail(data.email);
        if (existing) {
            const error = new Error("Un utilisateur avec cet email existe déjà.");
            error.status = 409;
            throw error;
        }
        const passwordHash = await bcrypt.hash(data.password, this.SALT_ROUNDS);
        const created = await this.userRepo.createStudent({
            name: data.name,
            email: data.email,
            passwordHash,
        });
        return toPublicUser(created);
    }
    async updateStudent(id, data) {
        await this.getStudentById(id);
        if (data.email) {
            const existing = await this.userRepo.findByEmail(data.email);
            if (existing && existing.id !== id) {
                const error = new Error("Cet email est déjà utilisé par un autre compte.");
                error.status = 409;
                throw error;
            }
        }
        const updated = await this.userRepo.updateStudent(id, {
            name: data.name,
            email: data.email,
        });
        if (!updated)
            throw new Error("Échec de la mise à jour.");
        if (data.password) {
            await this.updatePassword(id, data.password);
        }
        return this.getStudentById(id);
    }
    async updatePassword(id, newPassword) {
        await this.getStudentById(id);
        const passwordHash = await bcrypt.hash(newPassword, this.SALT_ROUNDS);
        await this.userRepo.updatePassword(id, passwordHash);
    }
    async deactivateStudent(id) {
        await this.getStudentById(id);
        await this.userRepo.deactivate(id);
    }
}
