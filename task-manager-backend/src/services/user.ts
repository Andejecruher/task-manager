import { config } from "@/config";
import { Company } from "@/database/models/Company";
import { User } from "@/database/models/User";
import { emailService } from "@/services/email";
import { passwordService } from "@/services/password";
import { AuthError } from "@/types";
import { logger } from "@/utils/logger";

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

      const user = await User.create(
        {
          email: data.email,
          password_hash: passwordHash,
          full_name: data.fullName,
          company_id: companyId,
          role: data.role || "user",
          email_verified: false,
        },
      );

      logger.info("Usuario creado", {
        userId: user.id,
        companyId,
      });

      await this.sendInvitationEmail(
        user.email,
        user.full_name,
        company.name,
        password
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
