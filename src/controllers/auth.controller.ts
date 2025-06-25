import { Request, Response } from "express";
import { authService, userService } from "../services";
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
