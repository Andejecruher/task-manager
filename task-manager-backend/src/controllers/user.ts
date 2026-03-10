import { userService } from "@/services/user";
import { AuthError, AuthRequest } from "@/types";
import { logger } from "@/utils/logger";
import { plainToClass } from "class-transformer";
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  validate
} from "class-validator";
import { Request, Response } from "express";

class CreateUserDTO {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @IsEnum(['owner', 'admin', 'manager', 'member', 'viewer'])
  @IsOptional()
  role?: string;
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
      const result = await userService.createUser(dto, authReq.company.id);

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
}

export const userController = new UserController();
