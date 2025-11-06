// This the "safe" User object to be sent to be received to Clients -- no password field
export interface User {
    id: string;
    username: string | null;
    email: string;
    createdAt: Date;
    updatedAt: Date;
}

// Data shape for the /auth/register endpoint body
export type RegisterData = {
    email: string;
    password: string;
    username?: string;
};

// Data shape for the /auth/login endpoint body
export type LoginData = {
    email: string;
    password: string;
};

// The response from a successful login
export interface LoginResponse {
    user: User;
    token: string;
}
