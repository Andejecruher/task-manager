"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/lib/auth-context"
import { PRIORITY_LABELS, STATUS_LABELS, STATUS_ORDER } from "@/lib/schemas"
import type { Priority, TaskStatus } from "@/lib/types"
import { Plus } from "lucide-react"
import type React from "react"
import { useState } from "react"

const PRIORITIES: Priority[] = ["low", "medium", "high", "urgent"]

interface CreateTaskDialogProps {
    defaultStatus?: TaskStatus
    workspaceId?: string
    trigger?: React.ReactNode
}

export function CreateTaskDialog({
    defaultStatus = "todo",
    workspaceId,
    trigger,
}: CreateTaskDialogProps) {
    const { user, users, tasks, addTask, workspaces } = useAuth()
    const [open, setOpen] = useState(false)
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [priority, setPriority] = useState<Priority>("medium")
    const [status, setStatus] = useState<TaskStatus>(defaultStatus)
    const [assigneeId, setAssigneeId] = useState<string>(user?.id ?? "")
    const [dueDate, setDueDate] = useState("")
    const [tags, setTags] = useState("")

    // Resolve workspaceId: prop > first workspace in seed
    const resolvedWorkspaceId = workspaceId ?? workspaces[0]?.id ?? "ws-1"

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!user || !title.trim()) return

        addTask({
            title: title.trim(),
            description: description.trim() || undefined,
            status,
            priority,
            assigneeId: assigneeId && assigneeId !== "unassigned" ? assigneeId : undefined,
            workspaceId: resolvedWorkspaceId,
            companyId: user.companyId,
            dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
            tags: tags
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean),
            createdBy: user.id,
        })

        setTitle("")
        setDescription("")
        setPriority("medium")
        setStatus(defaultStatus)
        setAssigneeId(user.id)
        setDueDate("")
        setTags("")
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger ?? (
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        New task
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Create new task</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            placeholder="Enter task title..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            placeholder="Add task description..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
                                <SelectTrigger id="status">
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
                            <Label htmlFor="priority">Priority</Label>
                            <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                                <SelectTrigger id="priority">
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
                            <Label htmlFor="assignee">Assignee</Label>
                            <Select value={assigneeId} onValueChange={setAssigneeId}>
                                <SelectTrigger id="assignee">
                                    <SelectValue placeholder="Select assignee" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="unassigned">Unassigned</SelectItem>
                                    {users.map((u) => (
                                        <SelectItem key={u.id} value={u.id}>
                                            {u.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="dueDate">Due date</Label>
                            <Input
                                id="dueDate"
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="tags">Tags</Label>
                        <Input
                            id="tags"
                            placeholder="frontend, backend, design (comma-separated)"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit">Create task</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
