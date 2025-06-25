import { permissionRepository } from "../repositories";
import { AppError } from "../utils";

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
