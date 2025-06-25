import { userRepository, roleRepository } from "../repositories";
import { AppError } from "../utils";

// User Service
export const userService = {
  // Get user by ID
  async getUserById(id: string) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Remove sensitive information
    const { password, resetToken, resetTokenExpiry, ...userData } = user;

    return userData;
  },

  // Update user
  async updateUser(
    id: string,
    data: {
      firstName?: string;
      lastName?: string;
      email?: string;
    }
  ) {
    // Check if email is being updated and if it's already in use
    if (data.email) {
      const existingUser = await userRepository.findByEmail(data.email);
      if (existingUser && existingUser.id !== id) {
        throw new AppError("Email already in use", 400);
      }
    }

    const updatedUser = await userRepository.update(id, data);

    // Remove sensitive information
    const { password, resetToken, resetTokenExpiry, ...userData } = updatedUser;

    return userData;
  },

  // Get all users with pagination
  async getAllUsers(page: number = 1, limit: number = 10) {
    const users = await userRepository.findAll(page, limit);
    const total = await userRepository.countAll();

    // Remove sensitive information
    const sanitizedUsers = users.map((user) => {
      const { password, resetToken, resetTokenExpiry, ...userData } = user;
      return userData;
    });

    return {
      users: sanitizedUsers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  // Delete user
  async deleteUser(id: string) {
    await userRepository.delete(id);
    return { success: true };
  },

  // Get user roles
  async getUserRoles(userId: string) {
    const roles = await userRepository.getUserRoles(userId);
    return { roles };
  },

  // Assign roles to user
  async assignRolesToUser(userId: string, roleIds: number[]) {
    // Verify user exists
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Verify all roles exist
    for (const roleId of roleIds) {
      const role = await roleRepository.findById(roleId);
      if (!role) {
        throw new AppError(`Role with ID ${roleId} not found`, 404);
      }
    }

    const result = await userRepository.assignRoles(userId, roleIds);
    return {
      success: true,
      assignedCount: result.count,
    };
  },
};
