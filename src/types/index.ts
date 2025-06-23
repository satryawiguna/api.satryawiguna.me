import { User, Role, Permission } from "@prisma/client";

// User types
export type UserWithRoles = User & {
  userRoles: Array<{
    role: Role;
  }>;
};

// Request types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
}

// Response types
export interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  accessToken: string;
  refreshToken: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

// JWT Payload
export interface JwtPayload {
  userId: string;
  email: string;
  roles: string[];
  permissions: string[];
  iat?: number;
  exp?: number;
}

// Request with authenticated user
export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

// Custom error type
export interface AppError extends Error {
  statusCode: number;
  isOperational?: boolean;
}

// Role with permissions
export type RoleWithPermissions = Role & {
  rolePermissions: Array<{
    permission: Permission;
  }>;
};
