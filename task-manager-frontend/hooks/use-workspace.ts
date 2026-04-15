"use client";

import { WorkspaceContext } from "@/context/workspace-context";
import {
    useContext
} from "react";

export function useWorkspace() {
    const ctx = useContext(WorkspaceContext);
    if (!ctx) throw new Error("useWorkspace must be used inside <WorkspaceProvider>");
    return ctx;
}
