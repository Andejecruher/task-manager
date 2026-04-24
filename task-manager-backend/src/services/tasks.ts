// services/tasks.ts
import { Task } from "@/database/models/Task";
import { Workspace } from "@/database/models/Workspace";
import { Board } from "@/database/models/Board";
import { User } from "@/database/models/User";
import { AuthError } from "@/types";
import { logger } from "@/utils/logger";
import { v4 as uuidv4 } from "uuid";

interface CreateTaskData {
  title: string;
  description?: string;
  status?: "todo" | "in_progress" | "review" | "done" | "blocked" | "cancelled";
  priority?: "low" | "medium" | "high" | "urgent";
  assignee_id?: string;
  assignee_ids?: string[];
  due_date?: Date;
  tags?: string[];
}

interface UpdateTaskData {
  title?: string;
  description?: string;
  status?: "todo" | "in_progress" | "review" | "done" | "blocked" | "cancelled";
  priority?: "low" | "medium" | "high" | "urgent";
  assignee_id?: string;
  assignee_ids?: string[];
  due_date?: Date;
  tags?: string[];
}

class TasksService {
  async createTask(
    data: CreateTaskData,
    workspaceId: string,
    companyId: string,
    userId: string,
  ): Promise<Task> {
    try {
      // 1. Verificar que el workspace existe
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

      // 2. Verificar que el usuario existe
      const user = await User.findByPk(userId);
      if (!user) {
        throw new AuthError("Usuario no encontrado", "USER_NOT_FOUND", 404);
      }

      // 3. Obtener o crear un board por defecto para el workspace
      let defaultBoard = await Board.findOne({
        where: {
          workspace_id: workspaceId,
        },
      });

      if (!defaultBoard) {
        defaultBoard = await Board.create({
          id: uuidv4(),
          workspace_id: workspaceId,
          company_id: companyId,
          name: "Default Board",
          created_by: userId,
          slug: "",
        });
        logger.info("Board por defecto creado", {
          boardId: defaultBoard.id,
          workspaceId,
          createdBy: userId,
        });
      }

      // 4. Crear la tarea
      const newTask = await Task.create({
        id: uuidv4(),
        company_id: companyId,
        workspace_id: workspaceId,
        board_id: defaultBoard.id,
        title: data.title,
        description: data.description,
        status: data.status || "todo",
        priority: data.priority || "medium",
        assignee_id: data.assignee_id,
        assignee_ids: data.assignee_ids || [],
        due_date: data.due_date,
        tags: data.tags || [],
        metadata: {},
        total_time_spent: 0,
        created_by: userId,
        created_at: new Date(),
        updated_at: new Date(),
      });

      logger.info("Tarea creada exitosamente", {
        taskId: newTask.id,
        workspaceId,
        boardId: defaultBoard.id,
        createdBy: userId,
        title: newTask.title,
      });

      return newTask;
    } catch (error) {
      if (error instanceof AuthError) throw error;

      logger.error("Error creando tarea:", error);
      throw new AuthError("Error creando tarea", "CREATE_TASK_ERROR", 500);
    }
  }

  async getTasksByWorkspaceId(workspaceId: string): Promise<Task[]> {
    try {
      const tasks = await Task.findAll({
        where: {
          workspace_id: workspaceId,
        },
        order: [["created_at", "DESC"]],
      });

      logger.info("Tareas obtenidas", {
        workspaceId,
        count: tasks.length,
      });

      return tasks;
    } catch (error) {
      logger.error("Error getting tasks:", error);
      throw new AuthError("Error obteniendo tareas", "GET_TASKS_ERROR", 500);
    }
  }

