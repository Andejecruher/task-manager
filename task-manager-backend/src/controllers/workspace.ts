import { AuthError, AuthRequest } from "@/types";
import { logger } from "@/utils/logger";
import { plainToClass } from "class-transformer";
import {
  IsBoolean,
  IsEmail,
  IsHexColor,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
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

// DTO para validar el parámetro ID
class WorkspaceIdParamsDTO {
  @IsUUID("4", { message: "El ID del workspace debe ser un UUID válido" })
  @IsNotEmpty({ message: "El ID es requerido" })
  id!: string;
}

// DTO para validar el body de actualización
class UpdateWorkspaceDTO {
  @IsOptional()
  @IsString({ message: "El nombre debe ser un texto" })
  @MaxLength(255, { message: "El nombre no puede exceder 255 caracteres" })
  name?: string;

  @IsOptional()
  @IsString({ message: "La descripción debe ser un texto" })
  description?: string;

  @IsOptional()
  @IsString({ message: "El icono debe ser un texto" })
  @MaxLength(50, { message: "El icono no puede exceder 50 caracteres" })
  icon?: string;

  @IsOptional()
  @IsHexColor({ message: "El color debe ser un código hexadecimal válido" })
  color?: string;

  @IsOptional()
  @IsBoolean({ message: "is_private debe ser un booleano" })
  is_private?: boolean;
}

// DTO para validar query params (paginación y filtros)
class GetMembersQueryDTO {
  @IsOptional()
  @IsNumber({}, { message: "limit debe ser un número" })
  @Min(1, { message: "limit debe ser al menos 1" })
  @Max(100, { message: "limit no puede ser mayor a 100" })
  limit?: number;

  @IsOptional()
  @IsNumber({}, { message: "offset debe ser un número" })
  @Min(0, { message: "offset no puede ser negativo" })
  offset?: number;

  @IsOptional()
  @IsString({ message: "role debe ser un texto" })
  @IsIn(["admin", "member", "viewer"], {
    message: "role debe ser uno de: admin, member, viewer",
  })
  role?: string;

  @IsOptional()
  @IsBoolean({ message: "includeInactive debe ser un booleano" })
  includeInactive?: boolean;
}

// DTO para el body de agregar miembro
class AddMemberDTO {
  @IsEmail({}, { message: "Debe ser un email válido" })
  @IsNotEmpty({ message: "El email es requerido" })
  email!: string;

  @IsString({ message: "El rol debe ser un texto" })
  @IsIn(["admin", "member", "viewer"], {
    message: "El rol debe ser: admin, member o viewer",
  })
  @IsOptional()
  role?: string;
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

  async getWorkspaceById(req: Request, res: Response) {
    try {
      // Validar el parámetro ID de la URL

      // Convertir req.params a instancia del DTO
      const paramsDto = plainToClass(WorkspaceIdParamsDTO, req.params);

      // Validar que sea un UUID válido
      const paramsErrors = await validate(paramsDto);

      //Si hay errores, responder con 400 Bad Request
      if (paramsErrors.length > 0) {
        return res.status(400).apiValidationError(paramsErrors);
      }

      //Obtener datos del usuario autenticado

      const authReq = req as AuthRequest;
      const companyId = authReq.company?.id;
      const userId = authReq.user?.id;

      // Validar que tenemos companyId (del middleware CompanyGuard)
      if (!companyId) {
        return res
          .status(400)
          .apiError("No se pudo identificar la compañía", 400);
      }

      // Validar que tenemos userId (del middleware authenticate)
      if (!userId) {
        return res.status(400).apiError("Usuario no autenticado", 400);
      }

      //Llamar al SERVICIO para obtener el workspace

      const workspace = await workspaceService.getWorkspaceById(
        paramsDto.id,
        companyId,
        userId,
      );

      // Responder con el workspace obtenido

      return res
        .status(200)
        .apiSuccess(workspace, "Workspace obtenido exitosamente");
    } catch (error) {
      // Manejo de errores

      logger.error("Error getting workspace by ID:", error);

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

  async updateWorkspaceById(req: Request, res: Response) {
    try {
      //Validar el parámetro ID de la URL

      const paramsDto = plainToClass(WorkspaceIdParamsDTO, req.params);
      const paramsErrors = await validate(paramsDto);

      if (paramsErrors.length > 0) {
        return res.status(400).apiValidationError(paramsErrors);
      }

      //Validar el BODY (todos los campos son opcionales)

      const bodyDto = plainToClass(UpdateWorkspaceDTO, req.body);
      const bodyErrors = await validate(bodyDto);

      if (bodyErrors.length > 0) {
        return res.status(400).apiValidationError(bodyErrors);
      }

      //Verificar que haya ALGÚN campo para actualizar

      if (Object.keys(bodyDto).length === 0) {
        return res
          .status(400)
          .apiError("Debes enviar al menos un campo para actualizar", 400);
      }

      //  Obtener datos del usuario autenticado

      const authReq = req as AuthRequest;
      const companyId = authReq.company?.id;
      const userId = authReq.user?.id;

      if (!companyId) {
        return res
          .status(400)
          .apiError("No se pudo identificar la compañía", 400);
      }

      if (!userId) {
        return res.status(400).apiError("Usuario no autenticado", 400);
      }

      // Llamar al SERVICIO para actualizar

      const updatedWorkspace = await workspaceService.updateWorkspaceById(
        paramsDto.id,
        {
          name: bodyDto.name,
          description: bodyDto.description,
          icon: bodyDto.icon,
          color: bodyDto.color,
          is_private: bodyDto.is_private,
        },
        companyId,
        userId,
      );

      // Responder con éxito

      return res
        .status(200)
        .apiSuccess(updatedWorkspace, "Workspace actualizado exitosamente");
    } catch (error) {
      logger.error("Error updating workspace:", error);

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

  async deleteWorkspaceById(req: Request, res: Response) {
    try {
      // Validar el parámetro ID de la URL

      const paramsDto = plainToClass(WorkspaceIdParamsDTO, req.params);
      const paramsErrors = await validate(paramsDto);

      if (paramsErrors.length > 0) {
        return res.status(400).apiValidationError(paramsErrors);
      }

      // Obtener datos del usuario autenticado

      const authReq = req as AuthRequest;
      const companyId = authReq.company?.id;
      const userId = authReq.user?.id;

      if (!companyId) {
        return res
          .status(400)
          .apiError("No se pudo identificar la compañía", 400);
      }

      if (!userId) {
        return res.status(400).apiError("Usuario no autenticado", 400);
      }

      // Llamar al SERVICIO para eliminar el workspace

      await workspaceService.deleteWorkspaceById(
        paramsDto.id,
        companyId,
        userId,
      );

      // Responder con éxito

      return res
        .status(200)
        .apiSuccess(null, "Workspace eliminado exitosamente");
    } catch (error) {
      logger.error("Error deleting workspace:", error);

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

  async getWorkspaceMembers(req: Request, res: Response) {
    try {
      // Validar el parámetro ID de la URL
      const paramsDto = plainToClass(WorkspaceIdParamsDTO, req.params);
      const paramsErrors = await validate(paramsDto);

      if (paramsErrors.length > 0) {
        return res.status(400).apiValidationError(paramsErrors);
      }

      // Validar query params
      const queryDto = plainToClass(GetMembersQueryDTO, {
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        offset: req.query.offset ? Number(req.query.offset) : undefined,
        role: req.query.role,
        includeInactive: req.query.includeInactive === "true",
      });

      const queryErrors = await validate(queryDto);
      if (queryErrors.length > 0) {
        return res.status(400).apiValidationError(queryErrors);
      }

      // Obtener datos del usuario autenticado
      const authReq = req as AuthRequest;
      const companyId = authReq.company?.id;
      const userId = authReq.user?.id;

      if (!companyId) {
        return res
          .status(400)
          .apiError("No se pudo identificar la compañía", 400);
      }

      if (!userId) {
        return res.status(400).apiError("Usuario no autenticado", 400);
      }

      //  Llamar al SERVICIO
      const result = await workspaceService.getWorkspaceMembers(
        paramsDto.id,
        companyId,
        userId,
        {
          limit: queryDto.limit,
          offset: queryDto.offset,
          role: queryDto.role,
          includeInactive: queryDto.includeInactive,
        },
      );

      // Responder con éxito
      return res
        .status(200)
        .apiSuccess(result, "Miembros obtenidos exitosamente");
    } catch (error) {
      logger.error("Error getting workspace members:", error);

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

  async addWorkspaceMember(req: Request, res: Response) {
    try {
      // 1. Validar ID del workspace
      const paramsDto = plainToClass(WorkspaceIdParamsDTO, req.params);
      const paramsErrors = await validate(paramsDto);
      if (paramsErrors.length > 0) {
        return res.status(400).apiValidationError(paramsErrors);
      }

      // 2. Validar body (email y rol)
      const bodyDto = plainToClass(AddMemberDTO, req.body);
      const bodyErrors = await validate(bodyDto);
      if (bodyErrors.length > 0) {
        return res.status(400).apiValidationError(bodyErrors);
      }

      const authReq = req as AuthRequest;

      // 3. Llamar al servicio
      const result = await workspaceService.addMember(
        paramsDto.id, // ID del workspace
        authReq.company.id, // ID de la compañía
        authReq.user.id, // ID de quien invita
        bodyDto.email, // Email del nuevo miembro
        bodyDto.role || "member", // Rol (por defecto "member")
      );

      return res
        .status(201)
        .apiSuccess(result, "Miembro agregado exitosamente");
    } catch (error) {
      logger.error("Error adding member:", error);
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
