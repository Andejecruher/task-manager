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

