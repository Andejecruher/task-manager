// services/workspace/index.ts
import { Company } from "@/database/models/Company";
import { Workspace } from "@/database/models/Workspace";
import { AuthError } from "@/types";
import { logger } from "@/utils/logger";

interface GetWorkspacesQuery {
  includeDeleted?: boolean;
  limit?: number;
  offset?: number;
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
}

export const workspaceService = new WorkspaceService();
