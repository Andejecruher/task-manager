import { sequelizeConnection } from "@/database/connection-sequelize";
import { User } from "@/database/models/User";
import { Company } from "@/database/models/Company";
import { AuthError } from "@/types";
import { logger } from "@/utils/logger";
import { passwordService } from "./password";

export class UserService {
  async createUser(data: any, companyId: string): Promise<any> {
    const transaction = await sequelizeConnection.getSequelize().transaction();

    try {
      const company = await Company.findByPk(companyId, { transaction });
      if (!company) {
        throw new AuthError("La compañía no existe", "COMPANY_NOT_FOUND", 404);
      }

      const existingUser = await User.findOne({
        where: {
          email: data.email,
          company_id: companyId,
        },
        transaction,
      });

      if (existingUser) {
        throw new AuthError(
          "El usuario ya existe en esta compañía",
          "USER_ALREADY_EXISTS",
          409,
        );
      }

      const passwordHash = await passwordService.hashPassword(data.password);

      const user = await User.create(
        {
          email: data.email,
          password_hash: passwordHash,
          full_name: data.full_name,
          company_id: companyId,
          role: data.role || "user",
          email_verified: false,
        },
        { transaction },
      );

      await transaction.commit();

      logger.info("Usuario creado", {
        userId: user.id,
        companyId,
      });

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
      await transaction.rollback();
      if (error instanceof AuthError) throw error;
      logger.error("Error creando usuario:", error);
      throw new AuthError("Error creando usuario", "CREATE_USER_ERROR", 500);
    }
  }
}

export const userService = new UserService();
