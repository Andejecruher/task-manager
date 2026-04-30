// hooks/use-team.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { authApiClient } from "@/lib/api";
import { toast } from "sonner";
import type { UserRole } from "@/lib/types";

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyId: string;
  createdAt: string;
  avatar?: string;
}

export function useTeam(companyId: string | undefined) {
  const [users, setUsers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);

  // Cargar usuarios del equipo
  const loadUsers = useCallback(async () => {
    if (!companyId) {
      return;
    }

    try {
      setLoading(true);
      const response = await authApiClient.get(`/company/${companyId}/users`);
      const userList = response.data.data || [];
      setUsers(userList);
    } catch (error) {
      console.error("Error loading users:", error);
      toast.error("Failed to load team members");
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  // Agregar usuario
  const addUser = useCallback(
    async (data: { email: string; name: string; role: UserRole }) => {
      if (!companyId) {
        toast.error("No company selected");
        return;
      }

      try {
        setLoading(true);
        await authApiClient.post(`/company/${companyId}/users`, {
          email: data.email,
          name: data.name,
          role: data.role,
        });
        toast.success("User added successfully");
        await loadUsers();
      } catch (error: any) {
        console.error("Error adding user:", error);
        toast.error(error.response?.data?.message || "Failed to add user");
      } finally {
        setLoading(false);
      }
    },
    [companyId, loadUsers],
  );

  // Actualizar rol
  const updateUserRole = useCallback(
    async (userId: string, role: UserRole) => {
      try {
        setLoading(true);
        await authApiClient.patch(`/users/${userId}/role`, { role });
        toast.success("Role updated successfully");
        await loadUsers();
      } catch (error: any) {
        console.error("Error updating role:", error);
        toast.error(error.response?.data?.message || "Failed to update role");
      } finally {
        setLoading(false);
      }
    },
    [loadUsers],
  );

  // Eliminar usuario
  const deleteUser = useCallback(
    async (userId: string) => {
      try {
        setLoading(true);
        await authApiClient.delete(`/users/${userId}`);
        toast.success("User removed successfully");
        await loadUsers();
      } catch (error: any) {
        console.error("Error deleting user:", error);
        toast.error(error.response?.data?.message || "Failed to remove user");
      } finally {
        setLoading(false);
      }
    },
    [loadUsers],
  );

  useEffect(() => {
    if (companyId) {
      loadUsers();
    }
  }, [companyId, loadUsers]);

  return {
    users,
    loading,
    addUser,
    updateUserRole,
    deleteUser,
    refreshUsers: loadUsers,
  };
}
