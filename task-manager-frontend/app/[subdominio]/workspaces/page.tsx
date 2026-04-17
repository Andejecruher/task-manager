"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Empty } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/auth-context";
import { useWorkspace } from "@/hooks/use-workspace";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, MoreHorizontal } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ArrowRight, Layers, ListTodo, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Workspace } from "@/types";

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
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("");
  const [color, setColor] = useState("#3B82F6");
  const [isCreating, setIsCreating] = useState(false);

  // Estado para editar workspace
  const [editOpen, setEditOpen] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState<Workspace | null>(
    null,
  );
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editIcon, setEditIcon] = useState("");
  const [editColor, setEditColor] = useState("#3B82F6");
  const [isEditing, setIsEditing] = useState(false);

  // Estado para eliminar workspace
  const [deleteTarget, setDeleteTarget] = useState<Workspace | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Función para generar slug desde el nombre
  const generateSlug = (text: string): string => {
    return text
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const handleSelectWorkspace = (id: string) => {
    setWorkspaceId(id);
    router.push(`/${user?.company?.slug}/workspaces/${id}`);
  };

  // Crear workspace
  const handleCreateWorkspace = async () => {
    if (!name.trim()) {
      toast.error("Workspace name is required");
      return;
    }

    const slug = generateSlug(name);
    if (!slug) {
      toast.error("Invalid workspace name for slug generation");
      return;
    }

    const dataToSend = {
      name: name.trim(),
      slug: slug,
      description: description.trim() || undefined,
      icon: icon.trim() || undefined,
      color: color || undefined,
    };

    setIsCreating(true);
    try {
      await createWorkspace(dataToSend);
      setOpen(false);
      setName("");
      setDescription("");
      setIcon("");
      setColor("#3B82F6");
      toast.success(`Workspace "${name}" created successfully!`);
    } catch (error) {
      toast.error("Failed to create workspace");
    } finally {
      setIsCreating(false);
    }
  };

  // Abrir diálogo de edición
  const handleEdit = (workspace: Workspace) => {
    setEditingWorkspace(workspace);
    setEditName(workspace.name);
    setEditDescription(workspace.description || "");
    setEditIcon(workspace.icon || "");
    setEditColor(workspace.color || "#3B82F6");
    setEditOpen(true);
  };

  // Guardar edición
  const handleSaveEdit = async () => {
    if (!editName.trim()) {
      toast.error("Workspace name is required");
      return;
    }

    const updateData: {
      name?: string;
      slug?: string;
      description?: string;
      icon?: string;
      color?: string;
    } = {};

    // Solo enviar campos que cambiaron
    if (editName !== editingWorkspace?.name) {
      updateData.name = editName.trim();
      updateData.slug = generateSlug(editName);
    }
    if (editDescription !== (editingWorkspace?.description || "")) {
      updateData.description = editDescription.trim() || undefined;
    }
    if (editIcon !== (editingWorkspace?.icon || "")) {
      updateData.icon = editIcon.trim() || undefined;
    }
    if (editColor !== (editingWorkspace?.color || "#3B82F6")) {
      updateData.color = editColor;
    }

    if (Object.keys(updateData).length === 0) {
      setEditOpen(false);
      return;
    }

    setIsEditing(true);
    await updateWorkspace(editingWorkspace!.id, updateData);
    setIsEditing(false);

    setEditOpen(false);
    setEditingWorkspace(null);
  };

  // Confirmar eliminación
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    await deleteWorkspace(deleteTarget.id);
    setIsDeleting(false);

    setDeleteTarget(null);
  };

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
          <Button onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Workspace
          </Button>
        </div>
      </div>

      {/* Diálogo para CREAR workspace */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Workspace</DialogTitle>
            <DialogDescription>
              Enter the details for your new workspace.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="Workspace name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isCreating}
              />
              {name && (
                <p className="text-xs text-muted-foreground">
                  Slug: {generateSlug(name)}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your workspace"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isCreating}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="icon">Icon (emoji)</Label>
              <Input
                id="icon"
                placeholder="e.g., 🚀, 💼, 🎨"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                disabled={isCreating}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <div className="flex gap-2 items-center">
                <Input
                  id="color"
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  disabled={isCreating}
                  className="w-16 h-10 p-1"
                />
                <Input
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  disabled={isCreating}
                  placeholder="#3B82F6"
                  className="flex-1"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateWorkspace} disabled={isCreating}>
              {isCreating ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para EDITAR workspace */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Workspace</DialogTitle>
            <DialogDescription>
              Update the details of your workspace.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name *</Label>
              <Input
                id="edit-name"
                placeholder="Workspace name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                disabled={isEditing}
              />
              {editName && (
                <p className="text-xs text-muted-foreground">
                  Slug: {generateSlug(editName)}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                placeholder="Describe your workspace"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                disabled={isEditing}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-icon">Icon (emoji)</Label>
              <Input
                id="edit-icon"
                placeholder="e.g., 🚀, 💼, 🎨"
                value={editIcon}
                onChange={(e) => setEditIcon(e.target.value)}
                disabled={isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-color">Color</Label>
              <div className="flex gap-2 items-center">
                <Input
                  id="edit-color"
                  type="color"
                  value={editColor}
                  onChange={(e) => setEditColor(e.target.value)}
                  disabled={isEditing}
                  className="w-16 h-10 p-1"
                />
                <Input
                  value={editColor}
                  onChange={(e) => setEditColor(e.target.value)}
                  disabled={isEditing}
                  placeholder="#3B82F6"
                  className="flex-1"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditOpen(false)}
              disabled={isEditing}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={isEditing}>
              {isEditing ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                        <DropdownMenuItem onClick={() => handleEdit(ws)}>
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
