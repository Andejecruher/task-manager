"use client";

import { CreateTaskDialog } from "@/components/create-task-dialog";
import { TaskCard } from "@/components/task-card";
import { TaskDetailsDialog } from "@/components/task-details-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/auth-context";
import { useTask } from "@/hooks/use-task";
import { useWorkspace } from "@/hooks/use-workspace";
import { STATUS_LABELS, STATUS_ORDER } from "@/lib/schemas";
import type { TaskStatus } from "@/lib/types";
import type { Task } from "@/types/task";
import { AlertCircle, ArrowLeft, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

export default function WorkspaceBoardPage() {
  const params = useParams();
  const { user } = useAuth();
  const { workspaces, setWorkspaceId } = useWorkspace();
  const { tasks, loading, updateTask, refreshTasks } = useTask();

  const workspaceId = params.workspaceId as string;
  const workspace = workspaces.find((w) => w.id === workspaceId);

  const hasLoaded = useRef(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  useEffect(() => {
    if (workspaceId && !hasLoaded.current) {
      hasLoaded.current = true;
      setWorkspaceId(workspaceId);
      refreshTasks();
    }
  }, [workspaceId, setWorkspaceId]);

  const workspaceTasks = useMemo(
    () => (tasks ?? []).filter((t) => t.workspace_id === workspaceId),
    [tasks, workspaceId],
  );

  const filteredTasks = useMemo(() => {
    if (!searchQuery.trim()) return workspaceTasks;
    const q = searchQuery.toLowerCase();
    return workspaceTasks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.description ?? "").toLowerCase().includes(q) ||
        (t.tags ?? []).some((tag) => tag.toLowerCase().includes(q)),
    );
  }, [workspaceTasks, searchQuery]);

  const tasksByStatus = useMemo(
    () =>
      STATUS_ORDER.reduce(
        (acc, s) => {
          acc[s] = filteredTasks.filter((t) => t.status === s);
          return acc;
        },
        {} as Record<TaskStatus, Task[]>,
      ),
    [filteredTasks],
  );

  const handleDragStart = (task: Task) => setDraggedTask(task);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (status: TaskStatus) => {
    if (draggedTask && draggedTask.status !== status) {
      updateTask(draggedTask.id, { status });
    }
    setDraggedTask(null);
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setDialogOpen(true);
  };

  const colorMap: Record<TaskStatus, string> = {
    todo: "bg-slate-500",
    in_progress: "bg-blue-500",
    in_review: "bg-purple-500",
    done: "bg-emerald-500",
    blocked: "bg-red-500",
    cancelled: "bg-gray-500",
  };

  if (loading && tasks.length === 0) {
    return (
      <div className="max-w-450 mx-auto space-y-6 p-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-450 mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link href={`/${user?.company?.slug}/workspaces`}>
            <Button variant="ghost" size="sm" className="gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              Workspaces
            </Button>
          </Link>
          <span className="text-muted-foreground">/</span>
          <h1 className="text-2xl font-bold text-balance">
            {workspace?.name ?? workspaceId}
          </h1>
        </div>

        {!workspace && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Workspace not found. It may have been removed or you may not have
              access.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Badge variant="secondary" className="text-sm">
            {workspaceTasks.length}{" "}
            {workspaceTasks.length === 1 ? "task" : "tasks"}
          </Badge>
          <CreateTaskDialog workspaceId={workspaceId} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STATUS_ORDER.map((status) => (
            <div
              key={status}
              className="flex flex-col min-h-125"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(status)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${colorMap[status]}`} />
                  <h3 className="font-semibold text-sm">
                    {STATUS_LABELS[status]}
                  </h3>
                  <Badge variant="secondary" className="text-xs">
                    {tasksByStatus[status]?.length ?? 0}
                  </Badge>
                </div>
                <CreateTaskDialog
                  defaultStatus={status}
                  workspaceId={workspaceId}
                  trigger={
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                      <Plus className="h-4 w-4" />
                    </Button>
                  }
                />
              </div>

              <div className="flex-1 space-y-3 bg-muted/30 rounded-lg p-3 border-2 border-dashed border-border">
                {tasksByStatus[status]?.length === 0 ? (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    No tasks
                  </div>
                ) : (
                  tasksByStatus[status]?.map((task) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={() => handleDragStart(task)}
                      className="cursor-move"
                    >
                      <TaskCard
                        task={task}
                        assignee={undefined}
                        onClick={() => handleTaskClick(task)}
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <TaskDetailsDialog
        task={selectedTask}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
}
