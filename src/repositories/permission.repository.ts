import prisma from "../database/client";
import { Permission } from "@prisma/client";

// Permission Repository
export const permissionRepository = {
  // Find a permission by ID
  async findById(id: number): Promise<Permission | null> {
    return prisma.permission.findUnique({
      where: { id },
    });
  },

  // Find a permission by name
  async findByName(name: string): Promise<Permission | null> {
    return prisma.permission.findUnique({
      where: { name },
    });
  },

  // Create a new permission
  async create(data: {
    name: string;
    description?: string;
  }): Promise<Permission> {
    return prisma.permission.create({
      data,
    });
  },

  // Update a permission by ID
  async update(
    id: number,
    data: Partial<{
      name: string;
      description: string;
    }>
  ): Promise<Permission> {
    return prisma.permission.update({
      where: { id },
      data,
    });
  },

  // Delete a permission by ID
  async delete(id: number): Promise<Permission> {
    return prisma.permission.delete({
      where: { id },
    });
  },

  // List all permissions
  async findAll(): Promise<Permission[]> {
    return prisma.permission.findMany({
      orderBy: {
        name: "asc",
      },
    });
  },

  // Get all permissions for a user through their roles
  async getUserPermissions(userId: string): Promise<Permission[]> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) return [];

    // Collect unique permissions from all roles
    const permissionsMap = new Map<number, Permission>();

    user.userRoles.forEach((ur) => {
      ur.role.rolePermissions.forEach((rp) => {
        permissionsMap.set(rp.permission.id, rp.permission);
      });
    });

    return Array.from(permissionsMap.values());
  },
};
