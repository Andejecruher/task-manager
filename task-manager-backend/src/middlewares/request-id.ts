import { NextFunction, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

export const requestId = (req: Request, res: Response, next: NextFunction) => {
    const requestId = req.headers['x-request-id'] as string || uuidv4();

    // Añadir al request
    req.requestId = requestId;

    // Añadir a la respuesta
    res.setHeader('X-Request-ID', requestId);

    next();
};

// Extender tipo de Request
declare global {
    namespace Express {
        interface Request {
            requestId: string;
        }
    }
}