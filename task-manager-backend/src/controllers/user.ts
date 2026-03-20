import { userService } from "@/services/user";
import type { AuthRequest, UserRole } from "@/types";
import { AuthError } from "@/types";
import { logger } from "@/utils/logger";
import { plainToClass } from "class-transformer";
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  validate,
} from "class-validator";
import type { Request, Response } from "express";

class CreateUserDTO {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @IsEnum(["owner", "admin", "manager", "member", "viewer"])
  @IsOptional()
  role?: string;
}

// DTO para actualizar rol
class UpdateRoleDTO {
  @IsEnum(["owner", "admin", "manager", "member", "viewer"])
  @IsNotEmpty()
  role!: string;
}

// NUEVO: DTO para validar parámetros de eliminación
class DeleteUserParamsDTO {
  @IsUUID()
  @IsNotEmpty()
  id!: string;
}

// NUEVO: DTO para validar parámetros de desactivación
class DeactivateUserParamsDTO {
  @IsUUID()
  @IsNotEmpty()
  id!: string;
}

export class UserController {
  async createUser(req: Request, res: Response) {
    try {
      const dto = plainToClass(CreateUserDTO, req.body);
      const errors = await validate(dto);

      if (errors.length > 0) {
        return res.status(400).apiValidationError(errors);
      }

      const authReq = req as AuthRequest;
      const result: unknown = await userService.createUser(
        dto,
        authReq.company.id,
      );

      return res.status(201).apiSuccess(result, "Usuario creado exitosamente");
    } catch (error) {
      logger.error("Error creating user:", error);

      if (error instanceof AuthError) {
        return res
          .status(error.statusCode)
          .apiError(error.message, error.statusCode, { code: error.code });
      }

      return res.status(500).apiError("Error interno del servidor");
    }
  }

  //  Actualizar rol por ID
  async updateUserRoleById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Validar que el ID existe
      if (!id) {
        return res.status(400).apiError("ID de usuario requerido", 400);
      }

      // Validar el body con el DTO
      const dto = plainToClass(UpdateRoleDTO, req.body);
      const errors = await validate(dto);

      if (errors.length > 0) {
        return res.status(400).apiValidationError(errors);
      }

      const authReq = req as AuthRequest;

      const result: unknown = await userService.updateUserRoleById(
        id,
        dto.role as unknown as UserRole,
        authReq.company.id,
        authReq.user.id,
      );

      return res
        .status(200)
        .apiSuccess(result, "Rol actualizado correctamente");
    } catch (error) {
      logger.error("Error updating user role:", error);

      if (error instanceof AuthError) {
        return res
          .status(error.statusCode)
          .apiError(error.message, error.statusCode, { code: error.code });
      }

      return res.status(500).apiError("Error interno del servidor");
    }
  }

  // NUEVO: Método con validación
  async deleteUserById(req: Request, res: Response) {
    try {
      // Validar el parámetro ID
      const paramsDto = plainToClass(DeleteUserParamsDTO, req.params);
      const paramsErrors = await validate(paramsDto);

      if (paramsErrors.length > 0) {
        return res.status(400).apiValidationError(paramsErrors);
      }

      const { id } = paramsDto;
      const authReq = req as AuthRequest;

      const result: unknown = await userService.deleteUserById(
        id,
        authReq.company.id,
        authReq.user.id,
      );

      return res
        .status(200)
        .apiSuccess(result, "Usuario eliminado correctamente");
    } catch (error) {
      logger.error("Error deleting user:", error);

      if (error instanceof AuthError) {
        return res
          .status(error.statusCode)
          .apiError(error.message, error.statusCode, { code: error.code });
      }

      return res.status(500).apiError("Error interno del servidor");
    }
  }

  // NUEVO: Método para desactivar usuario
  async deactivateUserById(req: Request, res: Response) {
    try {
      // Validar el parámetro ID
      const paramsDto = plainToClass(DeactivateUserParamsDTO, req.params);
      const paramsErrors = await validate(paramsDto);

      if (paramsErrors.length > 0) {
        return res.status(400).apiValidationError(paramsErrors);
      }

      const { id } = paramsDto;
      const authReq = req as AuthRequest;
      const result: unknown = await userService.deactivateUserById(
        id,
        authReq.company.id,
        authReq.user.id,
      );
      return res
        .status(200)
        .apiSuccess(result, "Usuario desactivado correctamente");
    } catch (error) {
      logger.error("Error deactivating user:", error);

      if (error instanceof AuthError) {
        return res
          .status(error.statusCode)
          .apiError(error.message, error.statusCode, { code: error.code });
      }

      return res.status(500).apiError("Error interno del servidor");
    }
  }
}

export const userController = new UserController();
