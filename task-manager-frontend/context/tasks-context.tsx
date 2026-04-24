"use client";

import { useWorkspace } from "@/hooks/use-workspace";
import {
  createTask as createTaskService,
  deleteTask as deleteTaskService,
  getTasks,
  moveToNextStatus as moveTask,
  updateTask as updateTaskService,
} from "@/services/tasks";
import { ApiErrorResponse, Task } from "@/types";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";

interface TaskContextType {
  tasks: Task[];
  loading: boolean;
  createTask: (data: any) => Promise<Task | null>;
  updateTask: (id: string, data: any) => Promise<Task | null>;
  deleteTask: (id: string) => Promise<boolean>;
  moveToNextStatus: (id: string) => Promise<Task | null>;
  refreshTasks: () => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: ReactNode }) {
  const { workspaceId } = useWorkspace();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshTasks = useCallback(async () => {
    if (!workspaceId) {
      setTasks([]);
      return;
    }

    try {
      setLoading(true);
      const response = await getTasks(workspaceId);
      if (response.success) {
        const tasksArray = Array.isArray(response.data) ? response.data : [];
        setTasks(tasksArray);
      } else {
        toast.error("Failed to load tasks: " + response.error);
        setTasks([]);
      }
    } catch (err: ApiErrorResponse | any) {
      toast.error(err?.message || "An unexpected error occurred");
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  // Cargar tareas automáticamente al montar o cambiar workspace
  useEffect(() => {
    refreshTasks();
  }, [refreshTasks]);

  // Crear tarea
  const createTask = async (data: any): Promise<Task | null> => {
    if (!workspaceId) {
      toast.error("No workspace selected");
      return null;
    }

    try {
      setLoading(true);

      const response = await createTaskService(workspaceId, {
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
      });

      if (response.success) {
        setTasks((prev) => {
          const currentTasks = Array.isArray(prev) ? prev : [];
          return [...currentTasks, response.data];
        });
        toast.success("Task created successfully");
        return response.data;
      } else {
        toast.error("Failed to create task: " + response.error);
        return null;
      }
    } catch (err: any) {
      console.error("Create task error:", err);
      toast.error(err?.message || "An unexpected error occurred");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const moveToNextStatus = async (id: string): Promise<Task | null> => {
    try {
      setLoading(true);
      const response = await moveTask(id);

      if (response.success) {
        setTasks((prev) =>
          prev.map((task) => (task.id === id ? response.data : task)),
        );
        toast.success("Task moved to next status successfully");
        return response.data;
      } else {
        toast.error("Failed to move task: " + response.error);
        return null;
      }
    } catch (err: any) {
      console.error("Move task error:", err);
      toast.error(err?.message || "An unexpected error occurred");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateTask = async (id: string, data: any): Promise<Task | null> => {
    try {
      setLoading(true);
      const response = await updateTaskService(id, data);

      if (response.success) {
        setTasks((prev) =>
          prev.map((task) => (task.id === id ? response.data : task)),
        );
        toast.success("Task updated successfully");
        return response.data;
      } else {
        toast.error("Failed to update task: " + response.error);
        return null;
      }
    } catch (err: any) {
      console.error("Update task error:", err);
      toast.error(err?.message || "An unexpected error occurred");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await deleteTaskService(id);

      if (response.success) {
        setTasks((prev) => prev.filter((task) => task.id !== id));
        toast.success("Task deleted successfully");
        return true;
      } else {
        toast.error("Failed to delete task: " + response.error);
        return false;
      }
    } catch (err: any) {
      console.error("Delete task error:", err);
      toast.error(err?.message || "An unexpected error occurred");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        loading,
        createTask,
        updateTask,
        deleteTask,
        refreshTasks,
        moveToNextStatus,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTask() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error("useTask must be used within a TaskProvider");
  }
  return context;
}
