import prisma from "../database/client";
import { User, Role, Permission } from "@prisma/client";
import { UserWithRoles } from "../types";

// User Repository
export const userRepository = {
  // Find a user by ID with their roles
  async findById(id: string): Promise<UserWithRoles | null> {
    return prisma.user.findUnique({
      where: { id },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });
  },

  // Find a user by email with their roles
  async findByEmail(email: string): Promise<UserWithRoles | null> {
    return prisma.user.findUnique({
      where: { email },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });
  },

  // Create a new user
  async create(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<User> {
    return prisma.user.create({
      data,
    });
  },

  // Update a user by ID
  async update(
    id: string,
    data: Partial<{
      email: string;
      firstName: string;
      lastName: string;
      password: string;
      isEmailVerified: boolean;
      resetToken: string | null;
      resetTokenExpiry: Date | null;
    }>
  ): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  },

  // Delete a user by ID
  async delete(id: string): Promise<User> {
    return prisma.user.delete({
      where: { id },
    });
  },

  // List all users with pagination
  async findAll(page: number = 1, limit: number = 10): Promise<User[]> {
    const skip = (page - 1) * limit;

    return prisma.user.findMany({
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  // Count total users
  async countAll(): Promise<number> {
    return prisma.user.count();
  },

  // Get user roles
  async getUserRoles(userId: string): Promise<Role[]> {
    const userWithRoles = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!userWithRoles) return [];
    return userWithRoles.userRoles.map((ur) => ur.role);
  },

  // Assign roles to a user
  async assignRoles(
    userId: string,
    roleIds: number[]
  ): Promise<{ count: number }> {
    // First remove existing roles
    await prisma.userRole.deleteMany({
      where: { userId },
    });

    // Then create new role assignments
    const userRoles = roleIds.map((roleId) => ({
      userId,
      roleId,
    }));

    await prisma.userRole.createMany({
      data: userRoles,
    });

    return { count: roleIds.length };
  },
};

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
