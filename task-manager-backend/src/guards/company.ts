import { db } from '@/database/connection';
import { logger } from '@/utils/logger';
import { NextFunction, Request, Response } from 'express';
import { AuthError, AuthRequest } from '../types';

/**
 * Guard para verificar que el usuario pertenece a la compañía del request
 * Se usa para endpoints multi-tenant
 */
export const CompanyGuard = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const authReq = req as AuthRequest;

        if (!authReq.user || !authReq.company) {
            throw new AuthError('Usuario no autenticado', 'NOT_AUTHENTICATED', 401);
        }

        // Verificar que el usuario todavía pertenece a la compañía
        const userResult = await db.query(
            `SELECT 1 FROM users 
       WHERE id = $1 AND company_id = $2 AND deleted_at IS NULL AND is_active = true`,
            [authReq.user.id, authReq.company.id]
        );

        if (userResult.length === 0) {
            throw new AuthError(
                'Usuario no pertenece a esta compañía o la cuenta está desactivada',
                'USER_NOT_IN_COMPANY',
                403
            );
        }

        // Verificar que la compañía todavía existe y está activa
        const companyResult = await db.query(
            `SELECT 1 FROM companies 
       WHERE id = $1 AND deleted_at IS NULL`,
            [authReq.company.id]
        );

        if (companyResult.length === 0) {
            throw new AuthError(
                'Compañía no encontrada o eliminada',
                'COMPANY_NOT_FOUND',
                404
            );
        }

        return next();
    } catch (error) {
        if (error instanceof AuthError) {
            logger.warn('CompanyGuard error:', {
                error: error.message,
                code: error.code,
                path: req.path
            });

            return res.status(error.statusCode).apiError(error.message, error.statusCode, {
                code: error.code
            });
        }

        logger.error('Error inesperado en CompanyGuard:', error);
        return res.status(500).apiError('Error interno de verificación de compañía');
    }
};

/**
 * Guard para verificar que el usuario tiene acceso a un workspace específico
 */
export const WorkspaceAccessGuard = (workspaceParam: string = 'workspaceId') => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authReq = req as AuthRequest;

            if (!authReq.user || !authReq.company) {
                throw new AuthError('Usuario no autenticado', 'NOT_AUTHENTICATED', 401);
            }

            const workspaceId = req.params[workspaceParam] || req.body.workspaceId;
            if (!workspaceId) {
                return next(); // No hay workspace específico, asumir que pasa CompanyGuard
            }

            // Verificar que el workspace pertenece a la compañía
            const workspaceResult = await db.query(
                `SELECT 1 FROM workspaces 
         WHERE id = $1 AND company_id = $2 AND deleted_at IS NULL`,
                [workspaceId, authReq.company.id]
            );

            if (workspaceResult.length === 0) {
                throw new AuthError(
                    'Workspace no encontrado o no pertenece a esta compañía',
                    'WORKSPACE_NOT_FOUND',
                    404
                );
            }

            // Verificar que el usuario es miembro del workspace
            // Owners y admins tienen acceso a todos los workspaces
            if (!['owner', 'admin'].includes(authReq.user.role)) {
                const memberResult = await db.query(
                    `SELECT 1 FROM workspace_members 
           WHERE workspace_id = $1 AND user_id = $2 AND company_id = $3`,
                    [workspaceId, authReq.user.id, authReq.company.id]
                );

                if (memberResult.length === 0) {
                    throw new AuthError(
                        'No tienes acceso a este workspace',
                        'NO_WORKSPACE_ACCESS',
                        403
                    );
                }
            }

            next();
        } catch (error) {
            if (error instanceof AuthError) {
                logger.warn('WorkspaceAccessGuard error:', {
                    error: error.message,
                    code: error.code,
                    workspaceId: req.params[workspaceParam],
                    userId: (req as AuthRequest).user?.id
                });

                return res.status(error.statusCode).apiError(error.message, error.statusCode, {
                    code: error.code
                });
            }

            logger.error('Error inesperado en WorkspaceAccessGuard:', error);
            res.status(500).apiError('Error interno de verificación de workspace');
        }
    };
};

/**
 * Guard para aplicar Row Level Security en queries
 * Inyecta company_id en todas las queries
 */
export const applyRowLevelSecurity = (
    req: Request,
    _: Response,
    next: NextFunction
) => {
    const authReq = req as AuthRequest;

    if (authReq.company) {
        // Inyectar company_id en el request para que los servicios lo usen
        req.query.companyId = authReq.company.id;
        req.body.companyId = authReq.company.id;

        // Para parámetros de ruta que necesiten company_id
        if (req.params.id && !req.params.companyId) {
            req.params.companyId = authReq.company.id;
        }
    }

    next();
};

/**
 * Guard para validar slugs de compañía en rutas
 */
export const validateCompanySlug = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const companySlug = req.params.companySlug;

    if (!companySlug || typeof companySlug !== 'string') {
        return res.status(400).apiError(
            'Slug de compañía requerido',
            400,
            { code: 'MISSING_COMPANY_SLUG' }
        );
    }

    // Validar formato del slug
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(companySlug)) {
        return res.status(400).apiError(
            'Slug de compañía inválido. Solo letras minúsculas, números y guiones',
            400,
            { code: 'INVALID_COMPANY_SLUG' }
        );
    }

    return next();
};