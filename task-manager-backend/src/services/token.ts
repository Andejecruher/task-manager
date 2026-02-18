import crypto from "crypto";
import jwt, { SignOptions } from "jsonwebtoken";
import { config } from "../config";
import { getRedisClient } from "../config/redis";
import { AuthError, JwtPayload, RefreshTokenPayload } from "../types";
import { logger } from "../utils/logger";

export class TokenService {
  private readonly accessTokenSecret: string;
  private readonly refreshTokenSecret: string;
  private readonly accessTokenExpiry: string;
  private readonly refreshTokenExpiry: string;

  constructor() {
    this.accessTokenSecret = config.jwt.secret;
    this.refreshTokenSecret = config.jwt.secret + "_REFRESH"; // Diferente secret para refresh
    this.accessTokenExpiry = config.jwt.accessExpiry;
    this.refreshTokenExpiry = config.jwt.refreshExpiry;
  }

  /**
   * Genera JWT access token
   */
  generateAccessToken(payload: Omit<JwtPayload, "iat" | "exp">): {
    token: string;
    expiresIn: number;
  } {
    try {
      const expiresIn = this.parseTimeToSeconds(this.accessTokenExpiry);
      const token = jwt.sign(payload, this.accessTokenSecret, {
        expiresIn,
        issuer: config.jwt.issuer,
        audience: "task-manager-api",
      } as SignOptions);

      return { token, expiresIn };
    } catch (error) {
      logger.error("Error generando access token:", error);
      throw new AuthError(
        "Error generando token",
        "TOKEN_GENERATION_ERROR",
        500,
      );
    }
  }

  /**
   * Genera refresh token
   */
  generateRefreshToken(payload: RefreshTokenPayload): {
    token: string;
    expiresIn: number;
  } {
    try {
      const expiresIn = this.parseTimeToSeconds(this.refreshTokenExpiry);
      const token = jwt.sign(payload, this.refreshTokenSecret, {
        expiresIn,
        issuer: config.jwt.issuer,
        audience: "task-manager-refresh",
      } as SignOptions);

      return { token, expiresIn };
    } catch (error) {
      logger.error("Error generando refresh token:", error);
      throw new AuthError(
        "Error generando refresh token",
        "REFRESH_TOKEN_GENERATION_ERROR",
        500,
      );
    }
  }

  /**
   * Verifica y decodifica access token
   */
  verifyAccessToken(token: string): JwtPayload {
    try {
      const decoded = jwt.verify(token, this.accessTokenSecret, {
        issuer: config.jwt.issuer,
        audience: "task-manager-api",
      }) as JwtPayload;

      return decoded;
    } catch (error: any) {
      if (error.name === "TokenExpiredError") {
        throw new AuthError("Token expirado", "TOKEN_EXPIRED", 401);
      }
      if (error.name === "JsonWebTokenError") {
        throw new AuthError("Token inválido", "INVALID_TOKEN", 401);
      }
      logger.error("Error verificando access token:", error);
      throw new AuthError(
        "Error verificando token",
        "TOKEN_VERIFICATION_ERROR",
        500,
      );
    }
  }

  /**
   * Verifica y decodifica refresh token
   */
  verifyRefreshToken(token: string): RefreshTokenPayload {
    try {
      const decoded = jwt.verify(token, this.refreshTokenSecret, {
        issuer: config.jwt.issuer,
        audience: "task-manager-refresh",
      }) as RefreshTokenPayload;

      return decoded;
    } catch (error: any) {
      if (error.name === "TokenExpiredError") {
        throw new AuthError(
          "Refresh token expirado",
          "REFRESH_TOKEN_EXPIRED",
          401,
        );
      }
      throw new AuthError(
        "Refresh token inválido",
        "INVALID_REFRESH_TOKEN",
        401,
      );
    }
  }

  /**
   * Genera token para reset de contraseña
   */
  generateResetPasswordToken(
    userId: string,
    companyId: string,
  ): {
    token: string;
    expiresAt: Date;
  } {
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 3600000); // 1 hora

    // Hash del token para almacenar
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Almacenar en Redis por 1 hora
    const redisKey = `reset_token:${hashedToken}`;
    const redisValue = JSON.stringify({ userId, companyId });

    getRedisClient().setex(redisKey, 3600, redisValue);

