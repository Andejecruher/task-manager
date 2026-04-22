import { authApiClient } from "@/lib/api";
import { ApiResponse, Task } from "@/types";

// Crear una nueva tarea
export async function createTask(
  workspaceId: string,
  data: {
    title: string;
    description?: string;
    status?: string;
    priority?: string;
    due_date?: Date;
    board_id?: string;
  },
): Promise<ApiResponse<Task>> {
  return await authApiClient
    .post(`/task`, {
      ...data,
      workspace_id: workspaceId,
    })
    .then((response) => response.data)
    .catch((error) => {
      throw error.response?.data;
    });
}

// Obtener tareas de un workspace
export async function getTasks(
  workspaceId: string,
): Promise<ApiResponse<{ tasks: Task[] }>> {
  return await authApiClient
    .get(`/workspace/${workspaceId}/tasks`)
    .then((response) => response.data)
    .catch((error) => {
      throw error.response?.data;
    });
}

// Actualizar tarea
export async function updateTask(
  taskId: string,
  data: {
    title?: string;
    description?: string;
    status?: string;
    priority?: string;
    assignee_id?: string;
    due_date?: string;
    tags?: string[];
  },
): Promise<ApiResponse<Task>> {
  return await authApiClient
    .put(`/tasks/${taskId}`, data)
    .then((response) => response.data)
    .catch((error) => {
      throw error.response?.data;
    });
}

// Eliminar tarea
export async function deleteTask(taskId: string): Promise<ApiResponse<null>> {
  return await authApiClient
    .delete(`/tasks/${taskId}`)
    .then((response) => response.data)
    .catch((error) => {
      throw error.response?.data;
    });
}
