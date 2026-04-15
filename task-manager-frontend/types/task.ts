export interface Task {
    id: string;
    company_id: string;
    workspace_id: string;
    board_id: string;
    task_number: number;
    title: string;
    description?: string;
    description_html?: string;
    column_id?: string;
    status:
    | "todo"
    | "in_progress"
    | "review"
    | "done"
    | "blocked"
    | "cancelled";
    priority: "low" | "medium" | "high" | "urgent";
    assignee_id?: string;
    assignee_ids?: string[];
    due_date?: Date;
    start_date?: Date;
    completed_at?: Date;
    time_estimate?: number;
    tags?: string[];
    metadata: Record<string, unknown>;
    total_time_spent: number;
    last_time_tracked_at?: Date;
    parent_task_id?: string;
    related_task_ids?: string[];
    created_by: string;
    updated_by?: string;

    created_at: Date;
    updated_at: Date;
    deleted_at?: Date | null;
}