    return { token, expiresAt };
  }

  /**
   * Verifica token de reset de contraseña
   */
  async verifyResetPasswordToken(token: string): Promise<{
    userId: string;
    companyId: string;
  }> {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const redisKey = `reset_token:${hashedToken}`;
    const stored = await getRedisClient().get(redisKey);

    if (!stored) {
      throw new AuthError(
        "Token inválido o expirado",
        "INVALID_RESET_TOKEN",
        400,
      );
    }

    // Eliminar token después de usarlo (one-time use)
    await getRedisClient().del(redisKey);

    return JSON.parse(stored);
  }

  /**
   * Genera token para verificación de email
   */
  generateEmailVerificationToken(
    userId: string,
    companyId: string,
  ): {
    token: string;
    expiresAt: Date;
  } {
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 86400000); // 24 horas

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const redisKey = `verify_email:${hashedToken}`;
    const redisValue = JSON.stringify({ userId, companyId });

    getRedisClient().setex(redisKey, 86400, redisValue);

    return { token, expiresAt };
  }

  /**
   * Verifica token de verificación de email
   */
  async verifyEmailVerificationToken(token: string): Promise<{
    userId: string;
    companyId: string;
  }> {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const redisKey = `verify_email:${hashedToken}`;
    const stored = await getRedisClient().get(redisKey);

    if (!stored) {
      throw new AuthError(
        "Token inválido o expirado",
        "INVALID_VERIFICATION_TOKEN",
        400,
      );
    }

    await getRedisClient().del(redisKey);

    return JSON.parse(stored);
  }

  /**
   * Invalida todos los tokens de un usuario (logout global)
   */
  async invalidateUserTokens(userId: string, companyId: string): Promise<void> {
    const keyPattern = `session:*:${companyId}:${userId}`;

    try {
      const keys = await getRedisClient().keys(keyPattern);
      if (keys.length > 0) {
        await getRedisClient().del(...keys);
      }
    } catch (error) {
      logger.error("Error invalidando tokens de usuario:", error);
    }
  }

  /**
   * Invalida una sesión específica
   */
  async invalidateSession(sessionId: string): Promise<void> {
    const key = `session:${sessionId}`;
    await getRedisClient().del(key);
  }

  /**
   * Verifica si una sesión está activa
   */
  async isSessionActive(sessionId: string): Promise<boolean> {
    const key = `session:${sessionId}`;
    const exists = await getRedisClient().exists(key);
    return exists === 1;
  }

  /**
   * Almacena sesión en Redis
   */
  async storeSession(
    sessionId: string,
    userId: string,
    companyId: string,
    deviceInfo: any,
  ): Promise<void> {
    const key = `session:${sessionId}`;
    const sessionData = {
      userId,
      companyId,
      deviceInfo,
      lastActivity: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    const ttl = this.parseTimeToSeconds(this.refreshTokenExpiry);
    await getRedisClient().setex(key, ttl, JSON.stringify(sessionData));
  }

  /**
   * Actualiza última actividad de sesión
   */
  async updateSessionActivity(sessionId: string): Promise<void> {
    const key = `session:${sessionId}`;
    const sessionData = await getRedisClient().get(key);

    if (sessionData) {
      const session = JSON.parse(sessionData);
      session.lastActivity = new Date().toISOString();

      const ttl = this.parseTimeToSeconds(this.refreshTokenExpiry);
      await getRedisClient().setex(key, ttl, JSON.stringify(session));
    }
  }

  /**
   * Obtiene información de sesión
   */
  async getSessionInfo(sessionId: string): Promise<any> {
    const key = `session:${sessionId}`;
    const sessionData = await getRedisClient().get(key);
    return sessionData ? JSON.parse(sessionData) : null;
  }

  /**
   * Parsea tiempo string a segundos
   */
  private parseTimeToSeconds(timeString: string): number {
    const units: { [key: string]: number } = {
      s: 1,
      m: 60,
      h: 3600,
      d: 86400,
    };

    const match = timeString.match(/^(\d+)([smhd])$/);
    if (!match) {
      return 900; // 15 minutos por defecto
    }

    const value = parseInt(match[1]);
    const unit = match[2];

    return value * (units[unit] || 1);
  }
}

// Instancia singleton
export const tokenService = new TokenService();
