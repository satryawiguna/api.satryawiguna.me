import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

async function seedRoles() {
  const roles = [
    { name: "ADMIN", description: "Administrator with all privileges" },
    { name: "STAFF", description: "Staff member with limited privileges" },
    {
      name: "DEVELOPER",
      description: "Developer with access to technical resources",
    },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
  }

  console.log("✅ Roles seeded successfully");
}

async function seedPermissions() {
  const permissions = [
    { name: "READ_USER", description: "Can read user data" },
    { name: "CREATE_USER", description: "Can create users" },
    { name: "UPDATE_USER", description: "Can update user data" },
    { name: "DELETE_USER", description: "Can delete users" },
    { name: "READ_ROLE", description: "Can read role data" },
    { name: "CREATE_ROLE", description: "Can create roles" },
    { name: "UPDATE_ROLE", description: "Can update role data" },
    { name: "DELETE_ROLE", description: "Can delete roles" },
    { name: "READ_PERMISSION", description: "Can read permission data" },
    { name: "CREATE_PERMISSION", description: "Can create permissions" },
    { name: "UPDATE_PERMISSION", description: "Can update permission data" },
    { name: "DELETE_PERMISSION", description: "Can delete permissions" },
    { name: "ACCESS_SWAGGER", description: "Can access API documentation" },
  ];

  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { name: permission.name },
      update: {},
      create: permission,
    });
  }

  console.log("✅ Permissions seeded successfully");
}

async function assignPermissionsToRoles() {
  // Get all roles
  const adminRole = await prisma.role.findUnique({ where: { name: "ADMIN" } });
  const staffRole = await prisma.role.findUnique({ where: { name: "STAFF" } });
  const developerRole = await prisma.role.findUnique({
    where: { name: "DEVELOPER" },
  });

  if (!adminRole || !staffRole || !developerRole) {
    throw new Error("Required roles not found");
  }

  // Get all permissions
  const allPermissions = await prisma.permission.findMany();
  const permissionMap = new Map(allPermissions.map((p) => [p.name, p.id]));

  // Admin gets all permissions
  for (const permission of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: permission.id,
      },
    });
  }

  // Staff gets basic read permissions
  const staffPermissions = ["READ_USER", "READ_ROLE", "READ_PERMISSION"];
  for (const permName of staffPermissions) {
    const permId = permissionMap.get(permName);
    if (permId) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: staffRole.id,
            permissionId: permId,
          },
        },
        update: {},
        create: {
          roleId: staffRole.id,
          permissionId: permId,
        },
      });
    }
  }

  // Developer gets read permissions plus swagger access
  const devPermissions = [
    "READ_USER",
    "READ_ROLE",
    "READ_PERMISSION",
    "ACCESS_SWAGGER",
  ];
  for (const permName of devPermissions) {
    const permId = permissionMap.get(permName);
    if (permId) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: developerRole.id,
            permissionId: permId,
          },
        },
        update: {},
        create: {
          roleId: developerRole.id,
          permissionId: permId,
        },
      });
    }
  }

  console.log("✅ Role permissions assigned successfully");
}

async function seedAdminUser() {
  const adminRole = await prisma.role.findUnique({ where: { name: "ADMIN" } });
  if (!adminRole) throw new Error("Admin role not found");

  // Create admin user
  const hashedPassword = await bcrypt.hash("Admin@123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      id: uuidv4(),
      email: "admin@example.com",
      password: hashedPassword,
      firstName: "Admin",
      lastName: "User",
      isEmailVerified: true,
    },
  });

  // Assign admin role
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: admin.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: admin.id,
      roleId: adminRole.id,
    },
  });

  console.log("✅ Admin user seeded successfully");
}

async function main() {
  try {
    console.log("🌱 Starting database seeding...");

    await seedRoles();
    await seedPermissions();
    await assignPermissionsToRoles();
    await seedAdminUser();

    console.log("✅ Database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
