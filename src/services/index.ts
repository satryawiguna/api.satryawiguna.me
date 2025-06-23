import { v4 as uuidv4 } from "uuid";
import {
  userRepository,
  roleRepository,
  permissionRepository,
} from "../repositories";
import {
  hashPassword,
  comparePasswords,
  generateToken,
  AppError,
  verifyToken,
} from "../utils";
import { sendEmail, emailTemplates } from "../utils/email";
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  TokenResponse,
} from "../types";
import config from "../config/env.config";

// Auth Service
export const authService = {
  // Register a new user
  async register(data: RegisterRequest): Promise<AuthResponse> {
    // Check if email is already taken
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new AppError("Email already in use", 400);
    }

    // Hash password
    const hashedPassword = await hashPassword(data.password);

    // Create user with UUID
    const user = await userRepository.create({
      id: uuidv4(),
      email: data.email,
      password: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
    });

    // Find the default role (e.g., STAFF)
    const defaultRole = await roleRepository.findByName("STAFF");
    if (!defaultRole) {
      throw new AppError("Default role not found", 500);
    }

    // Assign the default role to the user
    await userRepository.assignRoles(user.id, [defaultRole.id]);

    // Send welcome email
    const welcomeTemplate = emailTemplates.welcome(data.firstName);
    await sendEmail(data.email, welcomeTemplate.subject, welcomeTemplate.html);

    // Get user roles and permissions for token
    const roles = await userRepository.getUserRoles(user.id);
    const roleNames = roles.map((role) => role.name);

    // Get permissions
    const permissions = await permissionRepository.getUserPermissions(user.id);
    const permissionNames = permissions.map((permission) => permission.name);

    // Generate tokens
    const accessToken = generateToken({
      userId: user.id,
      email: user.email,
      roles: roleNames,
      permissions: permissionNames,
    });

    const refreshToken = generateToken(
      {
        userId: user.id,
        email: user.email,
        roles: roleNames,
        permissions: permissionNames,
      },
      config.JWT_REFRESH_EXPIRES_IN,
      config.JWT_REFRESH_SECRET
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      accessToken,
      refreshToken,
    };
  },

  // Login user
  async login(data: LoginRequest): Promise<AuthResponse> {
    // Find user
    const user = await userRepository.findByEmail(data.email);

    // Check if user exists
    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    // Verify password
    const isPasswordValid = await comparePasswords(
      data.password,
      user.password
    );
    if (!isPasswordValid) {
      throw new AppError("Invalid email or password", 401);
    }

    // Get user roles and permissions for token
    const roles = await userRepository.getUserRoles(user.id);
    const roleNames = roles.map((role) => role.name);

    // Get permissions
    const permissions = await permissionRepository.getUserPermissions(user.id);
    const permissionNames = permissions.map((permission) => permission.name);

    // Generate tokens
    const accessToken = generateToken({
      userId: user.id,
      email: user.email,
      roles: roleNames,
      permissions: permissionNames,
    });

    const refreshToken = generateToken(
      {
        userId: user.id,
        email: user.email,
        roles: roleNames,
        permissions: permissionNames,
      },
      config.JWT_REFRESH_EXPIRES_IN,
      config.JWT_REFRESH_SECRET
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      accessToken,
      refreshToken,
    };
  },

  // Refresh token
  async refreshToken(token: string): Promise<TokenResponse> {
    try {
      // Verify refresh token
      const decoded = verifyToken(token, config.JWT_REFRESH_SECRET);

      // Find user
      const user = await userRepository.findById(decoded.userId);
      if (!user) {
        throw new AppError("User not found", 404);
      }

      // Get user roles and permissions for token
      const roles = await userRepository.getUserRoles(user.id);
      const roleNames = roles.map((role) => role.name);

      // Get permissions
      const permissions = await permissionRepository.getUserPermissions(
        user.id
      );
      const permissionNames = permissions.map((permission) => permission.name);

      // Generate new tokens
      const accessToken = generateToken({
        userId: user.id,
        email: user.email,
        roles: roleNames,
        permissions: permissionNames,
      });

      const refreshToken = generateToken(
        {
          userId: user.id,
          email: user.email,
          roles: roleNames,
          permissions: permissionNames,
        },
        config.JWT_REFRESH_EXPIRES_IN,
        config.JWT_REFRESH_SECRET
      );

      return {
        accessToken,
        refreshToken,
      };
    } catch (error) {
      throw new AppError("Invalid or expired refresh token", 401);
    }
  },

  // Forgot Password
  async forgotPassword(data: ForgotPasswordRequest): Promise<boolean> {
    // Find user
    const user = await userRepository.findByEmail(data.email);
    if (!user) {
      // For security reasons, still return success even if the email doesn't exist
      return true;
    }

    // Generate reset token (valid for 1 hour)
    const resetToken = generateToken(
      { userId: user.id, email: user.email, roles: [], permissions: [] },
      "1h"
    );

    // Update user with reset token
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1);

    await userRepository.update(user.id, {
      resetToken,
      resetTokenExpiry,
    });

    // Send password reset email
    const resetTemplate = emailTemplates.resetPassword(resetToken);
    await sendEmail(user.email, resetTemplate.subject, resetTemplate.html);

    return true;
  },

  // Reset Password
  async resetPassword(data: ResetPasswordRequest): Promise<boolean> {
    try {
      // Verify token
      const decoded = verifyToken(data.token);

      // Find user
      const user = await userRepository.findById(decoded.userId);
      if (!user) {
        throw new AppError("User not found", 404);
      }

      // Check if reset token matches and hasn't expired
      if (
        user.resetToken !== data.token ||
        !user.resetTokenExpiry ||
        user.resetTokenExpiry < new Date()
      ) {
        throw new AppError("Invalid or expired reset token", 400);
      }

      // Hash new password
      const hashedPassword = await hashPassword(data.password);

      // Update user's password and clear reset token
      await userRepository.update(user.id, {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      });

      return true;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Invalid or expired reset token", 400);
    }
  },
};

