import { config } from "@/config";
import { sequelizeConnection } from "@/database/connection-sequelize";
import { Company, User } from "@/database/models";
import {
  AuthError,
  type ChangePasswordDTO,
  COMPANY_SLUG_REGEX,
  type DeviceInfo,
  EMAIL_REGEX,
  type LoginDTO,
  type LoginResponse,
  type RegisterDTO,
  type ResetPasswordDTO,
  type UpdateProfileDTO,
} from "@/types";
import { logger } from "@/utils/logger";
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

    // Iniciar transacción con Sequelize
    const transaction = await sequelizeConnection.getSequelize().transaction();

    try {
      // 1. Verificar que el email no esté en uso globalmente
      const user = await User.findOne({
        where: { email: data.email },
        transaction,
      });

      if (user) {
        throw new AuthError(
          "El email ya está registrado",
          "EMAIL_ALREADY_EXISTS",
          409,
        );
      }

      // 2. Verificar que el slug de compañía esté disponible
      const company = await Company.findOne({
        where: { slug: data.companySlug },
        transaction,
      });

      if (company) {
        throw new AuthError(
          "El nombre de empresa ya está en uso",
          "COMPANY_SLUG_EXISTS",
          409,
        );
      }

      // 3. Crear compañía
      const newCompany = await Company.create(
        {
          name: data.companyName,
          slug: data.companySlug,
          plan: "free",
          settings: {},
          features: {},
        },
        { transaction },
      );

      // 4. Hash de contraseña
      const passwordHash = await passwordService.hashPassword(data.password);

      // 5. Crear usuario owner
      const newUser = await User.create(
        {
          company_id: newCompany.id,
          email: data.email,
          password_hash: passwordHash,
          full_name: data.fullName,
          role: "owner",
          email_verified: false,
        },
        { transaction },
      );

      // 6. Crear workspace por defecto
      // TODO: Implementar cuando el modelo Workspace esté disponible
      // await Workspace.create(
      //   {
      //     company_id: company.id,
      //     name: 'Mi Workspace',
      //     slug: 'default',
      //     description: 'Workspace principal',
      //     created_by: user.id,
      //   },
      //   { transaction },
      // );

      // 7. Generar token de verificación de email
      const { token: verificationToken } =
        tokenService.generateEmailVerificationToken(newUser.id, newCompany.id);

      // 8. Crear sesión inicial
      const { sessionId, refreshToken } = await sessionService.createSession(
        newUser.id,
        newCompany.id,
        deviceInfo,
        deviceInfo.ip,
        transaction,
      );

      // 9. Generar access token
      const { token: accessToken, expiresIn } =
        tokenService.generateAccessToken({
          userId: newUser.id,
          companyId: newCompany.id,
          sessionId,
          role: newUser.role,
          email: newUser.email,
        });

      // 10. Enviar email de verificación
      await this.sendVerificationEmail(
        newUser.email,
        newUser.full_name || data.fullName,
        verificationToken,
      );

      // Confirmar transacción
      await transaction.commit();

      logger.info("Registro exitoso", {
        userId: newUser.id,
        companyId: newCompany.id,
        email: newUser.email,
      });

      return {
        user: {
          id: newUser.id,
          email: newUser.email,
          fullName: newUser.full_name,
          role: newUser.role,
          companyId: newUser.company_id,
          emailVerified: newUser.email_verified,
          avatarUrl: newUser.avatar_url,
        },
        tokens: {
          verificationToken, // Para pruebas, en producción no se devuelve
          accessToken,
          refreshToken,
          expiresIn,
          refreshExpiresIn: 604800, // 7 días en segundos
        },
        company: {
          id: newCompany.id,
          name: newCompany.name,
          slug: newCompany.slug,
          plan: newCompany.plan,
        },
      };
    } catch (error) {
      // Revertir transacción en caso de error
      await transaction.rollback();

      if (error instanceof AuthError) throw error;
      logger.error("Error en registro:", error);
      throw new AuthError("Error en el registro", "REGISTRATION_ERROR", 500);
    }
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
      const user = await User.findByPk(payload.userId);

      if (!user) {
        throw new AuthError("Usuario no encontrado", "USER_NOT_FOUND", 404);
      }

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
      const company = await Company.findOne({
        where: { slug: data.companySlug },
      });

      if (!company) {
        throw new AuthError(
          "El nombre de empresa no existe",
          "COMPANY_SLUG_NOT_FOUND",
          404,
        );
      }

      // 2. Buscar usuario en esa compañía específica
      const user = await User.scope("withPassword").findOne({
        where: { email: data.email, company_id: company.id },
      });

      if (!user) {
        // Incrementar contador de intentos fallidos si el usuario existe en otra compañía
        throw new AuthError(
          "Credenciales inválidas",
          "INVALID_CREDENTIALS",
          401,
        );
      }

      // 3. Verificar si la cuenta está bloqueada
      if (await user.isLocked()) {
        throw new AuthError(
          "Cuenta bloqueada temporalmente",
          "ACCOUNT_LOCKED",
          423,
        );
      }

      // 4. Verificar si la cuenta está activa
      if (!user.is_active && !user.password_hash) {
        throw new AuthError("Cuenta desactivada", "ACCOUNT_INACTIVE", 403);
      }

      // 5. Verificar contraseña
      const passwordValid = await passwordService.comparePassword(
        data.password,
        user.password_hash,
      );

      if (!passwordValid) {
        // Incrementar intentos fallidos
        await user.incrementFailedAttempts();
        throw new AuthError(
          "Credenciales inválidas",
          "INVALID_CREDENTIALS",
          401,
        );
      }

      // 5.1 Verificar si el email está verificado
      if (!user.email_verified) {
        throw new AuthError(
          "Email no verificado",
          "EMAIL_NOT_VERIFIED",
          403,
        );
      }

      // 6. Resetear contador de intentos fallidos (login exitoso)
      await user.resetFailedAttempts();

      // 7. Actualizar último login
      await user.updateLastLogin();

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
  ): Promise<{ resetToken: string; expiresAt: Date } | void> {
    try {
      const company = await Company.findOne({
        where: { slug: companySlug },
        attributes: ["id"],
      });

      if (!company) return;

      const user = await User.scope("active").findOne({
        where: { email, company_id: company.id },
        attributes: ["id", "email", "full_name"],
      });
      if (!user) return;

      const { token: resetToken, expiresAt } =
        tokenService.generateResetPasswordToken(user.id, company.id);

      // 4. TODO: Enviar email con token (implementar después)
      await this.sendPasswordResetEmail(
        user.email,
        user.full_name,
        resetToken,
        expiresAt,
      );

      return { resetToken, expiresAt };
    } catch (error) {
      logger.error("Error en reset:", error);
      return;
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
      await User.update(
        {
          password_hash: passwordHash,
          updated_at: new Date(),
        },
        {
          where: {
            id: userId,
            company_id: companyId,
          },
        },
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
  async verifyEmail(token: string): Promise<string> {
    try {
      // 1. Verificar token
      const { userId, companyId } =
        await tokenService.verifyEmailVerificationToken(token);

      // 2. Marcar email como verificado
      await User.update(
        {
          email_verified: true,
          updated_at: new Date(),
        },
        {
          where: {
            id: userId,
            company_id: companyId,
          },
        },
      );

      const company = await Company.findByPk(companyId, { attributes: ["id", "name", "slug"] });

      logger.info("Email verificado", { userId, companyId: company?.id, companySlug: company?.slug });

      return company?.slug || "";
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
   * Logout de todas las sesiones
   */
  async logoutAll(userId: string, companyId: string): Promise<number> {
    try {
      const revokedCount = await sessionService.revokeAllSessions(userId, companyId);
      logger.info('Logout global exitoso', { userId, revokedCount });
      return revokedCount;
    } catch (error) {
      logger.error('Error en logout global:', error);
      throw new AuthError('Error en logout global', 'LOGOUT_ALL_ERROR', 500);
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
  async getProfile(userId: string): Promise<any> {
    try {
      const result = await User.findByPk(userId);

      if (!result) {
        throw new AuthError("Usuario no encontrado", "USER_NOT_FOUND", 404);
      }

      return result;
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
      // Construir objeto de actualización
      const updateData: any = {};

      if (data.fullName !== undefined) {
        updateData.full_name = data.fullName;
      }

      if (data.avatarUrl !== undefined) {
        updateData.avatar_url = data.avatarUrl;
      }

      if (data.timezone !== undefined) {
        updateData.timezone = data.timezone;
      }

      if (data.locale !== undefined) {
        updateData.locale = data.locale;
      }

      // Always update the updated_at timestamp
      updateData.updated_at = new Date();

      if (Object.keys(updateData).length === 1) {
        return await this.getProfile(userId);
      }

      // Actualizar usando Sequelize
      const [affectedCount, affectedRows] = await User.update(updateData, {
        where: {
          id: userId,
          company_id: companyId,
        },
        returning: true, // Para PostgreSQL
      });

      // Revisar si se actualizó algún registro
      if (affectedCount === 0 || !affectedRows || affectedRows.length === 0) {
        throw new AuthError("Usuario no encontrado", "USER_NOT_FOUND", 404);
      }

      const result = affectedRows[0].toJSON();

      logger.info("Perfil actualizado", { userId });

      return result;
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
      // 1. Obtener usuario con hash de contraseña
      const user = await User.scope("withPassword").findOne({
        where: {
          id: userId,
          company_id: companyId,
        },
        attributes: ["id", "password_hash"], // Solo traemos lo necesario
      });

      if (!user) {
        throw new AuthError("Usuario no encontrado", "USER_NOT_FOUND", 404);
      }

      // 2. Verificar contraseña actual
      const currentPasswordValid = await passwordService.comparePassword(
        data.currentPassword,
        user.password_hash, // Directamente del objeto user
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

      // 5. Actualizar contraseña con Sequelize
      await User.update(
        {
          password_hash: newHash,
          updated_at: new Date(),
        },
        {
          where: {
            id: userId,
            company_id: companyId,
          },
        },
      );

      logger.info("Contraseña cambiada exitosamente", { userId });
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

  private async sendPasswordResetEmail(
    to: string,
    fullName?: string,
    resetToken?: string,
    expiresAt?: Date,
  ) {
    if (!to || !fullName || !resetToken || !expiresAt) return;

    try {
      const resetLink = `${config.app.frontendUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(to)}`;
      const subject = "Restablece tu contraseña";
      const text = `Hola ${fullName},\n\nPor favor restablece tu contraseña haciendo clic en el siguiente enlace:\n${resetLink}\n\nSi no solicitaste esto, ignora este mensaje.`;
      const html = `<p>Hola ${fullName},</p><p>Por favor restablece tu contraseña haciendo clic en el siguiente enlace:</p><a href="${resetLink}">Restablecer Contraseña</a><p>Si no solicitaste esto, ignora este mensaje.</p>`;
      await emailService.sendEmail(to, subject, text, html);
    } catch (error) {
      logger.error("Error enviando email de reseteo de contraseña:", error);
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
}

// Instancia singleton
export const authService = new AuthService();
