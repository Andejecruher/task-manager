import { Request } from 'express';

// ====================
// PAYLOADS DE TOKENS
// ====================

export interface JwtPayload {
    userId: string;
    companyId: string;
    sessionId: string;
    role: string;
    email: string;
    iat?: number;
    exp?: number;
}

export interface RefreshTokenPayload {
    sessionId: string;
    userId: string;
    companyId: string;
}

// ====================
// DATOS DE USUARIO AUTENTICADO
// ====================

export interface AuthUser {
    id: string;
    email: string;
    companyId: string;
    role: string;
    fullName?: string;
    permissions: string[];
    sessionId: string;
    isActive: boolean;
    emailVerified: boolean;
}

export interface CompanyContext {
    id: string;
    slug: string;
    name: string;
    plan: string;
    features: Record<string, any>;
}

// ====================
// REQUEST EXTENDIDA
// ====================

export interface AuthRequest extends Request {
    user: AuthUser;
    company: CompanyContext;
    sessionId: string;
}

// ====================
// RESPONSES Y DTOs
// ====================

export interface LoginResponse {
    user: {
        id: string;
        email: string;
        fullName?: string;
        role: string;
        companyId: string;
        emailVerified: boolean;
        avatarUrl?: string;
    };
    tokens: {
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
        refreshExpiresIn: number;
    };
    company: {
        id: string;
        name: string;
        slug: string;
        plan: string;
    };
}

export interface RegisterDTO {
    email: string;
    password: string;
    fullName: string;
    companyName: string;
    companySlug: string;
}

export interface LoginDTO {
    email: string;
    password: string;
    companySlug: string;
}

export interface ResetPasswordDTO {
    token: string;
    newPassword: string;
}

export interface ChangePasswordDTO {
    currentPassword: string;
    newPassword: string;
}

export interface UpdateProfileDTO {
    fullName?: string;
    avatarUrl?: string;
    timezone?: string;
    locale?: string;
}

// ====================
// SESIONES Y DISPOSITIVOS
// ====================

export interface SessionInfo {
    id: string;
    deviceInfo: {
        browser?: string;
        os?: string;
        device?: string;
        ip?: string;
        userAgent?: string;
    };
    lastActivityAt: Date;
    createdAt: Date;
    isCurrent: boolean;
}

export interface DeviceInfo {
    browser?: string;
    os?: string;
    device?: string;
    ip?: string;
    userAgent?: string;
}

// ====================
// ERRORS ESPECÍFICOS
// ====================

export class AuthError extends Error {
    constructor(
        message: string,
        public code: string,
        public statusCode: number = 401
    ) {
        super(message);
        this.name = 'AuthError';
    }
}

export class ValidationError extends AuthError {
    constructor(message: string) {
        super(message, 'VALIDATION_ERROR', 400);
    }
}

export class NotFoundError extends AuthError {
    constructor(resource: string) {
        super(`${resource} no encontrado`, 'NOT_FOUND', 404);
    }
}

export class UnauthorizedError extends AuthError {
    constructor(message: string = 'No autorizado') {
        super(message, 'UNAUTHORIZED', 401);
    }
}

export class ForbiddenError extends AuthError {
    constructor(message: string = 'Acceso prohibido') {
        super(message, 'FORBIDDEN', 403);
    }
}

export class ConflictError extends AuthError {
    constructor(message: string) {
        super(message, 'CONFLICT', 409);
    }
}

// ====================
// ENUMS Y CONSTANTES
// ====================

export enum UserRole {
    OWNER = 'owner',
    ADMIN = 'admin',
    MANAGER = 'manager',
    MEMBER = 'member',
    VIEWER = 'viewer'
}

export enum TokenType {
    ACCESS = 'access',
    REFRESH = 'refresh',
    RESET_PASSWORD = 'reset_password',
    VERIFY_EMAIL = 'verify_email'
}

export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const COMPANY_SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;