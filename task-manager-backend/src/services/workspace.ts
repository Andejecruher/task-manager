// services/workspace/index.ts
import { Company } from "@/database/models/Company";
import { User } from "@/database/models/User";
import { Workspace } from "@/database/models/Workspace";
import { WorkspaceMember } from "@/database/models/WorkspaceMember";
import { AuthError, UserRole, ValidationError } from "@/types";
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

interface UpdateWorkspaceData {
  name?: string;
  description?: string;
  icon?: string;
  color?: string;
  is_private?: boolean;
}

interface GetMembersQuery {
  limit?: number;
  offset?: number;
  role?: string;
  includeInactive?: boolean;
}

interface MemberResponse {
  id: string;
  user_id: string;
  workspace_id: string;
  role: string;
  joined_at: Date;
  invited_by?: string;
  permissions?: Record<string, unknown>;
  notification_settings?: Record<string, unknown>;
  user?: {
    id: string;
    email: string;
    full_name: string;
    avatar_url?: string;
    is_active: boolean;
  };
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

      if (user.role !== UserRole.OWNER && user.role !== UserRole.ADMIN) {
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

  async getWorkspaceById(
    workspaceId: string,
    companyId: string,
    userId: string, // Opcional: para verificar permisos
  ): Promise<Workspace> {
    try {
      // ============================================
      // PASO 1: Verificar que la compañía existe
      // ============================================
      const company = await Company.findByPk(companyId);
      if (!company) {
        throw new AuthError("La compañía no existe", "COMPANY_NOT_FOUND", 404);
      }

      // ============================================
      // PASO 2: Buscar el workspace por ID
      // ============================================
      const workspace = await Workspace.findOne({
        where: {
          id: workspaceId, // El ID que viene de la URL
          company_id: companyId, // Debe pertenecer a la misma compañía
        },
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
        // Opcional: incluir relaciones si las necesitas
        // include: [
        //   {
        //     model: WorkspaceMember,
        //     as: "members",
        //     attributes: ["id", "user_id", "role", "joined_at"],
        //   },
        // ],
      });

      // ============================================
      // PASO 3: Verificar que el workspace existe
      // ============================================
      if (!workspace) {
        throw new AuthError(
          "Workspace no encontrado",
          "WORKSPACE_NOT_FOUND",
          404,
        );
      }

      // ============================================
      // PASO 4: (OPCIONAL) Verificar que el usuario tiene acceso
      // ============================================
      // Esto depende de tu lógica de negocio:
      // - Si el workspace es público, cualquiera puede verlo
      // - Si es privado, solo miembros pueden verlo

      if (workspace.is_private) {
        // Verificar si el usuario es miembro del workspace
        const isMember = await WorkspaceMember.findOne({
          where: {
            workspace_id: workspace.id,
            user_id: userId,
          },
        });

        if (!isMember && workspace.created_by !== userId) {
          // Si no es miembro y no es el creador, no puede ver workspaces privados
          throw new AuthError(
            "No tienes permisos para ver este workspace",
            "FORBIDDEN",
            403,
          );
        }
      }

      // ============================================
      // PASO 5: Logging y retorno
      // ============================================

      logger.info("Workspace obtenido por ID", {
        workspaceId: workspace.id,
        companyId,
        requestedBy: userId,
      });

      return workspace;
    } catch (error) {
      // ============================================
      // PASO 6: Manejo de errores
      // ============================================

      if (error instanceof AuthError) {
        throw error;
      }

      logger.error("Error obteniendo workspace por ID:", error);
      throw new AuthError(
        "Error obteniendo workspace",
        "GET_WORKSPACE_BY_ID_ERROR",
        500,
      );
    }
  }

  async updateWorkspaceById(
    workspaceId: string,
    data: UpdateWorkspaceData,
    companyId: string,
    userId: string,
  ): Promise<Workspace> {
    try {
      // Verificar que la compañía existe

      const company = await Company.findByPk(companyId);
      if (!company) {
        throw new AuthError("La compañía no existe", "COMPANY_NOT_FOUND", 404);
      }

      //Verificar que el usuario existe

      const user = await User.findByPk(userId);
      if (!user) {
        throw new AuthError("El usuario no existe", "USER_NOT_FOUND", 404);
      }

      //Buscar el workspace

      const workspace = await Workspace.findOne({
        where: {
          id: workspaceId,
          company_id: companyId,
        },
      });

      if (!workspace) {
        throw new AuthError(
          "Workspace no encontrado",
          "WORKSPACE_NOT_FOUND",
          404,
        );
      }

      //  VALIDACIÓN DE PERMISOS - SOLO OWNER, ADMIN

      const isOwner = user.role === "owner";
      const isAdmin = user.role === "admin";

      // Pueden editar: OWNER o ADMIN
      if (!isOwner && !isAdmin) {
        throw new AuthError(
          "No tienes permisos para editar este workspace",
          "FORBIDDEN",
          403,
        );
      }

      //VALIDACIONES ESPECÍFICAS

      // Si se actualiza el color, validar formato (aunque ya lo hizo el DTO)
      if (data.color && !/^#[0-9A-Fa-f]{6}$/.test(data.color)) {
        throw new ValidationError("El color debe tener formato hexadecimal");
      }

      //Si se actualiza el nombre, limpiar espacios
      if (data.name) {
        data.name = data.name.trim();
      }

      // Si se actualiza la descripción, limpiar espacios
      if (data.description) {
        data.description = data.description.trim();
      }

      // Si se actualiza el icono, limpiar espacios
      if (data.icon) {
        data.icon = data.icon.trim();
      }

      //ACTUALIZAR SOLO LOS CAMPOS QUE VIENEN

      const updateData: any = {};

      if (data.name !== undefined) updateData.name = data.name;
      if (data.description !== undefined)
        updateData.description = data.description;
      if (data.icon !== undefined) updateData.icon = data.icon;
      if (data.color !== undefined) updateData.color = data.color;
      if (data.is_private !== undefined)
        updateData.is_private = data.is_private;

      updateData.updated_at = new Date();

      await workspace.update(updateData);

      //LOGGING Y RETORNO

      logger.info("Workspace actualizado", {
        workspaceId: workspace.id,
        updatedBy: userId,
        userRole: user.role,
        updatedFields: Object.keys(data),
      });

      // Retornar el workspace actualizado
      return workspace;
    } catch (error) {
      if (error instanceof AuthError || error instanceof ValidationError) {
        throw error;
      }

      logger.error("Error actualizando workspace:", error);
      throw new AuthError(
        "Error actualizando workspace",
        "UPDATE_WORKSPACE_ERROR",
        500,
      );
    }
  }

  async deleteWorkspaceById(
    workspaceId: string,
    companyId: string,
    userId: string,
  ): Promise<void> {
    try {
      // Verificar que la compañía existe

      const company = await Company.findByPk(companyId);
      if (!company) {
        throw new AuthError("La compañía no existe", "COMPANY_NOT_FOUND", 404);
      }

      //Verificar que el usuario existe
      const user = await User.findByPk(userId);
      if (!user) {
        throw new AuthError("El usuario no existe", "USER_NOT_FOUND", 404);
      }

      //Buscar el workspace

      const workspace = await Workspace.findOne({
        where: {
          id: workspaceId,
          company_id: companyId,
        },
      });

      if (!workspace) {
        throw new AuthError(
          "Workspace no encontrado",
          "WORKSPACE_NOT_FOUND",
          404,
        );
      }
      // VALIDACIÓN DE PERMISOS - SOLO OWNER, ADMIN

      const isOwner = user.role === "owner";
      const isAdmin = user.role === "admin";

      // Pueden eliminar: OWNER o ADMIN
      if (!isOwner && !isAdmin) {
        throw new AuthError(
          "No tienes permisos para eliminar este workspace",
          "FORBIDDEN",
          403,
        );
      }
      // Eliminar el workspace (soft delete)

      await workspace.destroy();
      // Logging

      logger.info("Workspace eliminado", {
        workspaceId: workspace.id,
        deletedBy: userId,
        userRole: user.role,
      });
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }

      logger.error("Error eliminando workspace:", error);
      throw new AuthError(
        "Error eliminando workspace",
        "DELETE_WORKSPACE_ERROR",
        500,
      );
    }
  }

