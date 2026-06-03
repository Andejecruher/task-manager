"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useTask } from "@/hooks/use-task";
import { useWorkspace } from "@/hooks/use-workspace";
import {
  PRIORITY_COLORS,
  PRIORITY_LABELS,
  STATUS_COLORS,
  STATUS_LABELS,
  STATUS_ORDER,
} from "@/lib/schemas";
import type { Priority, TaskStatus } from "@/lib/types";
import type { Task } from "@/types/task";
import { format } from "date-fns";
import { Calendar, DownloadCloud, Eye, Flag, Tag, Trash2, User } from "lucide-react";
import { useEffect, useState } from "react";

const PRIORITIES: Priority[] = ["low", "medium", "high", "urgent"];

interface TaskDetailsDialogProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskDetailsDialog({
  task,
  open,
  onOpenChange,
}: TaskDetailsDialogProps) {
  const { updateTask, deleteTask, getTask } = useTask();
  const { users } = useWorkspace();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [assigneeId, setAssigneeId] = useState<string>("");
  const [dueDate, setDueDate] = useState("");
  const [tags, setTags] = useState("");
  const [fullTask, setFullTask] = useState<Task | null>(null);
  const [loadingAttachments, setLoadingAttachments] = useState(false);
  const [previewAttachment, setPreviewAttachment] = useState<any | null>(null);

  // Cargar la tarea completa con attachments cuando se abre
  useEffect(() => {
    if (task?.id && open) {
      loadFullTask(task.id);
    }
  }, [task?.id, open]);

  const loadFullTask = async (taskId: string) => {
    setLoadingAttachments(true);
    try {
      const taskWithAttachments = await getTask(taskId);
      if (taskWithAttachments) {
        setFullTask(taskWithAttachments);
      }
    } catch (error) {
      console.error("Error loading task with attachments:", error);
    } finally {
      setLoadingAttachments(false);
    }
  };

  // Usar fullTask si existe, sino usar task
  const displayTask = fullTask || task;

  useEffect(() => {
    if (displayTask) {
      setTitle(displayTask.title);
      setDescription(displayTask.description ?? "");
      setPriority(displayTask.priority);
      setStatus(displayTask.status);
      setAssigneeId(displayTask.assignee_id ?? "");
      setDueDate(
        displayTask.due_date
          ? format(new Date(displayTask.due_date), "yyyy-MM-dd")
          : "",
      );
      setTags((displayTask.tags ?? []).join(", "));
      setIsEditing(false);
    }
  }, [displayTask]);

  // Helpers para preview/descarga
  const formatFileSize = (bytes?: number) => {
    if (bytes == null) return "";
    const units = ["B", "KB", "MB", "GB", "TB"];
    let i = 0;
    let size = bytes;
    while (size >= 1024 && i < units.length - 1) {
      size = size / 1024;
      i += 1;
    }
    return `${size.toFixed(size < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
  };

  const getDriveIdFromUrl = (url?: string) => {
    if (!url) return null;
    try {
      const m = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (m) return m[1];
      const qs = url.split("?")[1];
      if (qs) {
        const params = new URLSearchParams(qs);
        if (params.has("id")) return params.get("id");
      }
    } catch (e) {
      // ignore
    }
    return null;
  };

  const getPreviewUrl = (storageUrl?: string, mimeType?: string) => {
    if (!storageUrl) return "";
    const driveId = getDriveIdFromUrl(storageUrl);
    // If file is stored in Drive and we have a backend, use server proxy so
    // we can fetch private files without making them public.
    const apiBase = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
    if (driveId && apiBase) {
      return `${apiBase}/drive/preview/${driveId}`;
    }

    // Fallback to Google viewer for public URLs
    if (mimeType === "application/pdf") {
      return `https://docs.google.com/gview?url=${encodeURIComponent(
        storageUrl,
      )}&embedded=true`;
    }

    return storageUrl;
  };

  const getDownloadUrl = (attachment: any) => {
    const driveId = getDriveIdFromUrl(attachment?.storage_url);
    if (driveId) return `https://drive.google.com/uc?export=download&id=${driveId}`;
    return attachment?.storage_url;
  };

  if (!displayTask) return null;

  const assignee = users?.find((u) => u.id === assigneeId);
  const creator = users?.find((u) => u.id === displayTask.created_by);

  const handleSave = () => {
    updateTask(displayTask.id, {
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      status,
      assignee_id:
        assigneeId && assigneeId !== "unassigned" ? assigneeId : undefined,
      due_date: dueDate ? new Date(dueDate).toISOString() : undefined,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this task?")) {
      deleteTask(displayTask.id);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">Task Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {isEditing ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Task title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Task description"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select
                    value={status}
                    onValueChange={(v) => setStatus(v as TaskStatus)}
                  >
                    <SelectTrigger id="edit-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_ORDER.map((s) => (
                        <SelectItem key={s} value={s}>
                          {STATUS_LABELS[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-priority">Priority</Label>
                  <Select
                    value={priority}
                    onValueChange={(v) => setPriority(v as Priority)}
                  >
                    <SelectTrigger id="edit-priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITIES.map((p) => (
                        <SelectItem key={p} value={p}>
                          {PRIORITY_LABELS[p]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-assignee">Assignee</Label>
                  <Select value={assigneeId} onValueChange={setAssigneeId}>
                    <SelectTrigger id="edit-assignee">
                      <SelectValue placeholder="Select assignee" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {users?.map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.fullName || u.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-dueDate">Due date</Label>
                  <Input
                    id="edit-dueDate"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-tags">Tags</Label>
                <Input
                  id="edit-tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="frontend, backend, design (comma-separated)"
                />
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>Save changes</Button>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-balance leading-tight">
                    {displayTask.title}
                  </h2>
                  <div className="flex items-center gap-2 mt-3">
                    <Badge
                      variant="outline"
                      className={STATUS_COLORS[displayTask.status]}
                    >
                      {STATUS_LABELS[displayTask.status]}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={PRIORITY_COLORS[displayTask.priority]}
                    >
                      {PRIORITY_LABELS[displayTask.priority]}
                    </Badge>
                  </div>
                </div>

                {displayTask.description && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Description
                    </h3>
                    <p className="text-sm leading-relaxed text-pretty">
                      {displayTask.description}
                    </p>
                  </div>
                )}

                <Separator />

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Assignee:</span>
                      {assignee ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="bg-blue-600 text-white text-xs">
                              {assignee.fullName?.charAt(0).toUpperCase() ||
                                assignee.email?.charAt(0).toUpperCase() ||
                                ""}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">
                            {assignee.fullName || assignee.email}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">
                          Unassigned
                        </span>
                      )}
                    </div>

                    {displayTask.due_date && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Due date:</span>
                        <span className="font-medium">
                          {format(
                            new Date(displayTask.due_date),
                            "MMMM d, yyyy",
                          )}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm">
                      <Flag className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Priority:</span>
                      <span className="font-medium">
                        {PRIORITY_LABELS[displayTask.priority]}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {(displayTask.tags ?? []).length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Tag className="h-4 w-4" />
                          <span>Tags:</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {(displayTask.tags ?? []).map((tag) => (
                            <Badge key={tag} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* SECCIÓN DE ARCHIVOS ADJUNTOS */}
                {loadingAttachments && (
                  <div className="text-center py-4 text-muted-foreground">
                    Cargando archivos...
                  </div>
                )}

                {!loadingAttachments &&
                  displayTask.attachments &&
                  displayTask.attachments.length > 0 && (
                    <>
                      <Separator />
                      <div className="space-y-3">
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Archivos adjuntos ({displayTask.attachments.length})
                        </h3>
                        <div className="grid gap-3 overflow-hidden">
                          {displayTask.attachments.map((attachment, index) => (
                            <div
                              key={attachment.id || index}
                              className="flex items-center gap-3 p-3 border rounded-lg overflow-hidden"
                            >
                              {attachment.mime_type?.startsWith("image/") && (
                                <img
                                  src={attachment.storage_url}
                                  alt={attachment.original_filename}
                                  className="w-16 h-16 object-cover rounded cursor-pointer shrink-0"
                                  onClick={() =>
                                    window.open(
                                      attachment.storage_url,
                                      "_blank",
                                    )
                                  }
                                />
                              )}

                              {!attachment.mime_type?.startsWith("image/") && (
                                <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded shrink-0">
                                  📄
                                </div>
                              )}
                              <div className="flex-1 min-w-0 overflow-hidden">
                                <div className="flex items-center justify-between">
                                  <a
                                    href={getDownloadUrl(attachment)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-500 hover:underline break-all truncate block max-w-full"
                                  >
                                    {attachment.original_filename || attachment.filename}
                                  </a>
                                  <div className="ml-3 flex items-center gap-2">
                                    {attachment.mime_type === "application/pdf" && (
                                      <button
                                        type="button"
                                        onClick={() => setPreviewAttachment(attachment)}
                                        className="text-sm text-muted-foreground hover:text-blue-600 flex items-center gap-1"
                                      >
                                        <Eye className="h-4 w-4" />
                                      </button>
                                    )}
                                    <a
                                      href={getDownloadUrl(attachment)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-sm text-muted-foreground hover:text-blue-600 flex items-center gap-1"
                                    >
                                      <DownloadCloud className="h-4 w-4" />
                                    </a>
                                  </div>
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {formatFileSize(attachment.file_size)} • {attachment.mime_type}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                {previewAttachment && (
                  <Dialog
                    open={!!previewAttachment}
                    onOpenChange={(open) => !open && setPreviewAttachment(null)}
                  >
                    <DialogContent className="max-w-4xl w-[95vw] max-h-[95vh]">
                      <DialogHeader>
                        <DialogTitle className="text-sm">
                          {previewAttachment.original_filename || previewAttachment.filename}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="h-[75vh]">
                        <iframe
                          src={getPreviewUrl(previewAttachment.storage_url, previewAttachment.mime_type)}
                          className="w-full h-full border"
                          title={previewAttachment.original_filename || previewAttachment.filename}
                        />
                      </div>
                      <div className="flex justify-end gap-2 mt-2">
                        <a
                          href={getDownloadUrl(previewAttachment)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="outline" className="gap-2">
                            <DownloadCloud className="h-4 w-4" /> Descargar
                          </Button>
                        </a>
                        <Button onClick={() => setPreviewAttachment(null)}>Cerrar</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}

                <Separator />

                <div className="text-xs text-muted-foreground space-y-1">
                  <p>
                    Created{" "}
                    {format(
                      new Date(displayTask.created_at),
                      "MMMM d, yyyy 'at' h:mm a",
                    )}
                  </p>
                  {creator && (
                    <p>Created by {creator.fullName || creator.email}</p>
                  )}
                  <p>
                    Last updated{" "}
                    {format(
                      new Date(displayTask.updated_at),
                      "MMMM d, yyyy 'at' h:mm a",
                    )}
                  </p>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  className="gap-2 text-destructive hover:text-destructive bg-transparent"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
                <Button onClick={() => setIsEditing(true)}>Edit task</Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
