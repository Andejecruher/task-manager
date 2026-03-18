// services/workspace/index.ts
import { Company } from "@/database/models/Company";
import { User } from "@/database/models/User";
import { Workspace } from "@/database/models/Workspace";
import { WorkspaceMember } from "@/database/models/WorkspaceMember";
import { AuthError, ValidationError } from "@/types";
import { logger } from "@/utils/logger";
import { v4 as uuidv4 } from "uuid";

interface GetWorkspacesQuery {
  includeDeleted?: boolean;
  limit?: number;
  offset?: number;
}

interface CreateWorkspaceData {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  is_private?: boolean;
}

class WorkspaceService {
  //obtiene todos los workspaces de una compañía
  async getWorkspacesByCompany(
    companyId: string,
    query: GetWorkspacesQuery = {},
  ): Promise<{
    workspaces: Workspace[];
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  }> {
    try {
      // 1. Verificar que la compañía existe
      const company = await Company.findByPk(companyId);
      if (!company) {
        throw new AuthError("La compañía no existe", "COMPANY_NOT_FOUND", 404);
      }

      // 2. Valores por defecto
      const includeDeleted = query.includeDeleted || false;
      const limit = query.limit || 20;
      const offset = query.offset || 0;

      // 3. Construir where clause
      const where: any = {
        company_id: companyId,
      };

      // 4. Ejecutar consulta
      const { count, rows } = await Workspace.findAndCountAll({
        where,
        attributes: [
          "id",
          "company_id",
          "name",
          "slug",
          "description",
          "icon",
          "color",
          "settings",
          "is_private",
          "task_count",
          "member_count",
          "created_at",
          "updated_at",
          "created_by",
          "deleted_at",
        ],
        order: [["created_at", "DESC"]],
        limit,
        offset,
        paranoid: !includeDeleted,
      });

      logger.info("Workspaces obtenidos", {
        companyId,
        total: count,
        limit,
        offset,
      });

      // 5. Retornar resultado paginado
      return {
        workspaces: rows,
        total: count,
        limit,
        offset,
        hasMore: offset + limit < count,
      };
    } catch (error) {
      if (error instanceof AuthError) throw error;
      logger.error("Error obteniendo workspaces:", error);
      throw new AuthError(
        "Error obteniendo workspaces",
        "GET_WORKSPACES_ERROR",
        500,
      );
    }
  }

  async createWorkspace(
    data: CreateWorkspaceData,
    companyId: string,
    createdBy: string,
  ): Promise<Workspace> {
    try {
      // PASO 1: Verificar que la compañía existe

      const company = await Company.findByPk(companyId);
      if (!company) {
        throw new AuthError("La compañía no existe", "COMPANY_NOT_FOUND", 404);
      }

      // PASO 2: Verificar que el usuario existe

      const user = await User.findByPk(createdBy);
      if (!user) {
        throw new AuthError("El usuario no existe", "USER_NOT_FOUND", 404);
      }

      // Verificar que el usuario tiene rol OWNER o ADMIN en la compañía

      if (user.role !== "owner" && user.role !== "admin") {
        throw new AuthError(
          "No tienes permisos para crear workspaces. Solo owners y admins pueden hacer esto",
          "FORBIDDEN",
          403,
        );
      }

      // PASO 3: Verificar slug único en la compañía

      const existingWorkspace = await Workspace.findOne({
        where: {
          company_id: companyId,
          slug: data.slug,
        },
        paranoid: false,
      });

      // Si ya existe un workspace con ese slug
      if (existingWorkspace) {
        // Caso especial: está eliminado
        if (existingWorkspace.deleted_at) {
          throw new AuthError(
            "Ya existe un workspace con este slug pero está eliminado. Restáuralo o usa otro slug.",
            "WORKSPACE_DELETED_EXISTS",
            409,
          );
        }
        // Caso normal: ya existe activo
        throw new AuthError(
          "Ya existe un workspace con este slug en la compañía",
          "WORKSPACE_ALREADY_EXISTS",
          409,
        );
      }

      // PASO 4: Validar formato del slug (seguridad extra)

      const slugRegex = /^[a-z0-9-]+$/;
      if (!slugRegex.test(data.slug)) {
        throw new ValidationError(
          "El slug solo puede contener letras minúsculas, números y guiones",
        );
      }

      // PASO 5: Establecer valores por defecto

      const color = data.color || "#3B82F6";
      const is_private = data.is_private ?? false;
      const settings = {};

      // PASO 6: Crear el workspace en BASE DE DATOS

      const workspace = await Workspace.create({
        id: uuidv4(),
        company_id: companyId,
        name: data.name.trim(),
        slug: data.slug.toLowerCase().trim(),
        description: data.description?.trim() || undefined,
        icon: data.icon?.trim() || undefined,
        color,
        settings,
        is_private,
        task_count: 0,
        member_count: 1,
        created_by: createdBy,
        created_at: new Date(),
        updated_at: new Date(),
      });

      // PASO 7: Crear al creador como miembro del workspace

      await WorkspaceMember.create({
        id: uuidv4(),
        workspace_id: workspace.id,
        user_id: createdBy,
        role: "admin",
        joined_at: new Date(),
        company_id: companyId,
      });

      // PASO 8: Logging y retorno

      logger.info("Workspace creado exitosamente", {
        workspaceId: workspace.id,
        companyId,
        createdBy,
        name: workspace.name,
        slug: workspace.slug,
      });

      // Retornar el workspace creado
      return workspace;
    } catch (error) {
      // Manejo de errores

      if (error instanceof AuthError || error instanceof ValidationError) {
        throw error;
      }

      logger.error("Error creando workspace:", error);
      throw new AuthError(
        "Error creando workspace",
        "CREATE_WORKSPACE_ERROR",
        500,
      );
    }
  }
}

export const workspaceService = new WorkspaceService();
