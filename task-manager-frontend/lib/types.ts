// ── Core enums ──────────────────────────────────────────────────────────────
export type UserRole = "Owner" | "Admin" | "User";
export type Priority = "low" | "medium" | "high" | "urgent";
export type TaskStatus =
  | "todo"
  | "in_progress"
  | "review"
  | "done"
  | "blocked"
  | "cancelled";

// ── API entities ─────────────────────────────────────────────────────────────
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  companyId: string;
  companySlug: string;
  avatar?: string;
  createdAt: string;
}

export interface CompanyContext {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
  memberCount?: number;
  taskCount?: number;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  assigneeId?: string;
  assignee?: Pick<AuthUser, "id" | "name" | "avatar">;
  workspaceId: string;
  companyId: string;
  dueDate?: string;
  tags: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  assigneeId?: string;
  workspaceId: string;
  dueDate?: string;
  tags?: string[];
}

export interface UpdateTaskInput extends Partial<CreateTaskInput> {}

// ── Legacy display aliases (used in existing UI) ─────────────────────────────
export type User = AuthUser & { companyId: string };

export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  createdAt: string;
}
