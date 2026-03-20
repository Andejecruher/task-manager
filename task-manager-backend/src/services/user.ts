import { config } from "@/config";
import { User, UserSession } from "@/database/models";
import { Company } from "@/database/models/Company";
import { emailService } from "@/services/email";
import { passwordService } from "@/services/password";
import { AuthError, NotFoundError, UserRole, ValidationError } from "@/types";
import { logger } from "@/utils/logger";
import { Op } from "sequelize"; // <-- IMPORTANTE: Agregar esta importación

export class UserService {
  async createUser(data: any, companyId: string): Promise<any> {
    try {
      const company = await Company.findByPk(companyId);
      if (!company) {
        throw new AuthError("La compañía no existe", "COMPANY_NOT_FOUND", 404);
      }

      const existingUser = await User.findOne({
        where: {
          email: data.email,
          company_id: companyId,
        },
      });

      if (existingUser) {
        throw new AuthError(
          "El usuario ya existe en esta compañía",
          "USER_ALREADY_EXISTS",
          409,
        );
      }

      const password = Math.random().toString(36).slice(-8);
      const passwordHash = await passwordService.hashPassword(password);

      const user = await User.create({
        email: data.email,
        password_hash: passwordHash,
        full_name: data.fullName, // Mantenemos fullName como en tu DTO
        company_id: companyId,
        role: (data.role as UserRole) || UserRole.MEMBER,
        email_verified: false,
      });

      logger.info("Usuario creado", {
        userId: user.id,
        companyId,
      });

      await this.sendInvitationEmail(
        user.email,
        user.full_name,
        company.name,
        password,
      );

      return {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        company_id: user.company_id,
        email_verified: user.email_verified,
        created_at: user.created_at,
      };
    } catch (error) {
      if (error instanceof AuthError) throw error;
      logger.error("Error creando usuario:", error);
      throw new AuthError("Error creando usuario", "CREATE_USER_ERROR", 500);
    }
  }

