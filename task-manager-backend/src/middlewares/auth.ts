import { NextFunction, Request, Response } from 'express';




/**
 * Middleware para obtener device info del request
 */
export const extractDeviceInfo = (
    req: Request,
    _: Response,
    next: NextFunction
) => {
    const deviceInfo = {
        browser: req.headers['user-agent'] || 'unknown',
        os: getOSFromUserAgent(req.headers['user-agent'] as string),
        device: getDeviceFromUserAgent(req.headers['user-agent'] as string),
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent']
    };

    (req as any).deviceInfo = deviceInfo;
    next();
};

// ====================
// FUNCIONES AUXILIARES
// ====================

function getOSFromUserAgent(userAgent: string): string {
    if (!userAgent) return 'unknown';

    if (/windows/i.test(userAgent)) return 'Windows';
    if (/macintosh|mac os x/i.test(userAgent)) return 'macOS';
    if (/linux/i.test(userAgent)) return 'Linux';
    if (/android/i.test(userAgent)) return 'Android';
    if (/ios|iphone|ipad|ipod/i.test(userAgent)) return 'iOS';

    return 'unknown';
}

function getDeviceFromUserAgent(userAgent: string): string {
    if (!userAgent) return 'unknown';

    if (/mobile/i.test(userAgent)) return 'Mobile';
    if (/tablet/i.test(userAgent)) return 'Tablet';

    return 'Desktop';
}