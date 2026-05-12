import { authApiClient } from "@/lib/api";
import { ApiResponse } from "@/types";

export async function getCompanyUsers(): Promise<ApiResponse<unknown[]>> {
    return await authApiClient
        .get("/user")
        .then((response) => response.data)
        .catch((error) => {
            throw error.response?.data;
        });
}

export async function getUserWorkspaces(
    userId: string,
): Promise<ApiResponse<{ assigned: unknown[]; available: unknown[] }>> {
    return await authApiClient
        .get(`/user/${userId}/workspaces`)
        .then((response) => response.data)
        .catch((error) => {
            throw error.response?.data;
        });
}

export async function assignWorkspacesToUser(
    userId: string,
    workspaceIds: string[],
): Promise<ApiResponse<{ assigned: number }>> {
    return await authApiClient
        .post(`/user/${userId}/assign-workspaces`, { workspaceIds })
        .then((response) => response.data)
        .catch((error) => {
            throw error.response?.data;
        });
}

export async function unassignWorkspacesFromUser(
    userId: string,
    workspaceIds: string[],
): Promise<ApiResponse<{ removed: number }>> {
    return await authApiClient
        .delete(`/user/${userId}/unassign-workspaces`, {
            data: { workspaceIds },
        })
        .then((response) => response.data)
        .catch((error) => {
            throw error.response?.data;
        });
}
