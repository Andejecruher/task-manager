import { db } from '@/database/connection';
import { type AuthRequest, AuthError, UserRole } from '@/types';
import { logger } from '@/utils/logger';
import { type NextFunction, type Request, type Response } from 'express';

/**
 * Factory function para crear guard de roles
 * @param allowedRoles Array de roles permitidos
 * @param requireAll Si true, requiere todos los roles, si false requiere al menos uno
 */
export function RolesGuard(allowedRoles: UserRole[], requireAll = false) {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            const authReq = req as AuthRequest;

            if (!authReq.user) {
                throw new AuthError('Usuario no autenticado', 'NOT_AUTHENTICATED', 401);
            }

            const userRole = authReq.user.role;

            // Verificar permisos
            let hasPermission: boolean;

            if (requireAll) {
                // Requiere todos los roles especificados
                hasPermission = allowedRoles.every(role =>
                    hasRoleWithHierarchy(userRole, role)
                );
            } else {
                // Requiere al menos uno de los roles
                hasPermission = allowedRoles.some(role =>
                    hasRoleWithHierarchy(userRole, role)
                );
            }

            if (!hasPermission) {
                logger.warn('Acceso denegado por roles insuficientes', {
                    userId: authReq.user.id,
                    userRole,
                    allowedRoles,
                    path: req.path,
                    method: req.method
                });

                throw new AuthError(
                    'No tienes permisos suficientes para realizar esta acción',
                    'INSUFFICIENT_PERMISSIONS',
                    403
                );
            }

            next();
            return;
        } catch (error) {
            if (error instanceof AuthError) {
                res.status(error.statusCode).apiError(error.message, error.statusCode, {
                    code: error.code
                });
                return;
            }

            logger.error('Error en RolesGuard:', error);
            res.status(500).apiError('Error interno de autorización');
            return;
        }
    };
}

/**
 * Guard para requerir rol específico o superior (jerarquía)
 */
export function MinRoleGuard(minRole: UserRole) {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            const authReq = req as AuthRequest;

            if (!authReq.user) {
                throw new AuthError('Usuario no autenticado', 'NOT_AUTHENTICATED', 401);
            }

            const userRole = authReq.user.role;
            const userRoleLevel = getRoleLevel(userRole);
            const minRoleLevel = getRoleLevel(minRole);

            if (userRoleLevel < minRoleLevel) {
                logger.warn('Acceso denegado por rol mínimo no alcanzado', {
                    userId: authReq.user.id,
                    userRole,
                    minRole,
                    path: req.path,
                    method: req.method
                });

                throw new AuthError(
                    `Se requiere rol ${minRole} o superior`,
                    'INSUFFICIENT_ROLE',
                    403
                );
            }

            next();
        } catch (error) {
            if (error instanceof AuthError) {
                res.status(error.statusCode).apiError(error.message, error.statusCode, {
                    code: error.code
                });
                return;
            }

            logger.error('Error en MinRoleGuard:', error);
            res.status(500).apiError('Error interno de autorización');
            return;
        }
    };
}

/**
 * Guard para verificar permisos específicos (ABAC)
 */
export function PermissionsGuard(requiredPermissions: string[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            const authReq = req as AuthRequest;

            if (!authReq.user) {
                throw new AuthError('Usuario no autenticado', 'NOT_AUTHENTICATED', 401);
            }

            const userPermissions = authReq.user.permissions || [];

            // Verificar si el usuario tiene todos los permisos requeridos
            const hasAllPermissions = requiredPermissions.every(permission =>
                userPermissions.includes(permission)
            );

            if (!hasAllPermissions) {
                const missingPermissions = requiredPermissions.filter(
                    permission => !userPermissions.includes(permission)
                );

                logger.warn('Acceso denegado por permisos insuficientes', {
                    userId: authReq.user.id,
                    userPermissions,
                    requiredPermissions,
                    missingPermissions,
                    path: req.path,
                    method: req.method
                });

                throw new AuthError(
                    `No tienes permisos suficientes para realizar esta acción. Permisos faltantes: ${missingPermissions.join(', ')}`,
                    'MISSING_PERMISSIONS',
                    403,
                );
            }

            next();
        } catch (error) {
            if (error instanceof AuthError) {
                res.status(error.statusCode).apiError(error.message, error.statusCode, {
                    code: error.code
                });
                return;
            }

            logger.error('Error en PermissionsGuard:', error);
            res.status(500).apiError('Error interno de autorización');
            return;
        }
    };
}

