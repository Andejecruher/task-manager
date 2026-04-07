"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Empty } from "@/components/ui/empty"
import { useAuth } from "@/context/auth-context"
import { getWorkspaces } from "@/services/workspace"
import { ApiErrorResponse, Workspace } from "@/types"
import { formatDistanceToNow } from "date-fns"
import { ArrowRight, Layers, ListTodo, Users } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export default function WorkspacesPage() {
    const { user } = useAuth()
    const [workspaces, setWorkspaces] = useState<Workspace[]>([])

    useEffect(() => {
        const fetchWorkspaces = async () => {
            try {
                const response = await getWorkspaces();
                if (response.success) {
                    setWorkspaces(response.data.workspaces);
                } else {
                    toast.error("Failed to load workspaces: " + response.error);
                }
            } catch (err: ApiErrorResponse | any) {
                if (err.error) {
                    toast.error(err?.message || err.error);
                } else {
                    toast.error("An unexpected error occurred. Please try again.");
                }
            }
        };

        fetchWorkspaces();
    }, [])


    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-balance">Workspaces</h1>
                <p className="text-muted-foreground mt-1">
                    Select a workspace to view and manage its tasks
                </p>
            </div>

            {workspaces.length === 0 && (
                <Empty
                    title="No workspaces yet"
                // description="Your company doesn't have any workspaces set up. Contact your administrator."
                // icon={<Layers className="h-10 w-10 text-muted-foreground" />}
                />
            )}

            {workspaces.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {workspaces.map((ws) => (
                        <Link key={ws.id} href={`/${user?.company.slug}/workspaces/${ws.id}`} className="group">
                            <Card className="h-full hover:border-blue-500/60 hover:shadow-md transition-all duration-150 cursor-pointer">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 rounded-lg bg-blue-600/10">
                                                <Layers className="h-4 w-4 text-blue-600" />
                                            </div>
                                            <CardTitle className="text-base text-pretty leading-snug">
                                                {ws.name}
                                            </CardTitle>
                                        </div>
                                        <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
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
                                                {ws.member_count} {ws.member_count === 1 ? "member" : "members"}
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
                                        {formatDistanceToNow(new Date(ws.updated_at), { addSuffix: true })}
                                    </p>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
