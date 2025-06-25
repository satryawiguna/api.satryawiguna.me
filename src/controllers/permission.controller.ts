import { Request, Response } from "express";
import { permissionService } from "../services";
import { catchAsync } from "../utils";

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