/**
 * Guard para verificar propiedad del recurso
 * Útil para endpoints donde el usuario solo puede acceder a sus propios recursos
 */
export function OwnershipGuard(resourceOwnerField = 'user_id') {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const authReq = req as AuthRequest;

            if (!authReq.user) {
                throw new AuthError('Usuario no autenticado', 'NOT_AUTHENTICATED', 401);
            }

            // Si es owner, admin o manager, permitir acceso
            const userRole = authReq.user.role;
            if ([UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER].includes(userRole)) {
                return next();
            }

            // Para miembros y viewers, verificar propiedad
            const bodyId = getRequestBodyId(req.body);
            const resourceIdRaw = req.params?.id ?? bodyId;
            const resourceId = resourceIdRaw ? String(resourceIdRaw) : '';
            if (!resourceId) {
                return next(); // Sin ID específico, asumir que pasa el filtro por compañía
            }

            // Obtener el recurso y verificar propiedad
            // Construir query dinámica basada en el campo especificado
            const table = getTableFromRoute(req.path);
            if (!table) {
                return next(); // No se pudo determinar la tabla
            }

            const result = await db.query<Record<string, unknown>>(
                `SELECT ${resourceOwnerField} FROM ${table} 
         WHERE id = $1 AND company_id = $2 AND deleted_at IS NULL`,
                [resourceId, authReq.company.id]
            );

            if (result.length === 0) {
                throw new AuthError('Recurso no encontrado', 'RESOURCE_NOT_FOUND', 404);
            }

            const resourceOwnerId = result[0][resourceOwnerField];

            if (resourceOwnerId !== authReq.user.id) {
                logger.warn('Acceso denegado por falta de propiedad', {
                    userId: authReq.user.id,
                    resourceId,
                    resourceOwnerId,
                    table,
                    path: req.path
                });

                throw new AuthError(
                    'No tienes permisos para acceder a este recurso',
                    'NOT_OWNER',
                    403
                );
            }

            next();
        } catch (error) {
            if (error instanceof AuthError) {
                res.status(error.statusCode).apiError(error.message, error.statusCode, {
                    code: error.code
                });
                return;
            }

            logger.error('Error en OwnershipGuard:', error);
            res.status(500).apiError('Error interno de autorización');
            return;
        }
    };
}

// ====================
// FUNCIONES AUXILIARES
// ====================

/**
 * Jerarquía de roles (de mayor a menor privilegio)
 */
const ROLE_HIERARCHY: Record<UserRole, number> = {
    [UserRole.OWNER]: 100,
    [UserRole.ADMIN]: 80,
    [UserRole.MANAGER]: 60,
    [UserRole.MEMBER]: 40,
    [UserRole.VIEWER]: 20
};

function getRoleLevel(role: UserRole): number {
    return ROLE_HIERARCHY[role] || 0;
}

function hasRoleWithHierarchy(userRole: UserRole, requiredRole: UserRole): boolean {
    // Si el usuario tiene un rol superior en la jerarquía, también tiene acceso
    return getRoleLevel(userRole) >= getRoleLevel(requiredRole);
}

function getRequestBodyId(body: unknown): string | number | null {
    if (typeof body !== 'object' || body === null || !('id' in body)) {
        return null;
    }

    const bodyId = (body as { id?: unknown }).id;
    if (typeof bodyId === 'string' || typeof bodyId === 'number') {
        return bodyId;
    }

    return null;
}

function getTableFromRoute(path: string): string | null {
    // Mapear rutas a tablas
    const routeToTable: Record<string, string> = {
        'tasks': 'tasks',
        'users': 'users',
        'workspaces': 'workspaces',
        'boards': 'boards',
        'companies': 'companies'
    };

    for (const [route, table] of Object.entries(routeToTable)) {
        if (path.includes(`/${route}/`)) {
            return table;
        }
    }

    return null;
}