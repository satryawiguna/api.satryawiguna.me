import { z } from "zod";

// Role validation schemas
export const createRoleSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Role name is required"),
    description: z.string().optional(),
  }),
});

export const updateRoleSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Role name is required").optional(),
    description: z.string().optional(),
  }),
  params: z.object({
    id: z.number().int().positive("Role ID must be a positive number"),
  }),
});

export const assignRolesSchema = z.object({
  body: z.object({
    roleIds: z.array(
      z.number().int().positive("Role ID must be a positive number")
    ),
  }),
  params: z.object({
    userId: z.string().uuid("Invalid UUID format"),
  }),
});
