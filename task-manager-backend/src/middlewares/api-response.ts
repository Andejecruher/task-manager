import { NextFunction, Request, Response } from 'express';

interface ApiResponse {
    success: boolean;
    data?: any;
    error?: string;
    message?: string;
    meta?: {
        timestamp: string;
        requestId: string;
        [key: string]: any;
    };
}

export const apiResponse = (req: Request, res: Response, next: NextFunction) => {
    // Success response method
    res.apiSuccess = (data: any, message?: string, statusCode: number = 200) => {
        const response: ApiResponse = {
            success: true,
            data,
            message,
            meta: {
                timestamp: new Date().toISOString(),
                requestId: req.requestId || '',
            },
        };

        return res.status(statusCode).json(response);
    };

    // Error response method
    res.apiError = (error: string, statusCode: number = 500, details?: any) => {
        const response: ApiResponse = {
            success: false,
            error,
            message: error,
            meta: {
                timestamp: new Date().toISOString(),
                requestId: req.requestId || '',
                details,
            },
        };

        return res.status(statusCode).json(response);
    };

    // Validation error response
    res.apiValidationError = (errors: any[]) => {
        const response: ApiResponse = {
            success: false,
            error: 'Validation Error',
            message: 'Los datos proporcionados son inválidos',
            data: { errors },
            meta: {
                timestamp: new Date().toISOString(),
                requestId: req.requestId || '',
            },
        };

        return res.status(400).json(response);
    };

    next();
};

// Extender tipo de Response
declare global {
    namespace Express {
        interface Response {
            apiSuccess: (data: any, message?: string, statusCode?: number) => Response;
            apiError: (error: string, statusCode?: number, details?: any) => Response;
            apiValidationError: (errors: any[]) => Response;
        }
    }
}