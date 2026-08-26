export interface User {
    id: string; // UUID
    userNumber: number; // Serial
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    status: string;
    role: string;
    createdAt: string; // Format: Year-Month-Day Hour:Minute
}