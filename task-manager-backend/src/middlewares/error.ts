import { NextFunction, Request, Response } from 'express';
import { logger } from '../utils/logger';

export class AppError extends Error {
    constructor(
        public message: string,
        public statusCode: number = 500,
        public isOperational: boolean = true
    ) {
        super(message);
        this.name = 'AppError';

        Error.captureStackTrace(this, this.constructor);
    }
}

export class ValidationError extends AppError {
    constructor(public errors: any[]) {
        super('Validation Error', 400);
        this.name = 'ValidationError';
    }
}

export class NotFoundError extends AppError {
    constructor(resource: string) {
        super(`${resource} no encontrado`, 404);
        this.name = 'NotFoundError';
    }
}

export class UnauthorizedError extends AppError {
    constructor(message: string = 'No autorizado') {
        super(message, 401);
        this.name = 'UnauthorizedError';
    }
}

export class ForbiddenError extends AppError {
    constructor(message: string = 'Acceso prohibido') {
        super(message, 403);
        this.name = 'ForbiddenError';
    }
}

export const errorHandler = (
    error: Error | AppError,
    req: Request,
    res: Response,
    _: NextFunction
) => {
    // Log error
    logger.error('🚨 Error no manejado:', {
        error: error.message,
        stack: error.stack,
        requestId: req.requestId,
        path: req.path,
        method: req.method,
        userId: (req as any).user?.id,
    });

    // Default error response
    let statusCode = 500;
    let message = 'Error interno del servidor';
    let isOperational = false;
    let details: any = null;

    // Handle custom AppError
    if (error instanceof AppError) {
        statusCode = error.statusCode;
        message = error.message;
        isOperational = error.isOperational;

        if (error instanceof ValidationError) {
            details = { errors: (error as ValidationError).errors };
        }
    }

    // Handle specific errors
    if (error.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Token inválido';
        isOperational = true;
    }

    if (error.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expirado';
        isOperational = true;
    }

    // Send response
    if (isOperational) {
        res.status(statusCode).apiError(message, statusCode, details);
    } else {
        // Don't leak error details in production for non-operational errors
        if (process.env.NODE_ENV === 'production') {
            res.status(500).apiError('Error interno del servidor');
        } else {
            res.status(statusCode).apiError(message, statusCode, {
                stack: error.stack,
                ...details,
            });
        }
    }
};