  async deleteUserById(
    targetUserId: string,
    companyId: string,
    requestingUserId: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      //  Buscar usuario a eliminar
      const targetUser = await User.findOne({
        where: {
          id: targetUserId,
          company_id: companyId,
        },
      });

      if (!targetUser) {
        throw new AuthError("Usuario no encontrado", "USER_NOT_FOUND", 404);
      }

      // No permitir eliminarse a sí mismo
      if (targetUserId === requestingUserId) {
        throw new AuthError(
          "No puedes eliminarte a ti mismo",
          "FORBIDDEN",
          403,
        );
      }

      // 3. Solo owner puede eliminar admins
      const requestingUser = await User.findByPk(requestingUserId);

      if (targetUser.role === UserRole.ADMIN && requestingUser?.role !== UserRole.OWNER) {
        throw new AuthError(
          "Solo el owner puede eliminar administradores",
          "FORBIDDEN",
          403,
        );
      }

      // 4. Eliminar usuario (soft delete)
      await targetUser.update({
        is_active: false,
        deleted_at: new Date(),
        email: `deleted_${Date.now()}_${targetUser.email}`, // Opcional: ofuscar email
      });

      logger.info("Usuario eliminado", {
        deletedBy: requestingUserId,
        deletedUser: targetUserId,
        companyId,
      });

      return {
        success: true,
        message: "Usuario eliminado correctamente",
      };
    } catch (error) {
      if (error instanceof AuthError) throw error;
      logger.error("Error eliminando usuario:", error);
      throw new AuthError("Error eliminando usuario", "DELETE_USER_ERROR", 500);
    }
  }

  // ====================
  // MÉTODO ACTUALIZADO para recibir los 4 parámetros
  // ====================
  async updateUserRoleById(
    targetUserId: string,
    newRole: UserRole, // Nuevo rol
    companyId: string, // ID de la compañía (del token)
    requestingUserId: string,
  ): Promise<any> {
    try {
      // 1. Verificar que el usuario que solicita existe
      const requestingUser = await User.findByPk(requestingUserId, {
        attributes: ["id", "role", "company_id"],
      });

      if (!requestingUser) {
        throw new AuthError("Usuario no encontrado", "USER_NOT_FOUND", 404);
      }

      // 2. Verificar que el usuario solicitante pertenece a la misma compañía
      if (requestingUser.company_id !== companyId) {
        throw new AuthError("No perteneces a esta compañía", "FORBIDDEN", 403);
      }

      // 3. Solo owner puede cambiar roles
      if (requestingUser.role !== UserRole.OWNER) {
        throw new AuthError(
          "No tienes permisos para modificar roles. Solo el owner puede hacer esto",
          "FORBIDDEN",
          403,
        );
      }

      // 4. Buscar el usuario a actualizar (debe ser de la misma compañía)
      const targetUser = await User.findOne({
        where: {
          id: targetUserId,
          company_id: companyId,
        },
      });

      if (!targetUser) {
        throw new AuthError(
          "Usuario no encontrado en esta compañía",
          "USER_NOT_FOUND",
          404,
        );
      }

      // 5. No permitir cambiar el rol de otro owner
      if (targetUser.role === UserRole.OWNER && requestingUser.id !== targetUser.id) {
        throw new AuthError(
          "No puedes cambiar el rol de otro owner",
          "FORBIDDEN",
          403,
        );
      }

      // 6. Si va a convertir a alguien en owner, verificar que no exista otro owner
      if (newRole === UserRole.OWNER && targetUser.role !== UserRole.OWNER) {
        const existingOwner = await User.findOne({
          where: {
            company_id: companyId,
            role: UserRole.OWNER,
            deleted_at: null,
          },
        });

        if (existingOwner && existingOwner.id !== targetUser.id) {
          throw new AuthError(
            "Ya existe un owner en esta compañía",
            "OWNER_ALREADY_EXISTS",
            409,
          );
        }
      }

      // 7. Si el target es owner y se está cambiando a otro rol, asegurar que queda al menos un admin
      if (targetUser.role === UserRole.OWNER && newRole !== UserRole.OWNER) {
        const adminCount = await User.count({
          where: {
            company_id: companyId,
            role: UserRole.ADMIN,
            deleted_at: null,
            id: { [Op.ne]: targetUserId }, // [Op.ne] significa "no igual"
          },
        });

        if (adminCount === 0) {
          throw new AuthError(
            "Debe haber al menos un admin en la compañía",
            "ADMIN_REQUIRED",
            409,
          );
        }
      }

      // 8. Actualizar el rol
      targetUser.role = newRole;
      targetUser.set("updated_at", new Date());
      await targetUser.save();

      logger.info("Rol actualizado", {
        fromUserId: requestingUserId,
        toUserId: targetUserId,
        newRole,
        companyId,
      });

      // 9. Retornar usuario sin datos sensibles
      return {
        id: targetUser.id,
        email: targetUser.email,
        full_name: targetUser.full_name,
        role: targetUser.role,
        company_id: targetUser.company_id,
        email_verified: targetUser.email_verified,
        is_active: targetUser.is_active,
        updated_at: targetUser.updated_at,
      };
    } catch (error) {
      if (error instanceof AuthError) throw error;
      logger.error("Error actualizando rol:", error);
      throw new AuthError(
        "Error actualizando rol de usuario",
        "UPDATE_ROLE_ERROR",
        500,
      );
    }
  }

  async deactivateUserById(
    targetUserId: string,
    companyId: string,
    requestingUserId: string,
  ): Promise<any> {
    try {
      // 1. Verificar que quien ejecuta es OWNER
      const requestingUser = await User.findByPk(requestingUserId);

      if (requestingUser?.role !== UserRole.OWNER) {
        throw new AuthError(
          "Solo el owner puede desactivar usuarios",
          "FORBIDDEN",
          403,
        );
      }

      // 2. Buscar usuario a desactivar (misma compañía)
      const targetUser = await User.findOne({
        where: {
          id: targetUserId,
          company_id: companyId,
        },
      });

      if (!targetUser) {
        throw new NotFoundError("Usuario");
      }

      // 3. Validaciones rápidas
      if (targetUser.id === requestingUserId) {
        throw new AuthError(
          "No puedes desactivarte a ti mismo",
          "FORBIDDEN",
          403,
        );
      }

      if (targetUser.role === UserRole.OWNER) {
        throw new AuthError(
          "No puedes desactivar a otro owner",
          "FORBIDDEN",
          403,
        );
      }

      if (!targetUser.is_active) {
        throw new ValidationError("El usuario ya está desactivado");
      }

      // 4. Cerrar TODAS sus sesiones activas
      const [sessionsClosed] = await UserSession.update(
        {
          is_active: false,
          revoked_at: new Date(),
        },
        {
          where: {
            user_id: targetUserId,
            is_active: true,
          },
        },
      );

      // 5. Desactivar usuario
      await targetUser.update({
        is_active: false,
        updated_at: new Date(), // ✅ Sequelize lo maneja automáticamente
      });

      // 6. Log y respuesta
      logger.info(
        `Usuario ${targetUserId} desactivado por ${requestingUserId}`,
      );

      return {
        id: targetUser.id,
        email: targetUser.email,
        full_name: targetUser.full_name,
        role: targetUser.role,
        is_active: false,
        sessions_closed: sessionsClosed,
      };
    } catch (error) {
      if (error instanceof AuthError) throw error;
      logger.error("Error desactivando usuario:", error);
      throw new AuthError(
        "Error desactivando usuario",
        "DEACTIVATE_USER_ERROR",
        500,
      );
    }
  }

  // ====================
  // MÉTODOS PRIVADOS
  // ====================
  private async sendInvitationEmail(
    to: string,
    full_name: string,
    company_name: string,
    password: string,
  ): Promise<void> {
    if (!to) return;

    try {
      const linkLogin = `${config.app.frontendUrl}/login?email=${encodeURIComponent(to)}`;

      const subject = `Invitación para unirte al equipo de ${company_name}`;
      const text = `Hola ${full_name},\n\nTe han invitado a unirte al equipo de ${company_name}.\n\nPuedes iniciar sesión aquí:\n${linkLogin}\n\nEmail: ${to}\nContraseña temporal: ${password}\n\nTe recomendamos cambiar la contraseña la primera vez que inicies sesión.\n\nSi no esperabas esta invitación, ignora este mensaje.`;
      const html = `
        <p>Hola ${full_name},</p>
        <p>Te han invitado a unirte al equipo de <strong>${company_name}</strong>.</p>
        <p>Puedes iniciar sesión haciendo clic en el siguiente enlace: <a href="${linkLogin}">Iniciar sesión</a></p>
        <ul>
          <li><strong>Email:</strong> ${to}</li>
          <li><strong>Contraseña temporal:</strong> ${password}</li>
        </ul>
        <p>Te recomendamos cambiar la contraseña la primera vez que inicies sesión.</p>
        <p>Si no esperabas esta invitación, ignora este mensaje.</p>
      `;

      await emailService.sendEmail(to, subject, text, html);
    } catch (error) {
      logger.error("Error enviando email de verificación:", error);
    }
  }
}

export const userService = new UserService();
