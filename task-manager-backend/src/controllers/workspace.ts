import { AuthError, AuthRequest } from "@/types";
import { logger } from "@/utils/logger";
import { plainToClass } from "class-transformer";
import {
  IsBoolean,
  IsHexColor,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  validate,
} from "class-validator";
import type { Request, Response } from "express";

import { workspaceService } from "@/services/workspace";

class GetWorkspacesQueryDTO {
  @IsOptional()
  @IsBoolean()
  includeDeleted?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  offset?: number;
}

class CreateWorkspaceDTO {
  @IsString({ message: "El nombre debe ser un texto" })
  @IsNotEmpty({ message: "El nombre es requerido" })
  @MaxLength(255, { message: "El nombre no puede exceder 255 caracteres" })
  name!: string;

  @IsString({ message: "El slug debe ser un texto" })
  @IsNotEmpty({ message: "El slug es requerido" })
  @MaxLength(100, { message: "El slug no puede exceder 100 caracteres" })
  @Matches(/^[a-z0-9-]+$/, {
    message: "El slug solo puede contener letras minúsculas, números y guiones",
  })
  slug!: string;

  @IsString({ message: "La descripción debe ser un texto" })
  @IsOptional()
  description?: string;

  @IsString({ message: "El icono debe ser un texto" })
  @IsOptional()
  @MaxLength(50, { message: "El icono no puede exceder 50 caracteres" })
  icon?: string;

  @IsHexColor({
    message: "El color debe ser un código hexadecimal válido (ej: #3B82F6)",
  })
  @IsOptional()
  color?: string;

  @IsBoolean({ message: "is_private debe ser un booleano" })
  @IsOptional()
  is_private?: boolean;
}

export class WorkspaceController {
  //workspaces - Obtener todos los workspaces
  async getWorkspaces(req: Request, res: Response) {
    try {
      const queryDto = plainToClass(GetWorkspacesQueryDTO, {
        includeDeleted: req.query.includeDeleted === "true",
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        offset: req.query.offset ? Number(req.query.offset) : undefined,
      });

      const queryErrors = await validate(queryDto);
      if (queryErrors.length > 0) {
        return res.status(400).apiValidationError(queryErrors);
      }

      const authReq = req as AuthRequest;

      const result = await workspaceService.getWorkspacesByCompany(
        authReq.company.id,
        {
          includeDeleted: queryDto.includeDeleted,
          limit: queryDto.limit,
          offset: queryDto.offset,
        },
      );

      return res
        .status(200)
        .apiSuccess(result, "Workspaces obtenidos exitosamente");
    } catch (error) {
      logger.error("Error getting workspaces:", error);

      if (error instanceof AuthError) {
        return res
          .status(error.statusCode)
          .apiError(error.message, error.statusCode, { code: error.code });
      }

      return res.status(500).apiError("Error interno del servidor");
    }
  }

  async createWorkspace(req: Request, res: Response) {
    try {
      // Validar el BODY con el DTO

      // Convertir el body a una instancia del DTO
      const dto = plainToClass(CreateWorkspaceDTO, req.body);

      // Validar todos los campos
      const errors = await validate(dto);

      //  Si hay errores, responder con 400 Bad Request
      if (errors.length > 0) {
        return res.status(400).apiValidationError(errors);
      }

      // Obtener datos del usuario autenticado

      const authReq = req as AuthRequest;
      const companyId = authReq.company?.id;
      const userId = authReq.user?.id;

      //  Validar que tenemos companyId
      if (!companyId) {
        return res
          .status(400)
          .apiError("No se pudo identificar la compañía", 400);
      }

      // Validar que tenemos userId
      if (!userId) {
        return res.status(400).apiError("Usuario no autenticado", 400);
      }

      // Llamar al SERVICIO para crear el workspace

      const newWorkspace = await workspaceService.createWorkspace(
        {
          name: dto.name,
          slug: dto.slug,
          description: dto.description,
          icon: dto.icon,
          color: dto.color,
          is_private: dto.is_private,
        },
        companyId,
        userId,
      );

      // Responder con el workspace creado

      return res
        .status(201)
        .apiSuccess(newWorkspace, "Workspace creado exitosamente");
    } catch (error) {
      // Manejo de errores
      logger.error("Error creating workspace:", error);

      if (error instanceof AuthError) {
        return res
          .status(error.statusCode)
          .apiError(error.message, error.statusCode, {
            code: error.code,
          });
      }

      return res.status(500).apiError("Error interno del servidor");
    }
  }
}

export const workspaceController = new WorkspaceController();
