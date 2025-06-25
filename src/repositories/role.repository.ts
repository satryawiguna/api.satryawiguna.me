import prisma from "../database/client";
import { Role, Permission } from "@prisma/client";

// Role Repository
export const roleRepository = {
  // Find a role by ID
  async findById(id: number): Promise<Role | null> {
    return prisma.role.findUnique({
      where: { id },
    });
  },

  // Find a role by name
  async findByName(name: string): Promise<Role | null> {
    return prisma.role.findUnique({
      where: { name },
    });
  },

  // Create a new role
  async create(data: { name: string; description?: string }): Promise<Role> {
    return prisma.role.create({
      data,
    });
  },

  // Update a role by ID
  async update(
    id: number,
    data: Partial<{
      name: string;
      description: string;
    }>
  ): Promise<Role> {
    return prisma.role.update({
      where: { id },
      data,
    });
  },

  // Delete a role by ID
  async delete(id: number): Promise<Role> {
    return prisma.role.delete({
      where: { id },
    });
  },

  // List all roles
  async findAll(): Promise<Role[]> {
    return prisma.role.findMany({
      orderBy: {
        name: "asc",
      },
    });
  },

  // Get role permissions
  async getRolePermissions(roleId: number): Promise<Permission[]> {
    const role = await prisma.role.findUnique({
      where: { id: roleId },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (!role) return [];
    return role.rolePermissions.map((rp) => rp.permission);
  },

  // Assign permissions to a role
  async assignPermissions(
    roleId: number,
    permissionIds: number[]
  ): Promise<{ count: number }> {
    // First remove existing permissions
    await prisma.rolePermission.deleteMany({
      where: { roleId },
    });

    // Then create new permission assignments
    const rolePermissions = permissionIds.map((permissionId) => ({
      roleId,
      permissionId,
    }));

    await prisma.rolePermission.createMany({
      data: rolePermissions,
    });

    return { count: permissionIds.length };
  },
};
