export interface Workspace {
    id: string;
    company_id: string;
    name: string;
    slug: string;
    description?: string;
    icon?: string;
    color?: string;
    settings: Record<string, unknown>;
    is_private: boolean;
    task_count: number;
    member_count: number;
    created_by?: string;
    created_at: Date;
    updated_at: Date;
    deleted_at?: Date | null;
}

// ─── Member assignment types ────────────────────────────────────────────────

export interface WorkspaceMemberUser {
    memberId: string;
    userId: string;
    role: "admin" | "member" | "viewer";
    joinedAt: string;
    user: {
        id: string;
        email: string;
        full_name: string;
        avatar_url?: string;
        role: string;
        is_active: boolean;
    };
}

export interface AvailableUser {
    id: string;
    email: string;
    full_name: string;
    avatar_url?: string;
    role: string;
}

export interface WorkspaceUsersResponse {
    assigned: WorkspaceMemberUser[];
    available: AvailableUser[];
}

export interface UserWorkspaceMembership {
    memberId: string;
    workspaceId: string;
    role: "admin" | "member" | "viewer";
    joinedAt: string;
    workspace: {
        id: string;
        name: string;
        slug: string;
        description?: string;
        icon?: string;
        color?: string;
        is_private: boolean;
    };
}

export interface UserWorkspacesResponse {
    assigned: UserWorkspaceMembership[];
    available: Workspace[];
}
