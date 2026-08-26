export interface User {
    id: string; // UUID
    usernumber: number; // Serial
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    userNumber: string;
    status: string;
    role: string;
    createdAt: string; // Format: Year-Month-Day Hour:Minute
}