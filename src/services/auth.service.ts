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
