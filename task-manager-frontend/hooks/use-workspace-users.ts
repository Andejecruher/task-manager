"use client";

import {
    assignUsersToWorkspace,
    getWorkspaceUsers,
    unassignUsersFromWorkspace,
} from "@/services/workspace";
import {
    WorkspaceUsersResponse
} from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useWorkspaceUsers(workspaceId: string | undefined) {
    return useQuery<WorkspaceUsersResponse>({
        queryKey: ["workspace-users", workspaceId],
        queryFn: async () => {
            const response = await getWorkspaceUsers(workspaceId!);
            return response.data as WorkspaceUsersResponse;
        },
        enabled: Boolean(workspaceId),
        staleTime: 30_000,
    });
}

export function useAssignUsersToWorkspace(workspaceId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (userIds: string[]) =>
            assignUsersToWorkspace(workspaceId, userIds),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["workspace-users", workspaceId],
            });
            toast.success("Usuario asignado exitosamente");
        },
        onError: (error: any) => {
            toast.error(
                error?.message || "Error al asignar el usuario. Intentá de nuevo.",
            );
        },
    });
}

export function useUnassignUsersFromWorkspace(workspaceId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (userIds: string[]) =>
            unassignUsersFromWorkspace(workspaceId, userIds),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["workspace-users", workspaceId],
            });
            toast.success("Usuario desasignado exitosamente");
        },
        onError: (error: any) => {
            toast.error(
                error?.message || "Error al desasignar el usuario. Intentá de nuevo.",
            );
        },
    });
}