// User Service
export const userService = {
  // Get user by ID
  async getUserById(id: string) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Remove sensitive information
    const { password, resetToken, resetTokenExpiry, ...userData } = user;

    return userData;
  },

  // Update user
  async updateUser(
    id: string,
    data: {
      firstName?: string;
      lastName?: string;
      email?: string;
    }
  ) {
    // Check if email is being updated and if it's already in use
    if (data.email) {
      const existingUser = await userRepository.findByEmail(data.email);
      if (existingUser && existingUser.id !== id) {
        throw new AppError("Email already in use", 400);
      }
    }

    const updatedUser = await userRepository.update(id, data);

    // Remove sensitive information
    const { password, resetToken, resetTokenExpiry, ...userData } = updatedUser;

    return userData;
  },

  // Get all users with pagination
  async getAllUsers(page: number = 1, limit: number = 10) {
    const users = await userRepository.findAll(page, limit);
    const total = await userRepository.countAll();

    // Remove sensitive information
    const sanitizedUsers = users.map((user) => {
      const { password, resetToken, resetTokenExpiry, ...userData } = user;
      return userData;
    });

    return {
      users: sanitizedUsers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  // Delete user
  async deleteUser(id: string) {
    await userRepository.delete(id);
    return { success: true };
  },

  // Get user roles
  async getUserRoles(userId: string) {
    const roles = await userRepository.getUserRoles(userId);
    return { roles };
  },

  // Assign roles to user
  async assignRolesToUser(userId: string, roleIds: number[]) {
    // Verify user exists
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Verify all roles exist
    for (const roleId of roleIds) {
      const role = await roleRepository.findById(roleId);
      if (!role) {
        throw new AppError(`Role with ID ${roleId} not found`, 404);
      }
    }

    const result = await userRepository.assignRoles(userId, roleIds);
    return {
      success: true,
      assignedCount: result.count,
    };
  },
};

// Role Service
export const roleService = {
  // Create role
  async createRole(data: { name: string; description?: string }) {
    // Check if role already exists
    const existingRole = await roleRepository.findByName(data.name);
    if (existingRole) {
      throw new AppError("Role with this name already exists", 400);
    }

    const role = await roleRepository.create(data);
    return role;
  },

  // Get role by ID
  async getRoleById(id: number) {
    const role = await roleRepository.findById(id);
    if (!role) {
      throw new AppError("Role not found", 404);
    }

    return role;
  },

  // Update role
  async updateRole(id: number, data: { name?: string; description?: string }) {
    // Check if role exists
    const role = await roleRepository.findById(id);
    if (!role) {
      throw new AppError("Role not found", 404);
    }

    // If updating name, check if the new name already exists
    if (data.name && data.name !== role.name) {
      const existingRole = await roleRepository.findByName(data.name);
      if (existingRole) {
        throw new AppError("Role with this name already exists", 400);
      }
    }

    const updatedRole = await roleRepository.update(id, data);
    return updatedRole;
  },

  // Delete role
  async deleteRole(id: number) {
    // Check if role exists
    const role = await roleRepository.findById(id);
    if (!role) {
      throw new AppError("Role not found", 404);
    }

    // Cannot delete core system roles
    const systemRoles = ["ADMIN", "STAFF", "DEVELOPER"];
    if (systemRoles.includes(role.name)) {
      throw new AppError("Cannot delete system roles", 403);
    }

    await roleRepository.delete(id);
    return { success: true };
  },

  // Get all roles
  async getAllRoles() {
    const roles = await roleRepository.findAll();
    return { roles };
  },

  // Get role permissions
  async getRolePermissions(roleId: number) {
    // Check if role exists
    const role = await roleRepository.findById(roleId);
    if (!role) {
      throw new AppError("Role not found", 404);
    }

    const permissions = await roleRepository.getRolePermissions(roleId);
    return { permissions };
  },

  // Assign permissions to role
  async assignPermissionsToRole(roleId: number, permissionIds: number[]) {
    // Check if role exists
    const role = await roleRepository.findById(roleId);
    if (!role) {
      throw new AppError("Role not found", 404);
    }

    // Verify all permissions exist
    for (const permId of permissionIds) {
      const permission = await permissionRepository.findById(permId);
      if (!permission) {
        throw new AppError(`Permission with ID ${permId} not found`, 404);
      }
    }

    const result = await roleRepository.assignPermissions(
      roleId,
      permissionIds
    );
    return {
      success: true,
      assignedCount: result.count,
    };
  },
};

// Permission Service
export const permissionService = {
  // Create permission
  async createPermission(data: { name: string; description?: string }) {
    // Check if permission already exists
    const existingPermission = await permissionRepository.findByName(data.name);
    if (existingPermission) {
      throw new AppError("Permission with this name already exists", 400);
    }

    const permission = await permissionRepository.create(data);
    return permission;
  },

  // Get permission by ID
  async getPermissionById(id: number) {
    const permission = await permissionRepository.findById(id);
    if (!permission) {
      throw new AppError("Permission not found", 404);
    }

    return permission;
  },

  // Update permission
  async updatePermission(
    id: number,
    data: { name?: string; description?: string }
  ) {
    // Check if permission exists
    const permission = await permissionRepository.findById(id);
    if (!permission) {
      throw new AppError("Permission not found", 404);
    }

    // If updating name, check if the new name already exists
    if (data.name && data.name !== permission.name) {
      const existingPermission = await permissionRepository.findByName(
        data.name
      );
      if (existingPermission) {
        throw new AppError("Permission with this name already exists", 400);
      }
    }

    const updatedPermission = await permissionRepository.update(id, data);
    return updatedPermission;
  },

  // Delete permission
  async deletePermission(id: number) {
    // Check if permission exists
    const permission = await permissionRepository.findById(id);
    if (!permission) {
      throw new AppError("Permission not found", 404);
    }

    // Cannot delete core system permissions
    const systemPermissions = [
      "READ_USER",
      "CREATE_USER",
      "UPDATE_USER",
      "DELETE_USER",
      "READ_ROLE",
      "ACCESS_SWAGGER",
    ];

    if (systemPermissions.includes(permission.name)) {
      throw new AppError("Cannot delete system permissions", 403);
    }

    await permissionRepository.delete(id);
    return { success: true };
  },

  // Get all permissions
  async getAllPermissions() {
    const permissions = await permissionRepository.findAll();
    return { permissions };
  },
};
