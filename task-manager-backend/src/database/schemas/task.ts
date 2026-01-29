import { z } from 'zod';

// Esquemas base
export const BaseSchema = z.object({
    id: z.string().uuid(),
    company_id: z.string().uuid(),
    created_at: z.date(),
    updated_at: z.date(),
    deleted_at: z.date().optional(),
});

// Esquema de Tarea
export const TaskSchema = BaseSchema.extend({
    workspace_id: z.string().uuid(),
    board_id: z.string().uuid(),
    task_number: z.number().int().positive(),

    title: z.string().min(1).max(500),
    description: z.string().optional(),
    description_html: z.string().optional(),

    column_id: z.string().uuid().optional(),
    status: z.enum(['todo', 'in_progress', 'review', 'done', 'blocked', 'cancelled']),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),

    assignee_id: z.string().uuid().optional(),
    assignee_ids: z.array(z.string().uuid()).default([]),

    due_date: z.date().optional(),
    start_date: z.date().optional(),
    completed_at: z.date().optional(),
    time_estimate: z.number().int().min(0).optional(),

    tags: z.array(z.string().max(50)).default([]),
    metadata: z.record(z.any()).default({}),

    total_time_spent: z.number().int().min(0).default(0),
    last_time_tracked_at: z.date().optional(),

    parent_task_id: z.string().uuid().optional(),
    related_task_ids: z.array(z.string().uuid()).default([]),

    created_by: z.string().uuid(),
    updated_by: z.string().uuid().optional(),
});

// Esquema para creación de tarea
export const CreateTaskSchema = TaskSchema.omit({
    id: true,
    task_number: true,
    created_at: true,
    updated_at: true,
    deleted_at: true,
    total_time_spent: true,
    last_time_tracked_at: true,
}).extend({
    workspace_id: z.string().uuid(),
    board_id: z.string().uuid(),
    title: z.string().min(1).max(500),
});

// Esquema para actualización de tarea
export const UpdateTaskSchema = CreateTaskSchema.partial();

// Tipos inferidos
export type Task = z.infer<typeof TaskSchema>;
export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>;