"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Workspace } from "@/types";
import { useState } from "react";
import { toast } from "sonner";
import { EmojiPicker } from "./EmojiPicker";

interface WorkspacesProps {
    open: boolean,
    setOpen: (open: boolean) => void,
    workspace: Workspace,
    setWorkspace: (workspace: Workspace) => void,
    handleSave: (workspace: Workspace) => Promise<void>,
}

export default function FormWorkspace({ open, workspace, setOpen, setWorkspace, handleSave }: WorkspacesProps) {
    // Estado para crear workspace
    const [isCreating, setIsCreating] = useState(false);

    // Función para manejar la creación o actualización del workspace
    const handleSubmit = async () => {
        // Validación básica para campos del formulario
        if (!workspace.name || !workspace.name.trim()) {
            toast.error("Workspace name is required");
            return;
        }

        if (!workspace.color || !/^#([0-9A-F]{3}){1,2}$/i.test(workspace.color)) {
            toast.error("Please enter a valid hex color code");
            return;
        }

        if (!workspace.icon || !workspace.icon.trim()) {
            toast.error("Please select an emoji for the workspace icon");
            return;
        }

        setIsCreating(true);
        try {
            await handleSave({
                ...workspace,
                slug: generateSlug(workspace.name),
            });
            setOpen(false);
        } catch (error) {
            console.error("Error saving workspace:", error);
        } finally {
            setIsCreating(false);
        }
    };

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

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{workspace.id ? "Edit Workspace" : "Create New Workspace"}</DialogTitle>
                    <DialogDescription>
                        Enter the details for your {workspace.id ? "workspace" : "new workspace"}.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name *</Label>
                        <Input
                            id="name"
                            placeholder="Workspace name"
                            value={workspace.name}
                            onChange={(e) => setWorkspace(
                                {
                                    ...workspace,
                                    name: e.target.value
                                }
                            )}
                            disabled={isCreating} />
                        {workspace && workspace.name && (
                            <p className="text-xs text-muted-foreground">
                                Slug: {generateSlug(workspace.name)}
                            </p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            placeholder="Describe your workspace"
                            value={workspace.description}
                            onChange={(e) => setWorkspace(
                                {
                                    ...workspace,
                                    description: e.target.value
                                }
                            )}
                            disabled={isCreating}
                            rows={2} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="icon">Icon (emoji)</Label>
                        {/* Emoji picker - No tooltip to avoid conflicts with Popover trigger */}
                        <div className="flex justify-between">
                            <EmojiPicker
                                onEmojiSelect={(emoji) => {
                                    setWorkspace({
                                        ...workspace,
                                        icon: emoji
                                    });
                                }}
                                trigger={
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="bg-secondary"
                                        type="button"
                                        aria-label="Insertar emoji"
                                    >
                                        Seleccionar emoji
                                    </Button>
                                }
                            />
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">{workspace.icon || "😀"}</span>
                            </div>
                        </div>

                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="color">Color</Label>
                        <div className="flex gap-2 items-center">
                            <Input
                                id="color"
                                type="color"
                                value={workspace.color}
                                onChange={(e) => setWorkspace(
                                    {
                                        ...workspace,
                                        color: e.target.value
                                    }
                                )}
                                disabled={isCreating}
                                className="w-16 h-10 p-1" />
                            <Input
                                value={workspace.color}
                                onChange={(e) => setWorkspace(
                                    {
                                        ...workspace,
                                        color: e.target.value
                                    }
                                )}
                                disabled={isCreating}
                                placeholder="#3B82F6"
                                className="flex-1" />
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
                    <Button disabled={isCreating} onClick={handleSubmit}>
                        {isCreating ? (workspace.id ? "Updating..." : "Creating...") : (workspace.id ? "Update" : "Create")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
