export interface AdminUserResponseDto {
    id: string; // UUID
    userNumber: number; // Serial
    email: string;
    password: string; // Visible/Managed by admin
    firstName: string;
    lastName: string;
    status: string;
    role: string;
    createdAt: string;
}