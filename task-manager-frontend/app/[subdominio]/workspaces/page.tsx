"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Empty } from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/context/auth-context"
import { useWorkspace } from "@/hooks/use-workspace"
import { formatDistanceToNow } from "date-fns"
import { ArrowRight, Layers, ListTodo, Users } from "lucide-react"
import { useRouter } from 'next/navigation'

export default function WorkspacesPage() {
    const { user } = useAuth()
    const { workspaces, loading, setWorkspaceId } = useWorkspace()
    const router = useRouter()

    const handleSelectWorkspace = (id: string) => {
        setWorkspaceId(id);
        router.push(`/${user?.company?.slug}/workspaces/${id}`);
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-balance">Workspaces</h1>
                <p className="text-muted-foreground mt-1">
                    Select a workspace to view and manage its tasks
                </p>
            </div>

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

            {!loading && workspaces.length === 0 && (
                <Empty
                    title="No workspaces yet"
                // description="Your company doesn't have any workspaces set up. Contact your administrator."
                // icon={<Layers className="h-10 w-10 text-muted-foreground" />}
                />
            )}

            {!loading && workspaces.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {workspaces.map((ws) => (
                        <div key={ws.id} className="group" onClick={() => handleSelectWorkspace(ws.id)}>
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
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
