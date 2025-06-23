import { z } from "zod";

// User validation schemas
export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  }),
});

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character"
      ),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, "Token is required"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character"
      ),
  }),
});

export const updateUserSchema = z.object({
  body: z.object({
    firstName: z.string().min(1, "First name is required").optional(),
    lastName: z.string().min(1, "Last name is required").optional(),
    email: z.string().email("Invalid email format").optional(),
  }),
  params: z.object({
    id: z.string().uuid("Invalid UUID format"),
  }),
});

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

// Role-Permission assignment schema
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

// User-Role assignment schema
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
