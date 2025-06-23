import { Request, Response } from "express";
import {
  authService,
  userService,
  roleService,
  permissionService,
} from "../services";
import { catchAsync } from "../utils";
import { AuthenticatedRequest } from "../types";

// Auth Controller
export const authController = {
  // Register a new user
  register: catchAsync(async (req: Request, res: Response) => {
    const result = await authService.register(req.body);
    res.status(201).json({
      status: "success",
      data: result,
    });
  }),

  // Login a user
  login: catchAsync(async (req: Request, res: Response) => {
    const result = await authService.login(req.body);
    res.status(200).json({
      status: "success",
      data: result,
    });
  }),

  // Refresh token
  refreshToken: catchAsync(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({
        status: "error",
        message: "Refresh token is required",
      });
    }

    const result = await authService.refreshToken(refreshToken);
    res.status(200).json({
      status: "success",
      data: result,
    });
  }),

  // Forgot password
  forgotPassword: catchAsync(async (req: Request, res: Response) => {
    await authService.forgotPassword(req.body);
    // Always return success for security reasons
    res.status(200).json({
      status: "success",
      message: "If the email exists, a password reset link has been sent",
    });
  }),

  // Reset password
  resetPassword: catchAsync(async (req: Request, res: Response) => {
    await authService.resetPassword(req.body);
    res.status(200).json({
      status: "success",
      message: "Password has been reset successfully",
    });
  }),

  // Get user profile
  getProfile: catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        status: "error",
        message: "Not authenticated",
      });
    }

    const user = await userService.getUserById(req.user.userId);
    res.status(200).json({
      status: "success",
      data: {
        user,
        roles: req.user.roles,
        permissions: req.user.permissions,
      },
    });
  }),
};

// User Controller
export const userController = {
  // Get all users
  getAllUsers: catchAsync(async (req: Request, res: Response) => {
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit
      ? parseInt(req.query.limit as string, 10)
      : 10;

    const result = await userService.getAllUsers(page, limit);
    res.status(200).json({
      status: "success",
      data: result,
    });
  }),

  // Get user by ID
  getUserById: catchAsync(async (req: Request, res: Response) => {
    const user = await userService.getUserById(req.params.id);
    res.status(200).json({
      status: "success",
      data: { user },
    });
  }),

  // Update user
  updateUser: catchAsync(async (req: Request, res: Response) => {
    const updatedUser = await userService.updateUser(req.params.id, req.body);
    res.status(200).json({
      status: "success",
      data: { user: updatedUser },
    });
  }),

  // Delete user
  deleteUser: catchAsync(async (req: Request, res: Response) => {
    await userService.deleteUser(req.params.id);
    res.status(200).json({
      status: "success",
      message: "User deleted successfully",
    });
  }),

  // Get user roles
  getUserRoles: catchAsync(async (req: Request, res: Response) => {
    const result = await userService.getUserRoles(req.params.id);
    res.status(200).json({
      status: "success",
      data: result,
    });
  }),

  // Assign roles to user
  assignRolesToUser: catchAsync(async (req: Request, res: Response) => {
    const { roleIds } = req.body;
    const result = await userService.assignRolesToUser(req.params.id, roleIds);
    res.status(200).json({
      status: "success",
      data: result,
    });
  }),
};

// Role Controller
export const roleController = {
  // Create role
  createRole: catchAsync(async (req: Request, res: Response) => {
    const role = await roleService.createRole(req.body);
    res.status(201).json({
      status: "success",
      data: { role },
    });
  }),

  // Get all roles
  getAllRoles: catchAsync(async (req: Request, res: Response) => {
    const result = await roleService.getAllRoles();
    res.status(200).json({
      status: "success",
      data: result,
    });
  }),

  // Get role by ID
  getRoleById: catchAsync(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const role = await roleService.getRoleById(id);
    res.status(200).json({
      status: "success",
      data: { role },
    });
  }),

  // Update role
  updateRole: catchAsync(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const updatedRole = await roleService.updateRole(id, req.body);
    res.status(200).json({
      status: "success",
      data: { role: updatedRole },
    });
  }),

  // Delete role
  deleteRole: catchAsync(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    await roleService.deleteRole(id);
    res.status(200).json({
      status: "success",
      message: "Role deleted successfully",
    });
  }),

  // Get role permissions
  getRolePermissions: catchAsync(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const result = await roleService.getRolePermissions(id);
    res.status(200).json({
      status: "success",
      data: result,
    });
  }),

  // Assign permissions to role
  assignPermissionsToRole: catchAsync(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const { permissionIds } = req.body;
    const result = await roleService.assignPermissionsToRole(id, permissionIds);
    res.status(200).json({
      status: "success",
      data: result,
    });
  }),
};

// Permission Controller
export const permissionController = {
  // Create permission
  createPermission: catchAsync(async (req: Request, res: Response) => {
    const permission = await permissionService.createPermission(req.body);
    res.status(201).json({
      status: "success",
      data: { permission },
    });
  }),

  // Get all permissions
  getAllPermissions: catchAsync(async (req: Request, res: Response) => {
    const result = await permissionService.getAllPermissions();
    res.status(200).json({
      status: "success",
      data: result,
    });
  }),

  // Get permission by ID
  getPermissionById: catchAsync(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const permission = await permissionService.getPermissionById(id);
    res.status(200).json({
      status: "success",
      data: { permission },
    });
  }),

  // Update permission
  updatePermission: catchAsync(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const updatedPermission = await permissionService.updatePermission(
      id,
      req.body
    );
    res.status(200).json({
      status: "success",
      data: { permission: updatedPermission },
    });
  }),

  // Delete permission
  deletePermission: catchAsync(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    await permissionService.deletePermission(id);
    res.status(200).json({
      status: "success",
      message: "Permission deleted successfully",
    });
  }),
};
