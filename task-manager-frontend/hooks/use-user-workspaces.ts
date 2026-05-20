"use client";

import {
  assignWorkspacesToUser,
  getUserWorkspaces,
  unassignWorkspacesFromUser,
} from "@/services/user";
import { UserWorkspacesResponse } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useUserWorkspaces(userId: string | undefined) {
  return useQuery<UserWorkspacesResponse>({
    queryKey: ["user-workspaces", userId],
    queryFn: async () => {
      const response = await getUserWorkspaces(userId!);
      if (response.success) {
        return response.data as UserWorkspacesResponse;
      }
      throw new Error(response.error || "Error fetching user workspaces");
    },
    enabled: Boolean(userId),
    staleTime: 30_000,
  });
}

export function useAssignWorkspacesToUser(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (workspaceIds: string[]) =>
      assignWorkspacesToUser(userId, workspaceIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-workspaces", userId] });
      toast.success("Workspace asignado exitosamente");
    },
    onError: (error: any) => {
      toast.error(
        error?.message || "Error al asignar el workspace. Intentá de nuevo.",
      );
    },
  });
}

export function useUnassignWorkspacesFromUser(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (workspaceIds: string[]) =>
      unassignWorkspacesFromUser(userId, workspaceIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-workspaces", userId] });
      toast.success("Workspace desasignado exitosamente");
    },
    onError: (error: any) => {
      toast.error(
        error?.message || "Error al desasignar el workspace. Intentá de nuevo.",
      );
    },
  });
}
