import { z } from 'zod';

export const UserSchema = z.object({
    id: z.string().uuid(),
    company_id: z.string().uuid(),

    email: z.string().email(),
    email_verified: z.boolean().default(false),
    password_hash: z.string(),
    full_name: z.string().optional(),
    avatar_url: z.string().url().optional(),

    role: z.enum(['owner', 'admin', 'manager', 'member', 'viewer']).default('member'),
    permissions: z.array(z.string()).default([]),

    is_active: z.boolean().default(true),
    is_onboarded: z.boolean().default(false),

    created_at: z.date(),
    updated_at: z.date(),
    deleted_at: z.date().optional(),
});

export const CreateUserSchema = UserSchema.omit({
    id: true,
    created_at: true,
    updated_at: true,
    deleted_at: true,
    email_verified: true,
    is_onboarded: true,
}).extend({
    password: z.string().min(8),
    company_id: z.string().uuid(),
});

export type User = z.infer<typeof UserSchema>;
export type CreateUserInput = z.infer<typeof CreateUserSchema>;