  async getWorkspaceMembers(
    workspaceId: string,
    companyId: string,
    userId: string,
    query: GetMembersQuery = {},
  ): Promise<{
    members: MemberResponse[];
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  }> {
    try {
      //  Verificar que la compañía existe
      const company = await Company.findByPk(companyId);
      if (!company) {
        throw new AuthError("La compañía no existe", "COMPANY_NOT_FOUND", 404);
      }

      // Verificar que el workspace existe y pertenece a la compañía
      const workspace = await Workspace.findOne({
        where: {
          id: workspaceId,
          company_id: companyId,
        },
      });

      if (!workspace) {
        throw new AuthError(
          "Workspace no encontrado",
          "WORKSPACE_NOT_FOUND",
          404,
        );
      }

      const user = await User.findByPk(userId);
      if (!user) {
        throw new AuthError("Usuario no encontrado", "USER_NOT_FOUND", 404);
      }

      // Verificar si el usuario es miembro del workspace
      const isMember = await WorkspaceMember.findOne({
        where: {
          workspace_id: workspaceId,
          user_id: userId,
        },
      });

      const isOwner = user.role === "owner";
      const isAdmin = user.role === "admin";

      // Si no es owner/admin y no es miembro, no puede ver los miembros
      if (!isOwner && !isAdmin && !isMember) {
        throw new AuthError(
          "No tienes permisos para ver los miembros de este workspace",
          "FORBIDDEN",
          403,
        );
      }

      // VALORES POR DEFECTO
      const limit = query.limit || 20;
      const offset = query.offset || 0;

      //  CONSTRUIR WHERE CLAUSE PARA MIEMBROS
      const memberWhere: any = {
        workspace_id: workspaceId, // Solo miembros de este workspace
      };

      // Si viene filtro por rol, agregarlo
      if (query.role) {
        memberWhere.role = query.role;
      }

      //CONSTRUIR WHERE PARA USUARIOS
      const userWhere: any = {
        company_id: companyId, // Solo usuarios de la misma compañía
      };

      // Si no quiero incluir inactivos, filtrarlos
      if (!query.includeInactive) {
        userWhere.is_active = true;
      }

      // EJECUTAR CONSULTA
      // Busca en workspace_members y hace JOIN con users
      const { count, rows } = await WorkspaceMember.findAndCountAll({
        where: memberWhere,
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "email", "full_name", "avatar_url", "is_active"],
            where: userWhere,
            required: true,
          },
        ],
        limit,
        offset,
        order: [
          ["role", "ASC"], // Primero admins, luego members, luego viewers
          [{ model: User, as: "user" }, "full_name", "ASC"], // Luego por nombre
        ],
      });

      // FORMATEAR RESPUESTA
      // Convertir los datos de BD a un formato más limpio
      const members = rows.map((member: any) => ({
        id: member.id,
        user_id: member.user_id,
        workspace_id: member.workspace_id,
        role: member.role,
        joined_at: member.joined_at,
        invited_by: member.invited_by,
        permissions: member.permissions,
        notification_settings: member.notification_settings,
        user: member.user
          ? {
              id: member.user.id,
              email: member.user.email,
              full_name: member.user.full_name,
              avatar_url: member.user.avatar_url,
              is_active: member.user.is_active,
            }
          : undefined,
      }));

      //  LOGGING
      logger.info("Miembros obtenidos", {
        workspaceId,
        companyId,
        total: count,
        requestedBy: userId,
        filters: query,
      });

      //  RETORNAR RESULTADO PAGINADO
      return {
        members,
        total: count,
        limit,
        offset,
        hasMore: offset + limit < count,
      };
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }

      logger.error("Error obteniendo miembros:", error);
      throw new AuthError(
        "Error obteniendo miembros del workspace",
        "GET_MEMBERS_ERROR",
        500,
      );
    }
  }

  async addMember(
    workspaceId: string,
    companyId: string,
    invitedBy: string,
    email: string,
    role = "member",
  ) {
    try {
      //  Verificar que el workspace existe
      const workspace = await Workspace.findOne({
        where: {
          id: workspaceId,
          company_id: companyId,
        },
      });

      if (!workspace) {
        throw new AuthError(
          "Workspace no encontrado",
          "WORKSPACE_NOT_FOUND",
          404,
        );
      }

      // Verificar permisos de quien invita
      const inviter = await User.findByPk(invitedBy);
      const isInviterMember = await WorkspaceMember.findOne({
        where: {
          workspace_id: workspaceId,
          user_id: invitedBy,
        },
      });

      const isOwner = inviter?.role === "owner";
      const isAdmin = inviter?.role === "admin";
      const isWorkspaceAdmin = isInviterMember?.role === "admin";

      // Solo pueden invitar: owner, admin de compañía, o admin del workspace
      if (!isOwner && !isAdmin && !isWorkspaceAdmin) {
        throw new AuthError(
          "No tienes permisos para invitar miembros a este workspace",
          "FORBIDDEN",
          403,
        );
      }

      // Buscar el usuario por email
      const user = await User.findOne({
        where: {
          email: email,
          company_id: companyId, // Misma compañía
        },
      });

      if (!user) {
        throw new AuthError(
          "No existe un usuario con ese email en tu compañía",
          "USER_NOT_FOUND",
          404,
        );
      }

      //  Verificar que no sea el mismo usuario

      if (user.id === invitedBy) {
        throw new AuthError(
          "No puedes invitarte a ti mismo",
          "SELF_INVITE",
          400,
        );
      }

      // Verificar que no sea ya miembro
      const existingMember = await WorkspaceMember.findOne({
        where: {
          workspace_id: workspaceId,
          user_id: user.id,
        },
        paranoid: false, // Incluir eliminados
      });

      if (existingMember) {
        if (existingMember.deleted_at) {
          throw new AuthError(
            "El usuario ya fue miembro pero está eliminado. Restaura su membresía o usa otro email",
            "MEMBER_DELETED",
            409,
          );
        }
        throw new AuthError(
          "El usuario ya es miembro de este workspace",
          "MEMBER_ALREADY_EXISTS",
          409,
        );
      }

      // Crear el miembro
      const newMember = await WorkspaceMember.create({
        id: uuidv4(),
        workspace_id: workspaceId,
        user_id: user.id,
        company_id: companyId,
        role: role as "admin" | "member" | "viewer",
        joined_at: new Date(),
        invited_by: invitedBy,
        invited_at: new Date(),
      });

      // Actualizar contador de miembros
      await workspace.increment("member_count");

      //  Logging
      logger.info("Miembro agregado", {
        workspaceId,
        userId: user.id,
        invitedBy,
        role,
      });

      // PASO 9: Retornar miembro creado
      return {
        id: newMember.id,
        workspace_id: newMember.workspace_id,
        user_id: newMember.user_id,
        role: newMember.role,
        joined_at: newMember.joined_at,
        invited_by: newMember.invited_by,
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          avatar_url: user.avatar_url,
        },
      };
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      logger.error("Error agregando miembro:", error);
      throw new AuthError("Error al agregar miembro", "ADD_MEMBER_ERROR", 500);
    }
  }
}
export const workspaceService = new WorkspaceService();
