import { Request, Response } from "express";
import { roleService } from "../services";
import { catchAsync } from "../utils";

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
