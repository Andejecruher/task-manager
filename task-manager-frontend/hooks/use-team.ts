"use client";

import { authApiClient } from "@/lib/api";
import type { UserRole } from "@/lib/types";
import { getCompanyUsers } from "@/services/user";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface TeamMember {
  id: string;
  name?: string;
  full_name?: string;
  email: string;
  role: string;
  avatar_url?: string;
  avatar?: string;
  is_active?: boolean;
  createdAt?: string;
  created_at?: string;
}

export function useTeam() {
  const queryClient = useQueryClient();

  const { data, isLoading: loading } = useQuery<TeamMember[]>({
    queryKey: ["company-users"],
    queryFn: async () => {
      const response = await getCompanyUsers();
      if (!response.success) return [];
      return (response.data as TeamMember[]) ?? [];
    },
    staleTime: 30_000,
  });

  const users: TeamMember[] = data ?? [];

  const addUserMutation = useMutation({
    mutationFn: (payload: { email: string; name: string; role: UserRole }) =>
      authApiClient.post("/user", {
        email: payload.email,
        fullName: payload.name,
        role: payload.role.toLowerCase(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-users"] });
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: UserRole }) =>
      authApiClient.patch(`/user/${userId}/rol`, { role: role.toLowerCase() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-users"] });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => authApiClient.delete(`/user/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-users"] });
    },
  });

  const addUser = async (data: { email: string; name: string; role: UserRole }) => {
    await addUserMutation.mutateAsync(data);
  };

  const updateUserRole = async (userId: string, role: UserRole) => {
    await updateRoleMutation.mutateAsync({ userId, role });
  };

  const deleteUser = async (userId: string) => {
    await deleteUserMutation.mutateAsync(userId);
  };

  return {
    users,
    loading,
    addUser,
    updateUserRole,
    deleteUser,
  };
}

