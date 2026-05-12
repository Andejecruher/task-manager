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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import {
    useAssignUsersToWorkspace,
    useUnassignUsersFromWorkspace,
    useWorkspaceUsers,
} from "@/hooks/use-workspace-users";
import type { AvailableUser, WorkspaceMemberUser } from "@/types";
import { UserMinus, UserPlus, Users } from "lucide-react";
import { useState } from "react";

interface ManageMembersSheetProps {
    workspaceId: string;
    workspaceName: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

function MemberSkeleton() {
    return (
        <div className="flex items-center gap-3 py-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-3 w-44" />
            </div>
            <Skeleton className="h-7 w-7 rounded-md" />
        </div>
    );
}

const ROLE_COLORS: Record<string, string> = {
    admin: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800",
    member: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800",
    viewer: "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800",
};

export function ManageMembersSheet({
    workspaceId,
    workspaceName,
    open,
    onOpenChange,
}: ManageMembersSheetProps) {
    const { data, isLoading } = useWorkspaceUsers(workspaceId);
    const assignMutation = useAssignUsersToWorkspace(workspaceId);
    const unassignMutation = useUnassignUsersFromWorkspace(workspaceId);

    const [search, setSearch] = useState("");
    const [pendingUnassign, setPendingUnassign] = useState<WorkspaceMemberUser | null>(null);

    const assigned = data?.assigned ?? [];
    const available = (data?.available ?? []).filter(
        (u: AvailableUser) =>
            u.full_name.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase()),
    );

    const handleAssign = (userId: string) => {
        assignMutation.mutate([userId]);
    };

    const handleUnassign = () => {
        if (!pendingUnassign) return;
        unassignMutation.mutate([pendingUnassign.userId], {
            onSettled: () => setPendingUnassign(null),
        });
    };

    return (
        <>
            <Sheet open={open} onOpenChange={onOpenChange}>
                <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
                    <SheetHeader className="mb-4">
                        <SheetTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Gestionar miembros
                        </SheetTitle>
                        <SheetDescription>{workspaceName}</SheetDescription>
                    </SheetHeader>

                    <div className="grid gap-6 sm:grid-cols-2">
                        {/* ── Asignados ───────────────────────────────────── */}
                        <div>
                            <h3 className="text-sm font-semibold mb-3 text-foreground">
                                Asignados ({assigned.length})
                            </h3>

                            {isLoading ? (
                                Array.from({ length: 3 }).map((_, i) => <MemberSkeleton key={i} />)
                            ) : assigned.length === 0 ? (
                                <p className="text-sm text-muted-foreground py-4 text-center">
                                    Ningún miembro asignado
                                </p>
                            ) : (
                                <ul className="space-y-1">
                                    {assigned.map((m: WorkspaceMemberUser) => (
                                        <li
                                            key={m.memberId}
                                            className="flex items-center gap-3 py-2 rounded-md hover:bg-accent/50 px-1 transition-colors"
                                        >
                                            <Avatar className="h-8 w-8 shrink-0">
                                                {m.user.avatar_url && (
                                                    <AvatarImage src={m.user.avatar_url} alt={m.user.full_name} />
                                                )}
                                                <AvatarFallback className="text-xs bg-blue-600 text-white">
                                                    {m.user.full_name.charAt(0).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{m.user.full_name}</p>
                                                <p className="text-xs text-muted-foreground truncate">{m.user.email}</p>
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
                                                title="Quitar miembro"
                                            >
                                                <UserMinus className="h-3.5 w-3.5" />
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
                                placeholder="Buscar usuario..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="mb-3 h-8 text-sm"
                            />

                            {isLoading ? (
                                Array.from({ length: 3 }).map((_, i) => <MemberSkeleton key={i} />)
                            ) : available.length === 0 ? (
                                <p className="text-sm text-muted-foreground py-4 text-center">
                                    {search ? "Sin resultados" : "No hay usuarios disponibles"}
                                </p>
                            ) : (
                                <ul className="space-y-1">
                                    {available.map((u: AvailableUser) => (
                                        <li
                                            key={u.id}
                                            className="flex items-center gap-3 py-2 rounded-md hover:bg-accent/50 px-1 transition-colors"
                                        >
                                            <Avatar className="h-8 w-8 shrink-0">
                                                {u.avatar_url && (
                                                    <AvatarImage src={u.avatar_url} alt={u.full_name} />
                                                )}
                                                <AvatarFallback className="text-xs bg-violet-600 text-white">
                                                    {u.full_name.charAt(0).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{u.full_name}</p>
                                                <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 shrink-0 text-muted-foreground hover:text-primary"
                                                onClick={() => handleAssign(u.id)}
                                                disabled={assignMutation.isPending}
                                                title="Agregar miembro"
                                            >
                                                <UserPlus className="h-3.5 w-3.5" />
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
                        <AlertDialogTitle>¿Quitar miembro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Se quitará a{" "}
                            <span className="font-semibold">{pendingUnassign?.user.full_name}</span> del
                            workspace <span className="font-semibold">{workspaceName}</span>. Esta
                            acción puede revertirse volviendo a asignarlo.
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
