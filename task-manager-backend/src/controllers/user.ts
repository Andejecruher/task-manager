import { plainToClass } from "class-transformer";
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  validate,
  IsEnum,
  IsOptional,
} from "class-validator";
import { Request, Response } from "express";
import { AuthError, AuthRequest } from "@/types";
import { logger } from "@/utils/logger";
import { userService } from "@/services/user";

class CreateUserDTO {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(10)
  password!: string;

  @IsString()
  @IsNotEmpty()
  full_name!: string;

  @IsEnum(["admin", "user"])
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
