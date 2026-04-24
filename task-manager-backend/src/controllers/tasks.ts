import { tasksService } from "@/services/tasks";
import { AuthError, type AuthRequest } from "@/types";
import { logger } from "@/utils/logger";
import { plainToClass } from "class-transformer";
import {
  IsArray,
  IsDate,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  validate,
} from "class-validator";
import type { Request, Response } from "express";

// DTO para validar el ID del workspace
class WorkspaceIdParamsDTO {
  @IsUUID("4", { message: "El ID del workspace debe ser un UUID válido" })
  @IsNotEmpty({ message: "El ID es requerido" })
  id!: string;
}

class TaskIdParamsDTO {
  @IsUUID("4", { message: "El ID de la tarea debe ser un UUID válido" })
  @IsNotEmpty({ message: "El ID es requerido" })
  taskId!: string;
}

// DTO para crear tarea
class CreateTaskDTO {
  @IsUUID("4", { message: "El ID del workspace debe ser un UUID válido" })
  @IsNotEmpty({ message: "El ID del workspace es requerido" })
  workspace_id!: string;

  @IsString({ message: "El título debe ser un texto" })
  @IsNotEmpty({ message: "El título es requerido" })
  title!: string;

  @IsString({ message: "La descripción debe ser un texto" })
  @IsOptional()
  description?: string;

  @IsIn(["todo", "in_progress", "review", "done", "blocked", "cancelled"], {
    message: "Estado inválido",
  })
  @IsOptional()
  status?: "todo" | "in_progress" | "review" | "done" | "blocked" | "cancelled";

  @IsIn(["low", "medium", "high", "urgent"], {
    message: "Prioridad inválida",
  })
  @IsOptional()
  priority?: "low" | "medium" | "high" | "urgent";

  @IsUUID("4", { message: "assignee_id debe ser un UUID válido" })
  @IsOptional()
  assignee_id?: string;

  @IsArray({ message: "assignee_ids debe ser un array" })
  @IsOptional()
  assignee_ids?: string[];

  @IsDate({ message: "due_date debe ser una fecha válida" })
  @IsOptional()
  due_date?: Date;

  @IsArray({ message: "tags debe ser un array" })
  @IsOptional()
  tags?: string[];
}

class UpdateTaskDTO {
  @IsString({ message: "El título debe ser un texto" })
  @IsOptional()
  title?: string;

  @IsString({ message: "La descripción debe ser un texto" })
  @IsOptional()
  description?: string;

  @IsIn(["todo", "in_progress", "review", "done", "blocked", "cancelled"], {
    message: "Estado inválido",
  })
  @IsOptional()
  status?: "todo" | "in_progress" | "review" | "done" | "blocked" | "cancelled";

  @IsIn(["low", "medium", "high", "urgent"], {
    message: "Prioridad inválida",
  })
  @IsOptional()
  priority?: "low" | "medium" | "high" | "urgent";

  @IsUUID("4", { message: "assignee_id debe ser un UUID válido" })
  @IsOptional()
  assignee_id?: string;

  @IsArray({ message: "assignee_ids debe ser un array" })
  @IsOptional()
  assignee_ids?: string[];

  @IsDate({ message: "due_date debe ser una fecha válida" })
  @IsOptional()
  due_date?: Date;

  @IsArray({ message: "tags debe ser un array" })
  @IsOptional()
  tags?: string[];
}

