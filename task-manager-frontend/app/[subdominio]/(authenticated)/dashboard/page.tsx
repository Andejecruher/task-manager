"use client";

import { useAuth } from "@/lib/auth-context";
import { AppSidebar } from "@/components/app-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Users,
  TrendingUp,
  Plus,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

export default function DashboardPage() {
  const { user, tasks, users } = useAuth();

  const stats = useMemo(() => {
    const myTasks = (tasks ?? []).filter((t) => t.assigneeId === user?.id);
    const completed = myTasks.filter((t) => t.status === "done").length;
    const inProgress = myTasks.filter((t) => t.status === "in_progress").length;
    const notStarted = myTasks.filter((t) => t.status === "todo").length;
    const overdue = myTasks.filter(
      (t) =>
        t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "done",
    ).length;

    return {
      total: tasks.length,
      myTasks: myTasks.length,
      completed,
      inProgress,
      notStarted,
      overdue,
      completionRate:
        myTasks.length > 0 ? Math.round((completed / myTasks.length) * 100) : 0,
    };
  }, [tasks, user]);

  const recentTasks = useMemo(() => {
    return (tasks ?? [])
      .filter((t) => t.assigneeId === user?.id)
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      )
      .slice(0, 5);
  }, [tasks, user]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Urgent":
        return "bg-red-500/10 text-red-600 dark:text-red-400";
      case "High":
        return "bg-orange-500/10 text-orange-600 dark:text-orange-400";
      case "Medium":
        return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400";
      case "Low":
        return "bg-green-500/10 text-green-600 dark:text-green-400";
      default:
        return "bg-gray-500/10 text-gray-600 dark:text-gray-400";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "done":
        return "bg-green-500/10 text-green-600 dark:text-green-400";
      case "in_progress":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400";
      case "in_review":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400";
      default:
        return "bg-gray-500/10 text-gray-600 dark:text-gray-400";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "todo":
        return "To Do";
      case "in_progress":
        return "In Progress";
      case "in_review":
        return "In Review";
      case "done":
        return "Done";
      default:
        return status;
    }
  };

  const getPriorityLabel = (priority: string) => {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-balance">
                Welcome back, {user?.name}
              </h1>
              <p className="text-muted-foreground mt-1">
                Here's what's happening with your projects
              </p>
            </div>
            <Link href="/board">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New task
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Tasks
                </CardTitle>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.myTasks}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.completionRate}% completion rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  In Progress
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.inProgress}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Active tasks
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.completed}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Tasks finished
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Team Members
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{users.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Active members
                </p>
              </CardContent>
            </Card>
          </div>

          {stats.overdue > 0 && (
            <Card className="border-orange-200 dark:border-orange-900 bg-orange-50/50 dark:bg-orange-950/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  <div>
                    <p className="font-medium text-orange-900 dark:text-orange-100">
                      You have {stats.overdue} overdue task
                      {stats.overdue > 1 ? "s" : ""}
                    </p>
                    <p className="text-sm text-orange-700 dark:text-orange-300">
                      Review your board to prioritize these tasks
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Tasks</CardTitle>
                <Link href="/board">
                  <Button variant="ghost" size="sm" className="gap-2">
                    View all
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {recentTasks.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium text-lg mb-2">No tasks yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Get started by creating your first task
                  </p>
                  <Link href="/board">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create task
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentTasks.map((task) => {
                    const assignee = users.find(
                      (u) => u.id === task.assigneeId,
                    );
                    return (
                      <div
                        key={task.id}
                        className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">
                            {task.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge
                              variant="outline"
                              className={getPriorityColor(task.priority)}
                            >
                              {getPriorityLabel(task.priority)}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={getStatusColor(task.status)}
                            >
                              {getStatusLabel(task.status)}
                            </Badge>
                          </div>
                        </div>
                        {assignee && (
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-blue-600 text-white text-xs">
                              {assignee.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
