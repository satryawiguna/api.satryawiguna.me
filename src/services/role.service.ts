import { roleRepository, permissionRepository } from "../repositories";
import { AppError } from "../utils";

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
