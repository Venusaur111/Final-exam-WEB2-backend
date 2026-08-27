export interface User {
    id: string; // UUID
    userNumber: number; // Serial number of the user
    email: string;
    password: string;
    firstName?: string;
    name: string;
    status: string;
    role: string;
    createdAt: string; // Format: Year-Month-Day Hour:Minute
}