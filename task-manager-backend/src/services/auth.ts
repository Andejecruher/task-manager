import { config } from "../config";
import { db } from "../database/connection";
import {
  AuthError,
  ChangePasswordDTO,
  COMPANY_SLUG_REGEX,
  DeviceInfo,
  EMAIL_REGEX,
  LoginDTO,
  LoginResponse,
  RegisterDTO,
  ResetPasswordDTO,
  UpdateProfileDTO,
} from "../types";
import { logger } from "../utils/logger";
import { emailService } from "./email";
import { passwordService } from "./password";
import { sessionService } from "./session";
import { tokenService } from "./token";

export class AuthService {
  /**
   * Registro de nueva empresa y usuario owner
   */
  async register(
    data: RegisterDTO,
    deviceInfo: DeviceInfo,
  ): Promise<LoginResponse> {
    // Validar datos de entrada
    this.validateRegistrationData(data);

    // Iniciar transacción
    return await db.transaction(async (client) => {
      try {
        // 1. Verificar que el email no esté en uso globalmente
        const existingUser = await client.query(
          `SELECT id FROM users WHERE email = $1`,
          [data.email],
        );

        if (existingUser.rowCount > 0) {
          throw new AuthError(
            "El email ya está registrado",
            "EMAIL_ALREADY_EXISTS",
            409,
          );
        }

        // 2. Verificar que el slug de compañía esté disponible
        const existingCompany = await client.query(
          `SELECT id FROM companies WHERE slug = $1`,
          [data.companySlug],
        );

        if (existingCompany.rowCount > 0) {
          throw new AuthError(
            "El nombre de empresa ya está en uso",
            "COMPANY_SLUG_EXISTS",
            409,
          );
        }

        // 3. Crear compañía
        const companyResult = await client.query(
          `INSERT INTO companies 
                    (name, slug, plan, settings)
                    VALUES ($1, $2, 'free', '{}'::jsonb)
                    RETURNING id, name, slug, plan`,
          [data.companyName, data.companySlug],
        );

        const company = companyResult.rows[0];

        // 4. Hash de contraseña
        const passwordHash = await passwordService.hashPassword(data.password);

        // 5. Crear usuario owner
        const userResult = await client.query(
          `INSERT INTO users 
                    (company_id, email, password_hash, full_name, role, email_verified)
                    VALUES ($1, $2, $3, $4, 'owner', false)
                    RETURNING id, email, full_name, role, company_id, email_verified, avatar_url`,
          [company.id, data.email, passwordHash, data.fullName],
        );

        const user = userResult.rows[0];

        // 6. Crear workspace por defecto
        await client.query(
          `INSERT INTO workspaces 
           (company_id, name, slug, description, created_by)
           VALUES ($1, 'Mi Workspace', 'default', 'Workspace principal', $2)`,
          [company.id, user.id],
        );

        // 7. Generar token de verificación de email
        const { token: verificationToken } =
          tokenService.generateEmailVerificationToken(user.id, company.id);

        // 8. Crear sesión inicial
        const { sessionId, refreshToken } = await sessionService.createSession(
          user.id,
          company.id,
          deviceInfo,
          deviceInfo.ip,
          client,
        );

        // 9. Generar access token
        const { token: accessToken, expiresIn } =
          tokenService.generateAccessToken({
            userId: user.id,
            companyId: company.id,
            sessionId,
            role: user.role,
            email: user.email,
          });

        // 10. TODO: Enviar email de verificación (implementar después)
        await this.sendVerificationEmail(
          user.email,
          user.full_name,
          verificationToken,
        );

        logger.info("Registro exitoso", {
          userId: user.id,
          companyId: company.id,
          email: user.email,
        });

        return {
          user: {
            id: user.id,
            email: user.email,
            fullName: user.full_name,
            role: user.role,
            companyId: user.company_id,
            emailVerified: user.email_verified,
            avatarUrl: user.avatar_url,
          },
          tokens: {
            verificationToken, // Para pruebas, en producción no se devuelve
            accessToken,
            refreshToken,
            expiresIn,
            refreshExpiresIn: 604800, // 7 días en segundos
          },
          company: {
            id: company.id,
            name: company.name,
            slug: company.slug,
            plan: company.plan,
          },
        };
      } catch (error) {
        if (error instanceof AuthError) throw error;
        logger.error("Error en registro:", error);
        throw new AuthError("Error en el registro", "REGISTRATION_ERROR", 500);
      }
    });
  }

