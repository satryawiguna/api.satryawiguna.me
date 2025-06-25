import { Request, Response } from "express";
import { userService } from "../services";
import { catchAsync } from "../utils";

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
