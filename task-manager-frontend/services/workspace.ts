import { authApiClient } from "@/lib/api";
import { ApiResponse, Task, Workspace } from "@/types";

interface WorkspaceResponse {
    "workspaces": Workspace[],
    "total": number,
    "limit": number,
    "offset": number,
    "hasMore": boolean
}

interface TasksByWorkspaceResponse {
    "tasks": Task[],
    "total": number,
    "limit": number,
    "offset": number,
    "hasMore": boolean
}


export async function getWorkspaces(): Promise<ApiResponse<WorkspaceResponse>> {
    return await authApiClient.get("/workspace").then((response) => {
        return response.data;
    }).catch((error) => {
        throw error.response?.data;
    });
}

export async function getWorkspaceById(id: string): Promise<ApiResponse<{ tasks: Task[] }>> {
    return await authApiClient.get(`/workspace/${id}/tasks`).then((response) => {
        return response.data;
    }).catch((error) => {
        throw error.response?.data;
    });
}