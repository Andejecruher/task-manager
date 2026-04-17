import { authApiClient } from "@/lib/api";
import { ApiResponse, Task, Workspace } from "@/types";

interface WorkspaceResponse {
  workspaces: Workspace[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

interface TasksByWorkspaceResponse {
  tasks: Task[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export async function getWorkspaces(): Promise<ApiResponse<WorkspaceResponse>> {
  return await authApiClient
    .get("/workspace")
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      throw error.response?.data;
    });
}

export async function getWorkspaceById(
  id: string,
): Promise<ApiResponse<{ tasks: Task[] }>> {
  return await authApiClient
    .get(`/workspace/${id}/tasks`)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      throw error.response?.data;
    });
}

export async function createWorkspace(data: {
  name: string;
  description?: string;
  slug?: string;
  icon?: string;
  color?: string;
}): Promise<ApiResponse<Workspace>> {
  return await authApiClient
    .post("/workspace", data)
    .then((response) => response.data)
    .catch((error) => {
      throw error.response?.data;
    });
}

export async function updateWorkspace(
  id: string,
  data: {
    name?: string;
    description?: string;
    slug?: string;
    icon?: string;
    color?: string;
  },
): Promise<ApiResponse<Workspace>> {
  return await authApiClient
    .put(`/workspace/${id}`, data)
    .then((response) => response.data)
    .catch((error) => {
      throw error.response?.data;
    });
}

export async function deleteWorkspace(id: string): Promise<ApiResponse> {
  return await authApiClient
    .delete(`/workspace/${id}`)
    .then((response) => response.data)
    .catch((error) => {
      throw error.response?.data;
    });
}