  async updateTask(
    taskId: string,
    data: UpdateTaskData,
    companyId: string,
    userId: string,
  ): Promise<Task> {
    try {
      // Buscar la tarea
      const task = await Task.findOne({
        where: {
          id: taskId,
          company_id: companyId,
        },
      });

      if (!task) {
        throw new AuthError("Tarea no encontrada", "TASK_NOT_FOUND", 404);
      }

      // Verificar que el usuario existe
      const user = await User.findByPk(userId);
      if (!user) {
        throw new AuthError("Usuario no encontrado", "USER_NOT_FOUND", 404);
      }

      // Actualizar solo los campos que vienen en data
      await task.update({
        ...data,
        updated_at: new Date(),
        updated_by: userId,
      });

      logger.info("Tarea actualizada", {
        taskId,
        updatedBy: userId,
        updatedFields: Object.keys(data),
      });

      return task;
    } catch (error) {
      if (error instanceof AuthError) throw error;
      logger.error("Error actualizando tarea:", error);
      throw new AuthError("Error actualizando tarea", "UPDATE_TASK_ERROR", 500);
    }
  }

  // services/tasks.ts - Reemplaza el método moveToNextStatus

  async moveToNextStatus(
    taskId: string,
    companyId: string,
    userId: string,
  ): Promise<Task> {
    try {
      // 1. Buscar la tarea
      const task = await Task.findOne({
        where: {
          id: taskId,
          company_id: companyId,
        },
      });

      if (!task) {
        throw new AuthError("Tarea no encontrada", "TASK_NOT_FOUND", 404);
      }

      // 2. Verificar que el usuario existe
      const user = await User.findByPk(userId);
      if (!user) {
        throw new AuthError("Usuario no encontrado", "USER_NOT_FOUND", 404);
      }

      // 3. Definir el ciclo de estados (en orden)
      const statusFlow = [
        "todo",
        "in_progress",
        "review",
        "done",
        "blocked",
        "cancelled",
      ];

      // 4. Encontrar el índice actual
      const currentIndex = statusFlow.indexOf(task.status);

      // 5. Calcular siguiente estado (cíclico: vuelve al inicio después del último)
      let nextStatus;
      if (currentIndex === statusFlow.length - 1) {
        // Si está en el último estado, vuelve al primero
        nextStatus = statusFlow[0];
      } else {
        // Sino, va al siguiente
        nextStatus = statusFlow[currentIndex + 1];
      }

      // 6. Actualizar la tarea al siguiente estado
      await task.update({
        status: nextStatus as
          | "todo"
          | "in_progress"
          | "review"
          | "done"
          | "blocked"
          | "cancelled",
        updated_at: new Date(),
        updated_by: userId,
      });

      logger.info("Tarea movida al siguiente estado (cíclico)", {
        taskId,
        fromStatus: task.status,
        toStatus: nextStatus,
        updatedBy: userId,
      });

      // Recargar la tarea con los datos actualizados
      await task.reload();

      return task;
    } catch (error) {
      if (error instanceof AuthError) throw error;
      logger.error("Error moviendo tarea al siguiente estado:", error);
      throw new AuthError(
        "Error moviendo tarea al siguiente estado",
        "MOVE_TASK_ERROR",
        500,
      );
    }
  }

  async deleteTask(
    taskId: string,
    companyId: string,
    userId: string,
  ): Promise<void> {
    try {
      // Buscar la tarea
      const task = await Task.findOne({
        where: {
          id: taskId,
          company_id: companyId,
        },
      });

      if (!task) {
        throw new AuthError("Tarea no encontrada", "TASK_NOT_FOUND", 404);
      }

      // Verificar que el usuario existe
      const user = await User.findByPk(userId);
      if (!user) {
        throw new AuthError("Usuario no encontrado", "USER_NOT_FOUND", 404);
      }

      // Soft delete (marca deleted_at con la fecha actual)
      await task.destroy();

      logger.info("Tarea eliminada", {
        taskId,
        deletedBy: userId,
      });
    } catch (error) {
      if (error instanceof AuthError) throw error;
      logger.error("Error eliminando tarea:", error);
      throw new AuthError("Error eliminando tarea", "DELETE_TASK_ERROR", 500);
    }
  }
}

export const tasksService = new TasksService();