  async refreshTokens(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }> {
    try {
      // 1. Verificar refresh token
      const payload = tokenService.verifyRefreshToken(refreshToken);

      // 2. Verificar que la sesión esté activa
      const isSessionActive = await sessionService.isSessionActive(
        payload.sessionId,
      );
      if (!isSessionActive) {
        throw new AuthError(
          "Sesión inválida o expirada",
          "INVALID_SESSION",
          401,
        );
      }

      // 3. Obtener información del usuario
      const userResult = await db.query(
        `SELECT id, email, role, is_active FROM users 
         WHERE id = $1 AND company_id = $2 AND deleted_at IS NULL`,
        [payload.userId, payload.companyId],
      );

      if (userResult.length === 0) {
        throw new AuthError("Usuario no encontrado", "USER_NOT_FOUND", 404);
      }

      const user = userResult[0];

      if (!user.is_active) {
        throw new AuthError("Cuenta desactivada", "ACCOUNT_INACTIVE", 403);
      }

      // 4. Generar nuevos tokens con la misma sesión
      const { token: newAccessToken, expiresIn } =
        tokenService.generateAccessToken({
          userId: user.id,
          companyId: payload.companyId,
          sessionId: payload.sessionId,
          role: user.role,
          email: user.email,
        });

      // 5. Generar nuevo refresh token (rotación)
      const { token: newRefreshToken } = tokenService.generateRefreshToken({
        sessionId: payload.sessionId,
        userId: user.id,
        companyId: payload.companyId,
      });

      // 6. Actualizar actividad de sesión
      await sessionService.updateSessionActivity(payload.sessionId);

      logger.info("Tokens refrescados", {
        userId: user.id,
        sessionId: payload.sessionId,
      });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn,
      };
    } catch (error) {
      if (error instanceof AuthError) throw error;
      logger.error("Error refrescando tokens:", error);
      throw new AuthError("Error refrescando tokens", "REFRESH_ERROR", 500);
    }
  }

  /**
   * Login de usuario
   */
  async login(
    data: LoginDTO,
    deviceInfo: any,
    ipAddress?: string,
  ): Promise<LoginResponse> {
    // Validar datos
    if (!data.email || !data.password || !data.companySlug) {
      throw new AuthError(
        "Email, contraseña y empresa son requeridos",
        "VALIDATION_ERROR",
        400,
      );
    }

    try {
      // 1. Buscar compañía por slug
      const companyResult = await db.query(
        `SELECT id, name, slug, plan FROM companies WHERE slug = $1 AND deleted_at IS NULL`,
        [data.companySlug],
      );

      if (companyResult.length === 0) {
        throw new AuthError("Empresa no encontrada", "COMPANY_NOT_FOUND", 404);
      }

      const company = companyResult[0];

      // 2. Buscar usuario en esa compañía específica
      const userResult = await db.query(
        `SELECT 
          id, email, password_hash, full_name, role, 
          company_id, email_verified, avatar_url, is_active,
          failed_login_attempts, locked_until
         FROM users 
         WHERE email = $1 AND company_id = $2 AND deleted_at IS NULL`,
        [data.email, company.id],
      );

      if (userResult.length === 0) {
        // Incrementar contador de intentos fallidos si el usuario existe en otra compañía
        await this.handleFailedLoginAttempt(data.email);
        throw new AuthError(
          "Credenciales inválidas",
          "INVALID_CREDENTIALS",
          401,
        );
      }

      const user = userResult[0];

      // 3. Verificar si la cuenta está bloqueada
      if (user.locked_until && new Date(user.locked_until) > new Date()) {
        throw new AuthError(
          "Cuenta bloqueada temporalmente",
          "ACCOUNT_LOCKED",
          423,
        );
      }

      // 4. Verificar si la cuenta está activa
      if (!user.is_active) {
        throw new AuthError("Cuenta desactivada", "ACCOUNT_INACTIVE", 403);
      }

      // 5. Verificar contraseña
      const passwordValid = await passwordService.comparePassword(
        data.password,
        user.password_hash,
      );

      if (!passwordValid) {
        // Incrementar intentos fallidos
        await this.incrementFailedAttempts(user.id, company.id);
        throw new AuthError(
          "Credenciales inválidas",
          "INVALID_CREDENTIALS",
          401,
        );
      }

      // 6. Resetear contador de intentos fallidos (login exitoso)
      await this.resetFailedAttempts(user.id, company.id);

      // 7. Actualizar último login
      await db.query(`UPDATE users SET last_login_at = NOW() WHERE id = $1`, [
        user.id,
      ]);

      // 8. Crear nueva sesión
      const { sessionId, refreshToken } = await sessionService.createSession(
        user.id,
        company.id,
        deviceInfo,
        ipAddress,
      );

      // 9. Generar access token
      const { token: accessToken, expiresIn } =
        tokenService.generateAccessToken({
          userId: user.id,
          companyId: company.id,
          sessionId,
          role: user.role,
          email: user.email,
        });

      logger.info("Login exitoso", {
        userId: user.id,
        companyId: company.id,
        email: user.email,
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          role: user.role,
          companyId: user.company_id,
          emailVerified: user.email_verified,
          avatarUrl: user.avatar_url,
        },
        tokens: {
          accessToken,
          refreshToken,
          expiresIn,
          refreshExpiresIn: 604800,
        },
        company: {
          id: company.id,
          name: company.name,
          slug: company.slug,
          plan: company.plan,
        },
      };
    } catch (error) {
      if (error instanceof AuthError) throw error;
      logger.error("Error en login:", error);
      throw new AuthError("Error en el login", "LOGIN_ERROR", 500);
    }
  }

  /**
   * Solicitar reset de contraseña
   */
  async requestPasswordReset(
    email: string,
    companySlug: string,
  ): Promise<{
    resetToken: string;
    expiresAt: Date;
  } | void> {
    try {
      // 1. Buscar compañía
      const companyResult = await db.query(
        `SELECT id FROM companies WHERE slug = $1`,
        [companySlug],
      );

      if (companyResult.length === 0) {
        // No revelar que la compañía no existe por seguridad
        return;
      }

      const company = companyResult[0];

      // 2. Buscar usuario
      const userResult = await db.query(
        `SELECT id, email, full_name FROM users 
         WHERE email = $1 AND company_id = $2 AND is_active = true`,
        [email, company.id],
      );

      if (userResult.length === 0) {
        // No revelar que el usuario no existe por seguridad
        return;
      }

      const user = userResult[0];

      // 3. Generar token de reset
      const { token: resetToken, expiresAt } =
        tokenService.generateResetPasswordToken(user.id, company.id);

      // 4. TODO: Enviar email con token (implementar después)
      // await this.sendPasswordResetEmail(user.email, user.full_name, resetToken, expiresAt);

      logger.info("Solicitud de reset de contraseña", {
        userId: user.id,
        email: user.email,
      });

      return {
        resetToken, // Para pruebas, en producción no se devuelve
        expiresAt,
      };
    } catch (error) {
      logger.error("Error solicitando reset de contraseña:", error);
      // No lanzamos error para no revelar información
    }
  }

  /**
   * Resetear contraseña con token
   */
  async resetPassword(data: ResetPasswordDTO): Promise<void> {
    try {
      // 1. Verificar token
      const { userId, companyId } = await tokenService.verifyResetPasswordToken(
        data.token,
      );

      // 2. Validar nueva contraseña
      passwordService.validatePassword(data.newPassword);

      // 3. Generar hash de nueva contraseña
      const passwordHash = await passwordService.hashPassword(data.newPassword);

      // 4. Actualizar contraseña
      await db.query(
        `UPDATE users 
         SET password_hash = $1, updated_at = NOW()
         WHERE id = $2 AND company_id = $3`,
        [passwordHash, userId, companyId],
      );

      // 5. Revocar todas las sesiones por seguridad
      await sessionService.revokeAllSessions(userId, companyId);

      logger.info("Contraseña reseteada", { userId });
    } catch (error) {
      if (error instanceof AuthError) throw error;
      logger.error("Error reseteando contraseña:", error);
      throw new AuthError(
        "Error reseteando contraseña",
        "RESET_PASSWORD_ERROR",
        500,
      );
    }
  }

  /**
   * Verificar email
   */
  async verifyEmail(token: string): Promise<void> {
    try {
      // 1. Verificar token
      const { userId, companyId } =
        await tokenService.verifyEmailVerificationToken(token);

      // 2. Marcar email como verificado
      await db.query(
        `UPDATE users 
         SET email_verified = true, updated_at = NOW()
         WHERE id = $1 AND company_id = $2`,
        [userId, companyId],
      );

      logger.info("Email verificado", { userId });
    } catch (error) {
      if (error instanceof AuthError) throw error;
      logger.error("Error verificando email:", error);
      throw new AuthError("Error verificando email", "VERIFY_EMAIL_ERROR", 500);
    }
  }

  /**
   * Logout (revocar sesión actual)
   */
  async logout(
    sessionId: string,
    userId: string,
    companyId: string,
  ): Promise<void> {
    try {
      await sessionService.revokeSession(sessionId, userId, companyId);
      logger.info("Logout exitoso", { userId, sessionId });
    } catch (error) {
      logger.error("Error en logout:", error);
      throw new AuthError("Error en logout", "LOGOUT_ERROR", 500);
    }
  }

  /**
   * Obtener sesiones activas
   */
  async getSessions(
    userId: string,
    companyId: string,
    currentSessionId?: string,
  ) {
    return await sessionService.getUserSessions(
      userId,
      companyId,
      currentSessionId,
    );
  }

  // ====================
  // MÉTODOS PRIVADOS
  // ====================

  /**
   * Obtener perfil de usuario
   */
  async getProfile(userId: string, companyId: string): Promise<any> {
    try {
      const result = await db.query(
        `SELECT 
          id, email, full_name, avatar_url, role,
          email_verified, is_active, is_onboarded,
          timezone, locale, created_at, updated_at,
          (SELECT COUNT(*) FROM user_sessions 
           WHERE user_id = $1 AND company_id = $2 AND is_active = true) as active_sessions
         FROM users 
         WHERE id = $1 AND company_id = $2`,
        [userId, companyId],
      );

      if (result.length === 0) {
        throw new AuthError("Usuario no encontrado", "USER_NOT_FOUND", 404);
      }

      return result[0];
    } catch (error) {
      if (error instanceof AuthError) throw error;
      logger.error("Error obteniendo perfil:", error);
      throw new AuthError("Error obteniendo perfil", "GET_PROFILE_ERROR", 500);
    }
  }

  /**
   * Actualizar perfil
   */
  async updateProfile(
    userId: string,
    companyId: string,
    data: UpdateProfileDTO,
  ): Promise<any> {
    try {
      // Construir query dinámica
      const updates: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (data.fullName !== undefined) {
        updates.push(`full_name = $${paramIndex}`);
        values.push(data.fullName);
        paramIndex++;
      }

      if (data.avatarUrl !== undefined) {
        updates.push(`avatar_url = $${paramIndex}`);
        values.push(data.avatarUrl);
        paramIndex++;
      }

      if (data.timezone !== undefined) {
        updates.push(`timezone = $${paramIndex}`);
        values.push(data.timezone);
        paramIndex++;
      }

      if (data.locale !== undefined) {
        updates.push(`locale = $${paramIndex}`);
        values.push(data.locale);
        paramIndex++;
      }

      if (updates.length === 0) {
        return await this.getProfile(userId, companyId);
      }

      updates.push(`updated_at = NOW()`);

      const query = `
        UPDATE users 
        SET ${updates.join(", ")}
        WHERE id = $${paramIndex} AND company_id = $${paramIndex + 1}
        RETURNING id, email, full_name, avatar_url, timezone, locale, updated_at
      `;

      values.push(userId, companyId);

      const result = await db.query(query, values);

      if (result.length === 0) {
        throw new AuthError("Usuario no encontrado", "USER_NOT_FOUND", 404);
      }

      logger.info("Perfil actualizado", { userId });

      return result[0];
    } catch (error) {
      if (error instanceof AuthError) throw error;
      logger.error("Error actualizando perfil:", error);
      throw new AuthError(
        "Error actualizando perfil",
        "UPDATE_PROFILE_ERROR",
        500,
      );
    }
  }

  /**
   * Cambiar contraseña (usuario autenticado)
   */
  async changePasswordService(
    userId: string,
    companyId: string,
    data: ChangePasswordDTO,
  ): Promise<void> {
    try {
      // 1. Obtener hash actual
      const userResult = await db.query(
        `SELECT password_hash FROM users WHERE id = $1 AND company_id = $2`,
        [userId, companyId],
      );

      if (userResult.length === 0) {
        throw new AuthError("Usuario no encontrado", "USER_NOT_FOUND", 404);
      }

      const currentHash = userResult[0].password_hash;

      // 2. Verificar contraseña actual
      const currentPasswordValid = await passwordService.comparePassword(
        data.currentPassword,
        currentHash,
      );

      if (!currentPasswordValid) {
        throw new AuthError(
          "Contraseña actual incorrecta",
          "INVALID_CURRENT_PASSWORD",
          400,
        );
      }

      // 3. Validar nueva contraseña
      passwordService.validatePassword(data.newPassword);

      // 4. Generar nuevo hash
      const newHash = await passwordService.hashPassword(data.newPassword);

      // 5. Actualizar contraseña
      await db.query(
        `UPDATE users 
         SET password_hash = $1, updated_at = NOW()
         WHERE id = $2 AND company_id = $3`,
        [newHash, userId, companyId],
      );

      // 6. Revocar todas las sesiones excepto la actual
      // (esto se maneja en el controller que tiene el sessionId)

      logger.info("Contraseña cambiada", { userId });
    } catch (error) {
      if (error instanceof AuthError) throw error;
      logger.error("Error cambiando contraseña:", error);
      throw new AuthError(
        "Error cambiando contraseña",
        "CHANGE_PASSWORD_ERROR",
        500,
      );
    }
  }

  /**
   * Obtener sesiones activas
   */
  async getSession(
    userId: string,
    companyId: string,
    currentSessionId?: string,
  ) {
    return await sessionService.getUserSessions(
      userId,
      companyId,
      currentSessionId,
    );
  }

  private async sendVerificationEmail(
    to: string,
    fullName: string,
    token: string,
  ): Promise<void> {
    if (!to) return;

    try {
      const verificationLink = `${config.app.frontendUrl}/verify-email?token=${token}`;

      const subject = "Verifica tu email";
      const text = `Hola ${fullName},\n\nPor favor verifica tu email haciendo clic en el siguiente enlace:\n${verificationLink}\n\nSi no solicitaste esto, ignora este mensaje.`;
      const html = `<p>Hola ${fullName},</p><p>Por favor verifica tu email haciendo clic en el siguiente enlace:</p><a href="${verificationLink}">Verificar Email</a><p>Si no solicitaste esto, ignora este mensaje.</p>`;

      await emailService.sendEmail(to, subject, text, html);
    } catch (error) {
      logger.error("Error enviando email de verificación:", error);
    }
  }

  private validateRegistrationData(data: RegisterDTO): void {
    const errors: string[] = [];

    if (!data.email || !EMAIL_REGEX.test(data.email)) {
      errors.push("Email inválido");
    }

    if (!data.password) {
      errors.push("Contraseña requerida");
    } else {
      try {
        passwordService.validatePassword(data.password);
      } catch (error: any) {
        errors.push(error.message);
      }
    }

    if (!data.fullName || data.fullName.trim().length < 2) {
      errors.push("Nombre completo debe tener al menos 2 caracteres");
    }

    if (!data.companyName || data.companyName.trim().length < 2) {
      errors.push("Nombre de empresa debe tener al menos 2 caracteres");
    }

    if (!data.companySlug || !COMPANY_SLUG_REGEX.test(data.companySlug)) {
      errors.push(
        "Slug de empresa inválido. Solo letras minúsculas, números y guiones",
      );
    }

    if (errors.length > 0) {
      throw new AuthError(errors.join(", "), "VALIDATION_ERROR", 400);
    }
  }

  private async handleFailedLoginAttempt(email: string): Promise<void> {
    try {
      // Buscar usuario en cualquier compañía con este email
      const users = await db.query(
        `SELECT id, company_id FROM users WHERE email = $1`,
        [email],
      );

      for (const user of users) {
        await this.incrementFailedAttempts(user.id, user.company_id);
      }
    } catch (error) {
      logger.error("Error manejando intento fallido de login:", error);
    }
  }

  private async incrementFailedAttempts(
    userId: string,
    companyId: string,
  ): Promise<void> {
    try {
      await db.query(
        `UPDATE users 
         SET failed_login_attempts = failed_login_attempts + 1,
             updated_at = NOW()
         WHERE id = $1 AND company_id = $2`,
        [userId, companyId],
      );

      // Bloquear cuenta después de 5 intentos fallidos
      const result = await db.query(
        `SELECT failed_login_attempts FROM users 
         WHERE id = $1 AND company_id = $2`,
        [userId, companyId],
      );

      if (result.length > 0 && result[0].failed_login_attempts >= 5) {
        await db.query(
          `UPDATE users 
           SET locked_until = NOW() + INTERVAL '15 minutes',
               updated_at = NOW()
           WHERE id = $1 AND company_id = $2`,
          [userId, companyId],
        );

        logger.warn("Cuenta bloqueada por intentos fallidos", {
          userId,
          companyId,
          attempts: result[0].failed_login_attempts,
        });
      }
    } catch (error) {
      logger.error("Error incrementando intentos fallidos:", error);
    }
  }

  private async resetFailedAttempts(
    userId: string,
    companyId: string,
  ): Promise<void> {
    try {
      await db.query(
        `UPDATE users 
         SET failed_login_attempts = 0,
             locked_until = NULL,
             updated_at = NOW()
         WHERE id = $1 AND company_id = $2`,
        [userId, companyId],
      );
    } catch (error) {
      logger.error("Error reseteando intentos fallidos:", error);
    }
  }
}

// Instancia singleton
export const authService = new AuthService();
