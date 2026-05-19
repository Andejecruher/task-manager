"use client";

import {
  createWorkspace as createWorkspaceService,
  getWorkspaceById,
  getWorkspaces,
  updateWorkspace as updateWorkspaceService,
  deleteWorkspace as deleteWorkspaceService,
  getWorkspaceUsers as getWorkspaceUsersService,
} from "@/services/workspace";
import { ApiErrorResponse, Task, Workspace, User } from "@/types";
import { createContext, useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";

interface WorkspaceContextType {
  workspaces: Workspace[];
  workspaceId: string | undefined;
  workspace: Workspace | null;
  tasks: Task[];
  users: User[]; // agregue users al contexto para que esté disponible globalmente
  loading: boolean;
  setWorkspaceId: (id: string | undefined) => void;
  createWorkspace: (data: {
    name: string;
    slug: string;
    description?: string;
    icon?: string;
    color?: string;
  }) => Promise<Workspace | null>;
  updateWorkspace: (
    id: string,
    data: {
      name?: string;
      slug?: string;
      description?: string;
      icon?: string;
      color?: string;
    },
  ) => Promise<Workspace | null>;
  deleteWorkspace: (id: string) => Promise<void>;
}

export const WorkspaceContext = createContext<WorkspaceContextType | undefined>(
  undefined,
);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [workspaceId, setWorkspaceId] = useState<string | undefined>(undefined);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]); //user state para almacenar usuarios del workspace
  const [loading, setLoading] = useState(false);

  // Cargar workspaces
  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        setLoading(true);
        const response = await getWorkspaces();
        if (response.success) {
          setWorkspaces(response.data.workspaces);
        } else {
          toast.error("Failed to load workspaces: " + response.error);
        }
      } catch (err: ApiErrorResponse | any) {
        if (err.error) {
          toast.error(err?.message || err.error);
        } else {
          toast.error("An unexpected error occurred. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (workspaces.length === 0) {
      fetchWorkspaces();
    }
  }, []);

  // Cargar tareas del workspace
  useEffect(() => {
    const fetchWorkspaceTasks = async () => {
      if (!workspaceId) return;
      try {
        setLoading(true);
        const response = await getWorkspaceById(workspaceId);
        if (response.success) {
          // setTasks(response.data.tasks);
        } else {
          toast.error("Failed to load workspace tasks: " + response.error);
        }
      } catch (err: ApiErrorResponse | any) {
        if (err.error) {
          toast.error(err?.message || err.error);
        } else {
          toast.error("An unexpected error occurred. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspaceTasks();
  }, [workspaceId]);

  //Cargar usuarios del workspace
  useEffect(() => {
    const fetchUsers = async () => {
      if (!workspaceId) return;

      try {
        const response = await getWorkspaceUsersService(workspaceId);

        if (response.success) {
          const data: any = response.data;
          let membersArray: any[] = [];

          if (Array.isArray(data)) {
            membersArray = data;
          } else if (data?.assigned || data?.available) {
            membersArray = [
              ...(data.assigned || []),
              ...(data.available || []),
            ];
          }

          const normalizedUsers: User[] = membersArray
            .map((member: any) => ({
              id: member.userId || member.user?.id || member.id,
              fullName:
                member.user?.full_name ||
                member.user?.fullName ||
                member.fullName ||
                member.name ||
                member.user?.email,
              email: member.user?.email || member.email,
              role: member.role || member.user?.role,
              avatarUrl: member.user?.avatar_url || member.avatarUrl,
              companyId:
                member.user?.companyId ||
                member.companyId ||
                member.user?.company_id ||
                "",
              emailVerified:
                member.user?.emailVerified ??
                member.user?.email_verified ??
                member.emailVerified ??
                false,
              created_at:
                member.user?.created_at ||
                member.user?.createdAt ||
                member.created_at ||
                new Date().toISOString(),
              updated_at:
                member.user?.updated_at ||
                member.user?.updatedAt ||
                member.updated_at ||
                new Date().toISOString(),
            }))
            .filter((user) => user.id);

          setUsers(normalizedUsers);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, [workspaceId]);

  const createWorkspace = async (workspaceData: {
    name: string;
    slug: string;
    description?: string;
    icon?: string;
    color?: string;
  }): Promise<Workspace | null> => {
    try {
      setLoading(true);
      const response = await createWorkspaceService({
        name: workspaceData.name,
        slug: workspaceData.slug,
        description: workspaceData.description,
        icon: workspaceData.icon,
        color: workspaceData.color,
      });

      if (response.success) {
        setWorkspaces((prev) => [response.data, ...prev]);
        toast.success("Workspace created successfully");
        return response.data;
      } else {
        toast.error("Failed to create workspace: " + response.error);
        return null;
      }
    } catch (err: ApiErrorResponse | any) {
      toast.error(err?.message || "An unexpected error occurred");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateWorkspace = async (
    id: string,
    data: {
      name?: string;
      slug?: string;
      description?: string;
      icon?: string;
      color?: string;
    },
  ): Promise<Workspace | null> => {
    try {
      setLoading(true);
      const response = await updateWorkspaceService(id, data);

      if (response.success) {
        setWorkspaces((prev) =>
          prev.map((ws) => (ws.id === id ? response.data : ws)),
        );
        toast.success("Workspace updated successfully");
        return response.data;
      } else {
        toast.error("Failed to update workspace: " + response.error);
        return null;
      }
    } catch (err: ApiErrorResponse | any) {
      toast.error(err?.message || "An unexpected error occurred");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteWorkspace = async (id: string): Promise<void> => {
    try {
      setLoading(true);
      const response = await deleteWorkspaceService(id);

      if (response.success) {
        setWorkspaces((prev) => prev.filter((ws) => ws.id !== id));
        toast.success("Workspace deleted successfully");
      } else {
        toast.error("Failed to delete workspace: " + response.error);
      }
    } catch (err: ApiErrorResponse | any) {
      toast.error(err?.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        tasks,
        users,
        loading,
        workspace,
        workspaceId,
        createWorkspace,
        updateWorkspace,
        deleteWorkspace,
        setWorkspaceId,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}
