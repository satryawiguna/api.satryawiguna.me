import prisma from "../database/client";
import { User, Role } from "@prisma/client";
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
