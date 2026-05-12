// hooks/use-team.ts - MODIFICADO
"use client";

import { useState, useEffect, useCallback } from "react";
import { authApiClient } from "@/lib/api";
import { toast } from "sonner";
import type { UserRole } from "@/lib/types";
import { addWorkspaceMember, getWorkspaceMembers } from "@/services/workspace";

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  workspaceId: string;
  createdAt: string;
  avatar?: string;
}

export function useTeam(workspaceId: string | undefined) {
  const [users, setUsers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);

  // Cargar usuarios del workspace
  const loadUsers = useCallback(async () => {
    if (!workspaceId) {
      console.log("❌ No workspaceId provided");
      return;
    }

    try {
      setLoading(true);
      console.log("📥 Loading members for workspace:", workspaceId);

      const response = await authApiClient.get(`/workspace/wmembers`, {
        params: { workspaceId: workspaceId },
      });

      console.log("📥 Response:", response.data);

      const userList =
        response.data.data || response.data.members || response.data || [];
      setUsers(userList);
    } catch (error) {
      console.error("Error loading users:", error);
      toast.error("Failed to load team members");
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  // Agregar usuario
  const addUser = useCallback(
    async (data: { email: string; name: string; role: UserRole }) => {
      console.log("🔍 addUser - workspaceId recibido:", workspaceId);

      if (!workspaceId) {
        toast.error("No workspace selected");
        console.log("❌ workspaceId es undefined");
        return;
      }

      try {
        setLoading(true);
        await authApiClient.post(`/workspace/${workspaceId}/members`, {
          email: data.email,
          name: data.name,
          role: data.role,
        });

        toast.success("User added successfully");
        await loadUsers();
      } catch (error: any) {
        console.error("❌ Error adding user:", error);
        console.error("❌ Response:", error.response?.data);
        toast.error(error.response?.data?.message || "Failed to add user");
      } finally {
        setLoading(false);
      }
    },
    [workspaceId, loadUsers],
  );

  // Actualizar rol
  const updateUserRole = useCallback(
    async (userId: string, role: UserRole) => {
      if (!workspaceId) return;

      try {
        setLoading(true);
        await authApiClient.patch(`/workspace/members/${userId}`, {
          role: role.toLowerCase(),
          workspaceId: workspaceId,
        });
        toast.success("Role updated successfully");
        await loadUsers();
      } catch (error: any) {
        console.error("Error updating role:", error);
        toast.error(error.response?.data?.message || "Failed to update role");
      } finally {
        setLoading(false);
      }
    },
    [workspaceId, loadUsers],
  );

  //aun no se implementan
  // Eliminar usuario
  const deleteUser = useCallback(
    async (userId: string) => {
      if (!workspaceId) return;

      try {
        setLoading(true);
        await authApiClient.delete(`/workspace/members/${userId}`, {
          data: { workspaceId: workspaceId },
        });
        toast.success("User removed successfully");
        await loadUsers();
      } catch (error: any) {
        console.error("Error deleting user:", error);
        toast.error(error.response?.data?.message || "Failed to remove user");
      } finally {
        setLoading(false);
      }
    },
    [workspaceId, loadUsers],
  );

  useEffect(() => {
    if (workspaceId) {
      loadUsers();
    }
  }, [workspaceId, loadUsers]);

  return {
    users,
    loading,
    addUser,
    updateUserRole,
    deleteUser,
    refreshUsers: loadUsers,
  };
}
