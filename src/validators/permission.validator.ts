import { z } from "zod";

// Permission validation schemas
export const createPermissionSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Permission name is required"),
    description: z.string().optional(),
  }),
});

export const updatePermissionSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Permission name is required").optional(),
    description: z.string().optional(),
  }),
  params: z.object({
    id: z.number().int().positive("Permission ID must be a positive number"),
  }),
});

export const assignPermissionsSchema = z.object({
  body: z.object({
    permissionIds: z.array(
      z.number().int().positive("Permission ID must be a positive number")
    ),
  }),
  params: z.object({
    roleId: z.number().int().positive("Role ID must be a positive number"),
  }),
});
