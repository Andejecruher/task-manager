"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Empty } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import FormWorkspace from "@/components/workspaces/form-workspace";
import { useAuth } from "@/context/auth-context";
import { useWorkspace } from "@/hooks/use-workspace";
import { Workspace } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { Layers, ListTodo, MoreHorizontal, Pencil, Plus, Trash2, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function WorkspacesPage() {
  const { user } = useAuth();
  const {
    workspaces,
    loading,
    setWorkspaceId,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
  } = useWorkspace();
  const router = useRouter();

  // Estado para crear workspace
  const [workSpace, setWorkSpace] = useState<Workspace>({} as Workspace)
  const [open, setOpen] = useState(false);

  // Estado para eliminar workspace
  const [deleteTarget, setDeleteTarget] = useState<Workspace | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSelectWorkspace = (id: string) => {
    setWorkspaceId(id);
    router.push(`/${user?.company?.slug}/workspaces/${id}`);
  };

  // Guardar edición
  const handleSaveEdit = async (workspace: Workspace) => {
    if (!workspace.name.trim()) {
      toast.error("Workspace name is required");
      return;
    }
    await updateWorkspace(workspace!.id, workspace);
  };

  // Crear workspace
  const handleCreateWorkspace = async (workspace: Workspace) => {
    try {
      await createWorkspace(workspace);
      toast.success(`Workspace "${workspace.name}" created successfully!`);
    } catch (error) {
      toast.error("Failed to create workspace");
    }
  };

  const handleCreateOrEditWorkspace = async (workspace: Workspace) => {
    if (workspace.id) {
      // Si el workspace tiene ID, es una edición
      await handleSaveEdit(workspace);
    } else {
      // Si no tiene ID, es una creación
      await handleCreateWorkspace(workspace);
    }
  };

  // Confirmar eliminación
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    await deleteWorkspace(deleteTarget.id);
    setIsDeleting(false);

    setDeleteTarget(null);
  };

  const handleOpenForm = (workspace: Workspace | undefined) => {
    setWorkSpace(workspace || {} as Workspace);
    setOpen(true);
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Workspaces</h1>
          <p className="text-muted-foreground mt-1">
            Select a workspace to view and manage its tasks
          </p>
        </div>
        <div>
          <Button onClick={() => handleOpenForm(undefined)}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Workspace
          </Button>
        </div>
      </div>

      {/* Dialog Edit and Create workspace */}
      <FormWorkspace open={open} setOpen={setOpen} workspace={workSpace} setWorkspace={setWorkSpace} handleSave={handleCreateOrEditWorkspace} />

      {/* AlertDialog para CONFIRMAR ELIMINACIÓN */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete workspace</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold">{deleteTarget?.name}</span>? This
              action cannot be undone and all associated tasks will be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="h-full">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <Skeleton className="h-5 w-32" />
                  </div>
                </div>
                <Skeleton className="h-4 w-full mt-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && workspaces.length === 0 && (
        <Empty title="No workspaces yet" />
      )}

      {/* Lista de workspaces */}
      {!loading && workspaces.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workspaces.map((ws) => (
            <div
              key={ws.id}
              className="group relative"
              onClick={() => handleSelectWorkspace(ws.id)}
            >
              <Card className="h-full hover:border-blue-500/60 hover:shadow-md transition-all duration-150 cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="p-2 rounded-lg"
                        style={{
                          backgroundColor: ws.color
                            ? `${ws.color}20`
                            : "#3B82F610",
                        }}
                      >
                        {ws.icon ? (
                          <span className="text-lg">{ws.icon}</span>
                        ) : (
                          <Layers
                            className="h-4 w-4"
                            style={{ color: ws.color || "#3B82F6" }}
                          />
                        )}
                      </div>
                      <CardTitle className="text-base text-pretty leading-snug">
                        {ws.name}
                      </CardTitle>
                    </div>

                    {/* Menú de tres puntos */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DropdownMenuItem onClick={() => handleOpenForm(ws)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600"
                          onClick={() => setDeleteTarget(ws)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {ws.description && (
                    <CardDescription className="line-clamp-2 text-pretty">
                      {ws.description}
                    </CardDescription>
                  )}
                </CardHeader>

                <CardContent className="pt-0 space-y-3">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {ws.member_count !== undefined && (
                      <span className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5" />
                        {ws.member_count}{" "}
                        {ws.member_count === 1 ? "member" : "members"}
                      </span>
                    )}
                    {ws.task_count !== undefined && (
                      <span className="flex items-center gap-1.5">
                        <ListTodo className="h-3.5 w-3.5" />
                        {ws.task_count} {ws.task_count === 1 ? "task" : "tasks"}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Updated{" "}
                    {formatDistanceToNow(new Date(ws.updated_at), {
                      addSuffix: true,
                    })}
                  </p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
