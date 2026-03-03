import { v4 as uuidv4 } from "uuid";
import { getRedisClient } from "@/config/redis";
import { AuthError, DeviceInfo, SessionInfo } from "@/types";
import { logger } from "@/utils/logger";
import { tokenService } from "@/services/token";
import { UserSession } from "@/database/models/UserSession";
import { Op, Transaction } from "sequelize";

export class SessionService {
  /**
   * Crea una nueva sesión para el usuario
   */
  async createSession(
    userId: string,
    companyId: string,
    deviceInfo: DeviceInfo,
    ipAddress?: string,
    transaction?: Transaction,
  ): Promise<{ sessionId: string; refreshToken: string }> {
    try {
      // Generar ID de sesión único
      const sessionId = this.generateSessionId();

      // Almacenar sesión en Redis
      await tokenService.storeSession(sessionId, userId, companyId, {
        ...deviceInfo,
        ip: ipAddress,
      });

      // Almacenar en PostgreSQL para auditoría
      await UserSession.create(
        {
          id: sessionId,
          company_id: companyId,
          user_id: userId,
          device_info: deviceInfo,
          ip_address: ipAddress || "",
          is_active: true,
          last_activity_at: new Date(),
          expires_at: new Date(Date.now() + 15 * 60 * 1000),
          refresh_token_expires_at: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000,
          ),
          session_token: sessionId,
          refresh_token: sessionId,
        },
        { transaction: transaction ? transaction : undefined },
      );

      // Generar refresh token
      const { token: refreshToken } = tokenService.generateRefreshToken({
        sessionId,
        userId,
        companyId,
      });

      logger.info("Sesión creada", {
        userId,
        companyId,
        sessionId,
        device: deviceInfo.device,
      });

      return { sessionId, refreshToken };
    } catch (error) {
      logger.error("Error creando sesión:", error);
      throw new AuthError(
        "Error creando sesión",
        "SESSION_CREATION_ERROR",
        500,
      );
    }
  }

  /**
   * Obtiene todas las sesiones activas de un usuario
   */
  async getUserSessions(
    userId: string,
    companyId: string,
    currentSessionId?: string,
  ): Promise<SessionInfo[]> {
    try {
      const sessions = await UserSession.findAll({
        where: { user_id: userId, company_id: companyId },
      });

      // Obtener sesiones activas de Redis
      const redisKeys = await getRedisClient().keys(
        `session:*:${companyId}:${userId}`,
      );
      const activeSessionIds = new Set<string>();

      for (const key of redisKeys) {
        const sessionId = key.split(":")[1];
        activeSessionIds.add(sessionId);
      }

      return sessions.map((session: any) => ({
        id: session.id,
        deviceInfo: session.device_info,
        lastActivityAt: session.last_activity_at,
        createdAt: session.created_at,
        isCurrent: session.id === currentSessionId,
        isActive: activeSessionIds.has(session.id),
      }));
    } catch (error) {
      logger.error("Error obteniendo sesiones de usuario:", error);
      throw new AuthError(
        "Error obteniendo sesiones",
        "GET_SESSIONS_ERROR",
        500,
      );
    }
  }

  /**
   * Revoca una sesión específica
   */
  async revokeSession(
    sessionId: string,
    userId: string,
    companyId: string,
  ): Promise<void> {
    try {
      // Invalidar en Redis
      await tokenService.invalidateSession(sessionId);

      // Marcar como inactiva en PostgreSQL
      await UserSession.update(
        {
          is_active: false,
          refresh_token: new Date().getTime().toString(),
          revoked_at: new Date(),
        },
        { where: { id: sessionId, user_id: userId, company_id: companyId } },
      );

      logger.info("Sesión revocada", { sessionId, userId, companyId });
    } catch (error) {
      logger.error("Error revocando sesión:", error);
      throw new AuthError(
        "Error revocando sesión",
        "REVOKE_SESSION_ERROR",
        500,
      );
    }
  }

  /**
   * Revoca todas las sesiones (logout global)
   */
  async revokeAllSessions(userId: string, companyId: string): Promise<number> {
    try {
      // Invalidar todos los tokens en Redis
      await tokenService.invalidateUserTokens(userId, companyId);

      // Marcar todas como inactivas
      const result = await UserSession.update(
        {
          is_active: false,
          revoked_at: new Date(),
        },
        { where: { user_id: userId, company_id: companyId } },
      );

      logger.info("Todas las sesiones revocadas", {
        userId,
        companyId,
        revokedCount: result.length,
      });

      return result.length;
    } catch (error) {
      logger.error("Error revocando todas las sesiones:", error);
      throw new AuthError(
        "Error revocando sesiones",
        "REVOKE_ALL_SESSIONS_ERROR",
        500,
      );
    }
  }

  /**
   * Revoca todas las sesiones excepto la actual
   */
  async revokeOtherSessions(
    currentSessionId: string,
    userId: string,
    companyId: string,
  ): Promise<number> {
    try {
      // Obtener todas las sesiones activas
      const sessions = await this.getUserSessions(
        userId,
        companyId,
        currentSessionId,
      );

      // Revocar todas excepto la actual
      const otherSessions = sessions.filter((s) => s.id !== currentSessionId);

      for (const session of otherSessions) {
        await this.revokeSession(session.id, userId, companyId);
      }

      logger.info("Sesiones revocadas", {
        userId,
        companyId,
        revokedCount: otherSessions.length,
      });

      return otherSessions.length;
    } catch (error) {
      logger.error("Error revocando otras sesiones:", error);
      throw new AuthError(
        "Error revocando sesiones",
        "REVOKE_OTHER_SESSIONS_ERROR",
        500,
      );
    }
  }

  /**
   * Actualiza la última actividad de una sesión
   */
  async updateSessionActivity(sessionId: string): Promise<void> {
    try {
      // Actualizar en Redis
      await tokenService.updateSessionActivity(sessionId);

      // Actualizar en PostgreSQL
      await UserSession.update(
        {
          last_activity_at: new Date(),
        },
        { where: { id: sessionId } },
      );
    } catch (error) {
      logger.error("Error actualizando actividad de sesión:", error);
      // No lanzamos error porque no es crítico
    }
  }

  /**
   * Verifica si una sesión está activa
   */
  async isSessionActive(sessionId: string): Promise<boolean> {
    try {
      // Verificar en Redis primero (más rápido)
      const isActiveRedis = await tokenService.isSessionActive(sessionId);

      if (!isActiveRedis) {
        return false;
      }

      // Verificar en PostgreSQL para consistencia
      const result = await UserSession.findOne({
        where: {
          id: sessionId,
          is_active: true,
          expires_at: { [Op.gt]: new Date() },
        },
      });

      return result !== null;
    } catch (error) {
      logger.error("Error verificando sesión:", error);
      return false;
    }
  }

  /**
   * Obtiene información detallada de una sesión
   */
  async getSessionDetails(sessionId: string): Promise<any> {
    try {
      const result = await UserSession.findOne({
        where: { id: sessionId },
      });

      if (result === null) {
        throw new AuthError("Sesión no encontrada", "SESSION_NOT_FOUND", 404);
      }

      return result;
    } catch (error) {
      if (error instanceof AuthError) throw error;
      logger.error("Error obteniendo detalles de sesión:", error);
      throw new AuthError(
        "Error obteniendo sesión",
        "GET_SESSION_DETAILS_ERROR",
        500,
      );
    }
  }

  /**
   * Limpia sesiones expiradas
   */
  async cleanupExpiredSessions(): Promise<{ deletedCount: number }> {
    try {
      // Eliminar sesiones expiradas de PostgreSQL
      const result = await UserSession.destroy({
        where: { expires_at: { [Op.lt]: new Date() } },
      });

      logger.info("Sesiones expiradas limpiadas", {
        deletedCount: result,
      });

      return { deletedCount: result };
    } catch (error) {
      logger.error("Error limpiando sesiones expiradas:", error);
      return { deletedCount: 0 };
    }
  }

  /**
   * Genera un ID de sesión único
   */
  private generateSessionId(): string {
    return `${uuidv4()}`;
  }
}

// Instancia singleton
export const sessionService = new SessionService();