export class TasksController {
  async createTask(req: Request, res: Response) {
    try {
      // Validar el body
      const bodyDto = plainToClass(CreateTaskDTO, req.body);
      const bodyErrors = await validate(bodyDto);

      if (bodyErrors.length > 0) {
        return res.status(400).apiValidationError(bodyErrors);
      }

      const authReq = req as AuthRequest;
      const companyId = authReq.company?.id;
      const userId = authReq.user?.id;
      const workspaceId = bodyDto.workspace_id;

      if (!companyId) {
        return res
          .status(400)
          .apiError("No se pudo identificar la compañía", 400);
      }

      if (!userId) {
        return res.status(400).apiError("Usuario no autenticado", 400);
      }

      // Crear la tarea
      const newTask = await tasksService.createTask(
        {
          title: bodyDto.title,
          description: bodyDto.description,
          status: bodyDto.status || "todo",
          priority: bodyDto.priority || "medium",
          assignee_id: bodyDto.assignee_id,
          assignee_ids: bodyDto.assignee_ids || [],
          due_date: bodyDto.due_date,
          tags: bodyDto.tags || [],
        },
        workspaceId,
        companyId,
        userId,
      );

      return res.status(201).apiSuccess(newTask, "Tarea creada exitosamente");
    } catch (error) {
      logger.error("Error creating task:", String(error));

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

  async getTasksByWorkspaceId(req: Request, res: Response) {
    try {
      // Validar el parámetro ID del workspace
      const paramsDto = plainToClass(WorkspaceIdParamsDTO, req.params);
      const paramsErrors = await validate(paramsDto);

      if (paramsErrors.length > 0) {
        return res.status(400).apiValidationError(paramsErrors);
      }

      const authReq = req as AuthRequest;
      const companyId = authReq.company?.id;

      if (!companyId) {
        return res
          .status(400)
          .apiError("No se pudo identificar la compañía", 400);
      }

      const tasks = await tasksService.getTasksByWorkspaceId(paramsDto.id);

      return res.status(200).apiSuccess(tasks, "Tareas obtenidas exitosamente");
    } catch (error) {
      logger.error("Error getting tasks:", String(error));

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

  async updateTask(req: Request, res: Response) {
    try {
      // Validar el ID de la tarea
      const paramsDto = plainToClass(TaskIdParamsDTO, req.params);
      const paramsErrors = await validate(paramsDto);

      if (paramsErrors.length > 0) {
        return res.status(400).apiValidationError(paramsErrors);
      }

      // Validar el body (todos los campos son opcionales)
      const bodyDto = plainToClass(UpdateTaskDTO, req.body);
      const bodyErrors = await validate(bodyDto);

      if (bodyErrors.length > 0) {
        return res.status(400).apiValidationError(bodyErrors);
      }

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

      const updatedTask = await tasksService.updateTask(
        paramsDto.taskId,
        bodyDto,
        companyId,
        userId,
      );

      return res
        .status(200)
        .apiSuccess(updatedTask, "Tarea actualizada exitosamente");
    } catch (error) {
      logger.error("Error updating task:", String(error));
      if (error instanceof AuthError) {
        return res.status(error.statusCode).apiError(error.message);
      }
      return res.status(500).apiError("Error interno del servidor");
    }
  }

  async moveToNextStatus(req: Request, res: Response) {
    try {
      // Validar el ID de la tarea
      const paramsDto = plainToClass(TaskIdParamsDTO, req.params);
      const paramsErrors = await validate(paramsDto);

      if (paramsErrors.length > 0) {
        return res.status(400).apiValidationError(paramsErrors);
      }

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

      // Llamar al servicio para mover al siguiente estado
      const updatedTask = await tasksService.moveToNextStatus(
        paramsDto.taskId,
        companyId,
        userId,
      );

      return res
        .status(200)
        .apiSuccess(
          updatedTask,
          "Tarea movida al siguiente estado exitosamente",
        );
    } catch (error) {
      logger.error("Error moving task to next status:", String(error));

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

  async deleteTask(req: Request, res: Response) {
    try {
      // Validar el ID de la tarea
      const paramsDto = plainToClass(TaskIdParamsDTO, req.params);
      const paramsErrors = await validate(paramsDto);

      if (paramsErrors.length > 0) {
        return res.status(400).apiValidationError(paramsErrors);
      }

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

      await tasksService.deleteTask(paramsDto.taskId, companyId, userId);

      return res.status(200).apiSuccess(null, "Tarea eliminada exitosamente");
    } catch (error) {
      logger.error("Error deleting task:", String(error));
      if (error instanceof AuthError) {
        return res.status(error.statusCode).apiError(error.message);
      }
      return res.status(500).apiError("Error interno del servidor");
    }
  }
}

export const tasksController = new TasksController();
