import { AuthError, AuthRequest } from "@/types";
import { logger } from "@/utils/logger";
import { plainToClass } from "class-transformer";
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  Max,
  Min,
  validate,
} from "class-validator";
import type { Request, Response } from "express";

import { workspaceService } from "@/services/workspace";

// DTO para validar query params
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
}

export const workspaceController = new WorkspaceController();
