import { authApiClient } from "@/lib/api";
import { ApiResponse, Workspace } from "@/types";

interface WorkspaceResponse {
    "workspaces": Workspace[],
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