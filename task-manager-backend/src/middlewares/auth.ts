import { Company } from "@/database/models/Company";
import { User } from "@/database/models/User";
import { sessionService } from "@/services/session";
import { tokenService } from "@/services/token";
import type {
  AuthRequest,
  AuthUser,
  CompanyContext,
  DeviceInfo,
  JwtPayload,
} from "@/types";
import { AuthError } from "@/types";
import { logger } from "@/utils/logger";
import type { NextFunction, Request, Response } from "express";
/**
 * Middleware de autenticación principal
 * Extrae y valida el token JWT del header Authorization
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // 1. Extraer token del header
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      throw new AuthError("Token no proporcionado", "MISSING_TOKEN", 401);
    }

    const token = authHeader.substring(7); // Remove 'Bearer '

    // 2. Verificar token
    const payload = tokenService.verifyAccessToken(token);

    // 3. Verificar que la sesión esté activa
    const isSessionActive = await sessionService.isSessionActive(
      payload.sessionId,
    );
    if (!isSessionActive) {
      throw new AuthError("Sesión expirada", "SESSION_EXPIRED", 401);
    }

    // 4. Verificar que el usuario exista y esté activo
    const user = await getUserFromPayload(payload);
    if (!user) {
      throw new AuthError("Usuario no encontrado", "USER_NOT_FOUND", 404);
    }

    // 5. Verificar que la compañía exista
    const company = await getCompanyFromPayload(payload);
    if (!company) {
      throw new AuthError("Compañía no encontrada", "COMPANY_NOT_FOUND", 404);
    }

    // 6. Añadir información al request
    (req as AuthRequest).user = user;
    (req as AuthRequest).company = company;
    (req as AuthRequest).sessionId = payload.sessionId;

    // 7. Actualizar última actividad de sesión (async, no esperamos)
    sessionService.updateSessionActivity(payload.sessionId).catch(() => {
      // No hacer nada si falla, no es crítico
    });

    // 8. Log de autenticación exitosa
    logger.debug("Autenticación exitosa", {
      userId: user.id,
      companyId: company.id,
      path: req.path,
      method: req.method,
    });

    next();
    return;
  } catch (error) {
    if (error instanceof AuthError) {
      logger.warn("Error de autenticación", {
        error: error.message,
        code: error.code,
        path: req.path,
        ip: req.ip,
      });

      return res
        .status(error.statusCode)
        .apiError(error.message, error.statusCode, {
          code: error.code,
        });
    }

    logger.error("Error inesperado en autenticación:", error);
    return res.status(500).apiError("Error interno de autenticación");
  }
};

/**
 * Middleware para obtener device info del request
 */
export const extractDeviceInfo = (
  req: Request,
  _: Response,
  next: NextFunction,
) => {
  const userAgentHeader = req.headers["user-agent"];
  const userAgent =
    typeof userAgentHeader === "string" ? userAgentHeader : "unknown";

  const deviceInfo = {
    browser: userAgent,
    os: getOSFromUserAgent(userAgent),
    device: getDeviceFromUserAgent(userAgent),
    ip: req.ip || req.socket.remoteAddress || "unknown",
    userAgent,
  } satisfies DeviceInfo;

  req.deviceInfo = deviceInfo;
  next();
};

/**
 * Middleware para requerir email verificado
 */
export const requireEmailVerified = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authReq = req as AuthRequest;

  if (!authReq.user.emailVerified) {
    return res
      .status(403)
      .apiError(
        "Email no verificado. Por favor verifica tu email antes de continuar.",
        403,
        { code: "EMAIL_NOT_VERIFIED" },
      );
  }

  return next();
};

// ====================
// FUNCIONES AUXILIARES
// ====================

function getOSFromUserAgent(userAgent: string): string {
  if (!userAgent) return "unknown";

  if (/windows/i.test(userAgent)) return "Windows";
  if (/macintosh|mac os x/i.test(userAgent)) return "macOS";
  if (/linux/i.test(userAgent)) return "Linux";
  if (/android/i.test(userAgent)) return "Android";
  if (/ios|iphone|ipad|ipod/i.test(userAgent)) return "iOS";

  return "unknown";
}

function getDeviceFromUserAgent(userAgent: string): string {
  if (!userAgent) return "unknown";

  if (/mobile/i.test(userAgent)) return "Mobile";
  if (/tablet/i.test(userAgent)) return "Tablet";

  return "Desktop";
}

async function getUserFromPayload(
  payload: JwtPayload,
): Promise<AuthUser | null> {
  try {
    const user = await User.findByPk(payload.userId);

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      companyId: user.company_id,
      role: user.role,
      fullName: user.full_name,
      permissions: user.permissions || [],
      sessionId: payload.sessionId,
      isActive: user.is_active,
      emailVerified: user.email_verified,
    };
  } catch (error) {
    logger.error("Error obteniendo usuario desde payload:", error);
    return null;
  }
}

async function getCompanyFromPayload(
  payload: JwtPayload,
): Promise<CompanyContext | null> {
  try {
    const company = await Company.findByPk(payload.companyId);

    if (!company) {
      return null;
    }

    return {
      id: company.id,
      slug: company.slug,
      name: company.name,
      plan: company.plan,
      features: (company.features as Record<string, unknown>) || {},
    };
  } catch (error) {
    logger.error("Error obteniendo compañía desde payload:", error);
    return null;
  }
}
