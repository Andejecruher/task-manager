"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { AuthProvider } from "@/context/auth-context";
import { TaskProvider } from "@/context/tasks-context";
import { WorkspaceProvider } from "@/context/workspace-context";
import { Toaster } from "sonner";

interface PageLayoutProps {
    children: React.ReactNode;
}

export default function AuthenticatedLayout({ children }: PageLayoutProps) {
    return (
        <AuthProvider>
            <WorkspaceProvider>
                <TaskProvider>
                    <div className="flex min-h-screen bg-background">
                        <AppSidebar />
                        <div className="flex flex-col flex-1 min-w-0">
                            <main className="flex-1 p-8">{children}</main>
                        </div>
                    </div>
                    <Toaster position="top-right" richColors={false} />
                </TaskProvider>
            </WorkspaceProvider>
        </AuthProvider>
    );
}
