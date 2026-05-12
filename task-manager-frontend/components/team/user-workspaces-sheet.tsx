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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { TeamMember } from "@/hooks/use-team";
import {
    useAssignWorkspacesToUser,
    useUnassignWorkspacesFromUser,
    useUserWorkspaces,
} from "@/hooks/use-user-workspaces";
import type { UserWorkspaceMembership, Workspace } from "@/types";
import { Layers, Plus, X } from "lucide-react";
import { useState } from "react";

interface UserWorkspacesSheetProps {
    user: TeamMember | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

function WorkspaceSkeleton() {
    return (
        <div className="flex items-center gap-3 py-2">
            <Skeleton className="h-8 w-8 rounded-md" />
            <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-7 w-7 rounded-md" />
        </div>
    );
}

function WorkspaceIcon({
    icon,
    color,
    name,
}: {
    icon?: string;
    color?: string;
    name: string;
}) {
    return (
        <div
            className="h-8 w-8 rounded-md flex items-center justify-center text-white text-sm font-semibold shrink-0"
            style={{ backgroundColor: color ?? "#6366f1" }}
        >
            {icon ?? name.charAt(0).toUpperCase()}
        </div>
    );
}

const ROLE_COLORS: Record<string, string> = {
    admin: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800",
    member: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800",
    viewer: "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800",
};

export function UserWorkspacesSheet({
    user,
    open,
    onOpenChange,
}: UserWorkspacesSheetProps) {
    const { data, isLoading } = useUserWorkspaces(user?.id);
    const assignMutation = useAssignWorkspacesToUser(user?.id ?? "");
    const unassignMutation = useUnassignWorkspacesFromUser(user?.id ?? "");

    const [search, setSearch] = useState("");
    const [pendingUnassign, setPendingUnassign] = useState<UserWorkspaceMembership | null>(null);

    const assigned = data?.assigned ?? [];
    const available = (data?.available ?? []).filter(
        (w: Workspace) =>
            w.name.toLowerCase().includes(search.toLowerCase()),
    );

    const handleAssign = (workspaceId: string) => {
        assignMutation.mutate([workspaceId]);
    };

    const handleUnassign = () => {
        if (!pendingUnassign) return;
        unassignMutation.mutate([pendingUnassign.workspaceId], {
            onSettled: () => setPendingUnassign(null),
        });
    };

    const displayName = user?.full_name ?? user?.name ?? user?.email ?? "Usuario";

    return (
        <>
            <Sheet open={open} onOpenChange={onOpenChange}>
                <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
                    <SheetHeader className="mb-4">
                        <SheetTitle className="flex items-center gap-2">
                            <Layers className="h-5 w-5" />
                            Workspaces del usuario
                        </SheetTitle>
                        <SheetDescription className="flex items-center gap-2">
                            <Avatar className="h-5 w-5 inline-flex">
                                <AvatarFallback className="text-[10px] bg-blue-600 text-white">
                                    {displayName.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            {displayName}
                            {user?.email && ` · ${user.email}`}
                        </SheetDescription>
                    </SheetHeader>

                    <div className="grid gap-6 sm:grid-cols-2">
                        {/* ── Asignados ───────────────────────────────────── */}
                        <div>
                            <h3 className="text-sm font-semibold mb-3 text-foreground">
                                Asignados ({assigned.length})
                            </h3>

                            {isLoading ? (
                                Array.from({ length: 3 }).map((_, i) => <WorkspaceSkeleton key={i} />)
                            ) : assigned.length === 0 ? (
                                <p className="text-sm text-muted-foreground py-4 text-center">
                                    Sin workspaces asignados
                                </p>
                            ) : (
                                <ul className="space-y-1">
                                    {assigned.map((m: UserWorkspaceMembership) => (
                                        <li
                                            key={m.memberId}
                                            className="flex items-center gap-3 py-2 rounded-md hover:bg-accent/50 px-1 transition-colors"
                                        >
                                            <WorkspaceIcon
                                                icon={m.workspace.icon}
                                                color={m.workspace.color}
                                                name={m.workspace.name}
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{m.workspace.name}</p>
                                                <p className="text-xs text-muted-foreground truncate">
                                                    {m.workspace.slug}
                                                </p>
                                            </div>
                                            <Badge
                                                variant="outline"
                                                className={`text-xs shrink-0 ${ROLE_COLORS[m.role] ?? ROLE_COLORS.member}`}
                                            >
                                                {m.role}
                                            </Badge>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                                                onClick={() => setPendingUnassign(m)}
                                                disabled={unassignMutation.isPending}
                                                title="Quitar workspace"
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* ── Disponibles ─────────────────────────────────── */}
                        <div>
                            <h3 className="text-sm font-semibold mb-3 text-foreground">
                                Disponibles ({available.length})
                            </h3>
                            <Input
                                placeholder="Buscar workspace..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="mb-3 h-8 text-sm"
                            />

                            {isLoading ? (
                                Array.from({ length: 3 }).map((_, i) => <WorkspaceSkeleton key={i} />)
                            ) : available.length === 0 ? (
                                <p className="text-sm text-muted-foreground py-4 text-center">
                                    {search ? "Sin resultados" : "No hay workspaces disponibles"}
                                </p>
                            ) : (
                                <ul className="space-y-1">
                                    {available.map((w: Workspace) => (
                                        <li
                                            key={w.id}
                                            className="flex items-center gap-3 py-2 rounded-md hover:bg-accent/50 px-1 transition-colors"
                                        >
                                            <WorkspaceIcon icon={w.icon} color={w.color} name={w.name} />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{w.name}</p>
                                                <p className="text-xs text-muted-foreground truncate">{w.slug}</p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 shrink-0 text-muted-foreground hover:text-primary"
                                                onClick={() => handleAssign(w.id)}
                                                disabled={assignMutation.isPending}
                                                title="Asignar workspace"
                                            >
                                                <Plus className="h-3.5 w-3.5" />
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </SheetContent>
            </Sheet>

            <AlertDialog
                open={Boolean(pendingUnassign)}
                onOpenChange={(v) => !v && setPendingUnassign(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Quitar workspace?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Se quitará a{" "}
                            <span className="font-semibold">{displayName}</span> del workspace{" "}
                            <span className="font-semibold">{pendingUnassign?.workspace.name}</span>.
                            Esta acción puede revertirse volviendo a asignarlo.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={handleUnassign}
                        >
                            Quitar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
