export type Role = "admin" | "student";
 
export interface User {
    id: string;
    name: string;
    email: string;
    passwordHash: string;
    role: Role;
    isActive: boolean;
    createdAt: Date;
}
 
// Sous-type pratique pour les réponses API (RG-06/RG-07 : jamais le passwordHash exposé)
export type PublicUser = Omit<User, "passwordHash">;
 
export interface CreateStudentInput {
    name: string;
    email: string;
    passwordHash: string; // déjà hashé en amont par le Service (bcrypt)
}

export interface UpdateStudentInput {
    name?: string;
    email?: string;
    isActive?: boolean;
}
 