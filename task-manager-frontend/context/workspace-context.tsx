"use client";

import { getWorkspaceById, getWorkspaces } from "@/services/workspace";
import { ApiErrorResponse, Task, Workspace } from "@/types";
import {
    createContext,
    useEffect,
    useState,
    type ReactNode
} from "react";
import { toast } from "sonner";

interface WorkspaceContextType {
    workspaces: Workspace[]
    workspaceId: string | undefined
    tasks: Task[]
    loading: boolean
    setWorkspaceId: (id: string | undefined) => void
}

export const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

// ── Provider ─────────────────────────────────────────────────────────────────

export function WorkspaceProvider({ children }: { children: ReactNode }) {
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [workspaceId, setWorkspaceId] = useState<string | undefined>(undefined);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(false);

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
                setLoading(false);
            } catch (err: ApiErrorResponse | any) {
                if (err.error) {
                    toast.error(err?.message || err.error);
                } else {
                    toast.error("An unexpected error occurred. Please try again.");
                }
                setLoading(false);
            }
        };

        if (workspaces.length === 0) {
            fetchWorkspaces();
        }
    }, [])

    useEffect(() => {
        const fetchWorkspaceTasks = async () => {
            if (!workspaceId) return;
            try {
                setLoading(true);
                const response = await getWorkspaceById(workspaceId);
                if (response.success) {
                    // You can set the tasks in a separate state if needed
                    // setTasks(response.data.tasks);
                } else {
                    toast.error("Failed to load workspace tasks: " + response.error);
                }
                setLoading(false);
            } catch (err: ApiErrorResponse | any) {
                if (err.error) {
                    toast.error(err?.message || err.error);
                } else {
                    toast.error("An unexpected error occurred. Please try again.");
                }
                setLoading(false);
            }
        };

        fetchWorkspaceTasks();
    }, [workspaceId])


    return (
        <WorkspaceContext.Provider value={{ workspaces, tasks, loading, workspaceId, setWorkspaceId }}>
            {children}
        </WorkspaceContext.Provider>
    );
}
