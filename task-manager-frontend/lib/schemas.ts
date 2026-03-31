import { type Priority, type TaskStatus } from "@/lib/types";
import { z } from "zod";

// ── Enums ────────────────────────────────────────────────────────────────────
export const taskStatusEnum = z.enum([
  "todo",
  "in_progress",
  "in_review",
  "done",
] as const);
export const priorityEnum = z.enum([
  "low",
  "medium",
  "high",
  "urgent",
] as const);

// ── Login ────────────────────────────────────────────────────────────────────
// Opción 2: Con transformación para limpiar el valor
const companySlugSchema = z
  .string()
  .min(3, "El slug debe tener al menos 3 caracteres")
  .max(50, "El slug no puede exceder 50 caracteres")
  .transform((val) => {
    const slug = val
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/^-+|-+$/g, "");
    // Convertir a minúsculas, reemplazar espacios por guiones y eliminar caracteres no permitidos
    return slug
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-") // Reemplazar espacios por guiones
      .replace(/[^a-z0-9-]/g, "") // Eliminar caracteres no permitidos
      .replace(/^-+|-+$/g, ""); // Eliminar guiones al inicio o final
  })
  .refine(
    (val) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(val),
    "El slug debe contener solo letras minúsculas, números y guiones, sin guiones al inicio o final",
  );

export const RegisterSchema = z.object({
  fullName: z
    .string()
    .min(5, "Nombre es requerido")
    .max(100, "Nombre demasiado largo"),
  email: z
    .string()
    .min(1, "Email es requerido")
    .email("Ingrese un email válido"),
  password: z
    .string()
    .min(8, "Contraseña es requerida")
    .max(10, "Contraseña demasiado larga"),
  companyName: z
    .string()
    .min(1, "Nombre de la empresa es requerido")
    .max(100, "Nombre de la empresa demasiado largo"),
  companySlug: companySlugSchema,
});
export type RegisterInput = z.infer<typeof RegisterSchema>;

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email es requerido")
    .email("Ingrese un email válido"),
  password: z
    .string()
    .min(8, "Contraseña es requerida")
    .max(10, "Contraseña demasiado larga"),
  companySlug: companySlugSchema,
});
export type LoginInput = z.infer<typeof loginSchema>;

// ── Task ─────────────────────────────────────────────────────────────────────
export const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(500, "Title must be at most 500 characters"),
  description: z.string().max(5000, "Description too long").optional(),
  status: taskStatusEnum,
  priority: priorityEnum,
  assigneeId: z.string().uuid("Invalid assignee").optional().or(z.literal("")),
  workspaceId: z.string().uuid("Invalid workspace"),
  dueDate: z.string().optional(),
  tags: z
    .array(z.string().max(50, "Tag must be at most 50 characters"))
    .max(20, "Too many tags")
    .optional()
    .default([]),
});
export type CreateTaskFormInput = z.infer<typeof createTaskSchema>;

export const updateTaskSchema = createTaskSchema
  .partial()
  .omit({ workspaceId: true });
export type UpdateTaskFormInput = z.infer<typeof updateTaskSchema>;

// ── Profile ──────────────────────────────────────────────────────────────────
export const profileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  email: z.string().email("Enter a valid email"),
});
export type ProfileInput = z.infer<typeof profileSchema>;

// ── Helpers ──────────────────────────────────────────────────────────────────
export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  in_review: "In Review",
  done: "Done",
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export const STATUS_ORDER: TaskStatus[] = [
  "todo",
  "in_progress",
  "in_review",
  "done",
];

export const PRIORITY_COLORS: Record<Priority, string> = {
  low: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  medium: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  high: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
  urgent: "bg-red-500/10 text-red-700 dark:text-red-400",
};

export const STATUS_COLORS: Record<TaskStatus, string> = {
  todo: "bg-slate-500/10 text-slate-700 dark:text-slate-400",
  in_progress: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  in_review: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
  done: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
};

export const STATUS_DOT_COLORS: Record<TaskStatus, string> = {
  todo: "bg-slate-500",
  in_progress: "bg-blue-500",
  in_review: "bg-purple-500",
  done: "bg-emerald-500",
};
